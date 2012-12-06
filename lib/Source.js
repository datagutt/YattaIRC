var Source = function(raw){
	var self = this;
	self.raw = raw;
	if(raw.indexOf('@') == -1){
		self.host = raw;
	}else{
		if(raw.indexOf('!') > -1){
			self.nick = raw.substring(0, raw.indexOf('!'));
			self.user = raw.substring(raw.indexOf('!') + 1, raw.indexOf('@'));
			self.host = raw.substring(raw.indexOf('@') + 1);
		}else{
			self.nick = raw.substring(0, raw.indexOf('@'));
			self.host = raw.substring(raw.indexof('@') + 1);
		}
	}
};
Source.prototype = {
	raw: '',
	nick: '',
	user: '',
	host: '',
	getRaw: function(){
		var self = this;
		return self.raw;
	},
	getNick: function(){
		var self = this;
		return self.nick;
	},
	getUser: function(){
		var self = this;
		return self.user;
	},
	getHost: function(){
		var self = this;
		return self.host;
	}
};
module.exports = Source;