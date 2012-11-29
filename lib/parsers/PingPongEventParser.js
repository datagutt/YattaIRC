var IRCEvent = require('../events/PingEvent');
var PingPongEventParser = function(server, socket){
	var self = this;
	self.server = server;
	self.socket = socket;
};
PingPongEventParser.parse = function(server, command, args){
	var self = this;
	if(command){
		if(command == Parser.COMMAND_PING){
			return new PingEvent(self.server, self.socket);	
		}
	}
};
module.exports = PingPongEventParser;