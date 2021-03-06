/*
Copyright (C) 2014 Thomas Lekanger

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
Source = require('./Source');
// I should create some awesome loader for this
IRCEventParser = require('./parsers/IRCEventParser');
PingPongEventParser = require('./parsers/PingPongEventParser');
JoinEventParser = require('./parsers/JoinEventParser');
KickEventParser = require('./parsers/KickEventParser');
TopicEventParser = require('./parsers/TopicEventParser');
ResponseTopicEventParser = require('./parsers/response/ResponseTopicEventParser');
MessageEventParser = require('./parsers/MessageEventParser');
var splitUntil = function(source, split, u){
	return splitUntilOccurrence(source, split, u, 1);
};
var splitUntilOccurrence = function(source, split, u, occurrence){
	var untilIndex = -u.length;
	for(var i = 0; i < occurrence; i++){
		untilIndex = source.indexOf(u, untilIndex + u.length);
	}
	if(untilIndex <= 0 || untilIndex >= source.length){
		return source.split(split);
	}
	var toSplit = source.substring(0, untilIndex);
	var remainder = source.substring(untilIndex + u.length);
	var splitted = toSplit.split(split);
	var out = [];
	for(var i = 0; i < splitted.length; i++){
		out.push(splitted[i]);
	}
	out[out.length - 1] = remainder;
	return out;
};
var splitUntilOccurrenceAfterOccurrence = function(source, split, u, occurrence, after, afterOccurrence){
	if(occurrence <= 0){
		return source.split(split);
	}
	var afterIndex = -after.length;
	for(var i = 0; i < afterOccurrence; i++){
		afterIndex = source.indexOf(after, afterIndex + after.length);
	}
	if(afterIndex <= 0 || afterIndex >= source.length){
		return source.split(split);
	}
	var occurrenceCountUntilAfter = 0;
	var untilIndex = source.indexOf(u);
	while(untilIndex != -1 && untilIndex < afterIndex + after.length){
		untilIndex = source.indexOf(u, untilIndex + u.length);
		occurrenceCountUntilAfter++;
	}
	return splitUntilOccurrence(source, split, u, occurrenceCountUntilAfter + occurrence);
};

var Parser = function(server, socket, event){
	var self = this;
	self.server = server;
	self.socket = socket;
	self.event = event;

	self.parsers = {};

	IRCEventParser = new IRCEventParser(server, socket);
	PingPongEventParser = new PingPongEventParser(server, socket);
	JoinEventParser = new JoinEventParser(server, socket);
	KickEventParser = new KickEventParser(server, socket);
	MessageEventParser = new MessageEventParser(server, socket);
	
	UnknownIRCEvent = require('./events/UnknownIRCEvent');
	
	TopicEventParser = new TopicEventParser(server, socket);
	ResponseTopicEventParser = new ResponseTopicEventParser(server, socket);
	
	self.parsers[self.COMMAND_PING] = PingPongEventParser;
	self.parsers[self.COMMAND_PONG] = PingPongEventParser;
	
	self.parsers[self.COMMAND_JOIN] = JoinEventParser;
	self.parsers[self.COMMAND_KICK] = KickEventParser;
	self.parsers[self.COMMAND_PRIVMSG] = MessageEventParser;

	self.parsers[self.COMMAND_TOPIC] = TopicEventParser;
	self.parsers[self.COMMAND_TOPIC_NONE] = ResponseTopicEventParser;
	self.parsers[self.COMMAND_TOPIC_MESSAGE] = ResponseTopicEventParser;
	self.parsers[self.COMMAND_TOPIC_SETBY] = ResponseTopicEventParser;
};
Parser.prototype = {
	COMMAND_PING: 'PING',
	COMMAND_PONG: 'PONG',
	COMMAND_PRIVMSG: 'PRIVMSG',
	COMMAND_NOTICE: 'NOTICE',
	COMMAND_JOIN: 'JOIN',
	COMMAND_PART: 'PART',
	COMMAND_QUIT: 'QUIT',
	COMMAND_TOPIC: 'TOPIC',
	COMMAND_NICK: 'NICK',
	COMMAND_INVITE: 'INVITE',
	COMMAND_KICK: 'KICK',
	
	RESPONSE_SERVER_CONNECTED: '001',
	RESPONSE_SERVER_INFO: '004',
	RESPONSE_USER_HOST: '302',
	RESPONSE_MOTD_START: '375',
	RESPONSE_MOTD_CONTENT: '372',
	RESPONSE_MOTD_END: '376',
	RESPONSE_INFO_START: '373',
	RESPONSE_INFO_CONTENT: '371',
	RESPONSE_INFO_END: '374',
	RESPONSE_TOPIC_NONE: '331',
	RESPONSE_TOPIC_MESSAGE: '332',
	RESPONSE_TOPIC_SETBY: '333',
	
	ERROR_NO_SUCH_NICK: '401',
	ERROR_NO_SUCH_SERVER: '402',
	ERROR_NO_SUCH_CHANNEL: '403',
	ERROR_CANNOT_SEND_TO_CHAN: '404',
	ERROR_TOO_MANY_CHANNELS: '405',
	ERROR_NO_ORIGIN: '409',
	ERROR_NO_RECIPIENT: '411',
	ERROR_NO_TEXT_TO_SEND: '412',
	ERROR_NO_MOTD: '422',
	ERROR_WRONG_PASSWORD: '464',

	parse: function(data){
		var self = this,
			data = data.trim().split('\r'), 
			parts;
		if(!data){
			// Empty line
			return;
		}
		data = data.join('');
		parts = splitUntilOccurrenceAfterOccurrence(data, ' ', ':', 1, ' ', (data.indexOf(':') == 0) ? 1 : 0);
		
		var source = null;
		var command = null;
		
		if(parts[0].indexOf(':') == -1){
			parts.move(0, 1);
			source = self.server.server;
		}else{
			source = parts[0].replace(':', '');
		}
		
		if(parts[1]){
			command = parts[1];
		}else{
			throw new Error('Data not valid!')
		}
		
		// Slice away the first 2 parts
		if(parts.length > 2){
			params = parts.slice(2);
		}else{
			params = [];
		}
		
		e = null;
		if(command && self.parsers.hasOwnProperty(command)){
			e = self.parsers[command].parse(new Source(source), command, params);
			if(e !== null){
				e.parse(command, e.params);
			}else{
				e = new UnknownIRCEvent(self.server, new Source(source), self.socket, params);
				e.parse(command, e.params);
			}
			self.event.fire(command.toLowerCase(), e);
		}
		//console.log('Source: ' + source);
		//console.log('Command: ' + command);
		//console.log('Params: ' + params);
	}
};
module.exports = Parser;