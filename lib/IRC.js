/* 
Copyright (C) 2012 Thomas Lekanger

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
// https://gist.github.com/2474199
require('./Util');
var Server = require('./Server'),
	event = require('./Event');
var IRC = function(){
	var self = this;
	self.servers = {};
		
	self.event = new event();
	self.event.on('ping', function(event){
		event.server.pong(event.getPingSource());
	});
	self.event.on('join', function(event){
		var channel = event.server.getOrInitiateChannel(event.channel);
		if(channel && channel.users){
			channel.users[event.source.nick] = event.source.host;
		}
	});
};
IRC.prototype = {
	connect: function(server, port, callback){
		var self = this;
		tmpServer = new Server(server, port, self);
		return tmpServer.connect();
	},
	raw: function(session, msg){
		var self = this;
		if(self.servers && self.servers[session]){
			self.servers[session].raw(msg);
		}
	},
	pong: function(session, target){
		var self = this;
		if(self.servers && self.servers[session]){
			self.servers[session].pong(target);
		}
	},
	nick: function(session, nick){
		var self = this;
		if(self.servers && self.servers[session]){
			self.servers[session].nick(nick);
		}
	},
	user: function(session, user, mode, realname){
		var self = this;
		if(self.servers && self.servers[session]){
			self.servers[session].user(user, mode, realname);
		}
	},
	join: function(session, channel){
		var self = this;
		if(self.servers && self.servers[session]){
			self.servers[session].join(channel);
		}
	},
	part: function(session, channel){
		var self = this;
		if(self.servers && self.servers[session]){
			self.servers[session].part(channel);
		}
	},
	op: function(session, channel, user){
		var self = this;
		if(self.servers && self.servers[session]){
			self.servers[session].op(channel, user);
		}
	},
	deop: function(session, channel, user){
		var self = this;
		if(self.servers && self.servers[session]){
			self.servers[session].deop(channel, user);
		}
	},
	ban: function(session, channel, user){
		var self = this;
		if(self.servers && self.servers[session]){
			self.servers[session].ban(channel, user);
		}
	},
	message : function(session, target, message){
		var self = this;
		if(self.servers && self.servers[session]){
			var server = self.servers[session];
			if(message.indexOf('\n') !== -1){
				var messages = message.split('\n');
				messages.forEach(function(message){
					server.message(target, message);
				});
			}else{
				server.message(target, message);
			}
		}
	}
};
module.exports = IRC;