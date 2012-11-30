var IRCEventParser = require('./IRCEventParser');
var PingEvent = require('../events/PingEvent');
var PingPongEventParser = IRCEventParser.extend({
	parse: function(source, command, args){
		var self = this;
		if(command){
			if(command == 'PING'){
				return new PingEvent(self.server, source, self.socket);	
			}
		}
	}
});
module.exports = PingPongEventParser;