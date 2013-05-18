/*
Copyright (C) 2013 Thomas Lekanger

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
const RESPONSE_TOPIC_NONE = '331';
const RESPONSE_TOPIC_MESSAGE = '332';
const RESPONSE_TOPIC_SETBY = '333';
var IRCEventParser = require('../IRCEventParser');
var ResponseTopicEvent = require('../../events/response/ResponseTopicEvent');
var ResponseTopicSetByEvent = require('../../events/response/ResponseTopicSetByEvent');
var ResponseTopicEventParser = Class(IRCEventParser, {
	parse: function(source, command, args){
		var self = this;
		var channel = self.server.getOrInitiateChannel(args[1]);
		if(command){
			if(command == RESPONSE_TOPIC_NONE){
				return new ResponseTopicEvent(self.server, source, self.socket, [target]);	
			}else if(command == RESPONSE_TOPIC_MESSAGE){
				if(args.length < 3){
					return null;
				}
				var topic = args[2];
				return new ResponseTopicEvent(self.server, source, self.socket, [channel, topic]);	
			}else if(command == RESPONSE_TOPIC_SETBY){
				if(args.length < 3){
					return null;
				}
				var setBy = args[2];
				var setAtString = setBy[3];
				var setAt = setAtString == null ? (new Date).getTime() : setAtString;
				return new ResponseTopicSetByEvent(self.server, source, self.socket, [channel, setBy, setAt]);	
			}else{
				return null;
			}
		}
	}
});
module.exports = ResponseTopicEventParser;