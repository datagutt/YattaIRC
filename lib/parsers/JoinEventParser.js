var IRCEventParser = require('./IRCEventParser');
var JoinEvent = require('../events/JoinEvent');
var JoinEventParser = Class(IRCEventParser, {
	parse: function(source, command, args){
		var self = this;
		if(command){
			if(command == 'JOIN'){
				return new JoinEvent(self.server, source, self.socket);	
			}
		}
	}
});
module.exports = JoinEventParser;