/* 
Copyright (C) 2012 Thomas Lekanger

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var net = require('net'),
	util = require('util'),
	event = require('./Event');
var Parser = require('./Parser');
var Channel = require('./Channel');
var FloodProtection = require('./FloodProtection');
var Server = function(server, port, irc){
	var self = this;
	if(server){
		self.server = server;
	}
	if(port){
		self.port = port;
	}else{
		self.port = 6667;
	}
	if(irc){
		self.irc = irc;
	}
	if(irc.event){
		self.event = irc.event;
	}
	self.userNick = '';
	self.socket = new net.Socket;
	self.channels = {};
	
	/* Flood protection */
	self.FloodProtection = new FloodProtection(self, 250, 750);
};
Server.prototype = {
	connect: function(){
		var self = this,
			serverKey = 0,
			backlog = '',
			parser = new Parser(self, self.socket, self.event);
		self.socket.on('connect', function(){
			self.log('Connected to ' + self.server + ':' + self.port);
		});
		self.socket.on('data', function(data){
			backlog += data;
			var n = backlog.indexOf('\n');
			// got a \n? emit one or more 'line' events
			while(~n){
				self.socket.emit('line', backlog.substring(0, n));
				backlog = backlog.substring(n + 1);
				n = backlog.indexOf('\n');
			}
		});
		self.socket.on('line', function(line){
			try{
				parser.parse(line);
			}catch(e){
				console.log(e);
			}
		});
		self.socket.on('close', function(){
			// Reconnect
		});
		
		self.socket.setEncoding('utf8');
		self.socket.setNoDelay();
		self.socket.connect(self.port, self.server);

		//self.raw 'NICK ' + 'YattaIRC'
		//self.raw 'USER ' + 'yatta' + ' 8 * :' + 'Hiro Nakamura'
		serverKey = Object.keys(self.irc.servers).length;
		self.irc.servers[serverKey] = self;
		
		return serverKey;
	},
	log: function(){
		console.log.apply(this, arguments);
	},
	raw: function(msg){
		var self = this, 
			socket = self.socket,
			time = new Date().getTime();
		self.log('[RAW]', msg);
		
		self.FloodProtection.send(msg);
	},
	pong: function(source){
		var self = this;
		self.raw('PONG ' + source);
	},
	nick: function(nick){
		var self = this;
		self.userNick = nick;
		self.raw('NICK ' + nick);
	},
	user: function(user, mode, realname){
		var self = this;
		self.raw('USER ' + user + ' ' + mode + ' * :' + realname );
	},
	join: function(channel){
		var self = this;
		self.raw('JOIN ' + channel);
	},
	part: function(channel){
		var self = this;
		self.raw('PART ' + channel);
	},
	op: function(channel, user){
		var self = this;
		self.raw('MODE ' + channel + ' +o ' + user);
	},
	deop: function(channel, user){
		var self = this;
		self.raw('MODE ' + channel + ' -o ' + user);
	},
	kick: function(channel, user, message){
		var self = this;
		self.raw('KICK ' + channel + ' ' + user + ' :' + message);
	},
	ban: function(channel, user){
		var self = this;
		self.raw('MODE ' + channel + ' +b ' + user);
	},
	message: function(target, message){
		var self = this;
		self.raw('PRIVMSG ' + target + ' :' + message);
	},
	getChannel: function(channel){
		var self = this;
		if(self.channels && self.channels[channel]){
			return self.channels[channel];
		}
		return null;
	},
	getOrInitiateChannel: function(channel){
		var self = this, c;
		if(channel && self.channels && self.channels[channel]){
			return self.channels[channel];
		}else{
			c = new Channel(self, channel);
			self.channels[channel] = c;
			return c;
		}
	}
};
module.exports = Server;
