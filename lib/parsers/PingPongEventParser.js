var IRCEventParser = require('./IRCEventParser');
var PingPongEventParser = IRCEventParser;
PingPongEventParser.parse = function(source, command, args){
	var self = this;
	IRCEventParser.parse(source, command, args);
	if(command){
		if(command == Parser.COMMAND_PING){
			return new PingEvent(self.server, self.socket);	
		}
	}
};
module.exports = PingPongEventParser;