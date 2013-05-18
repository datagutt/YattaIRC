var Target = require('./Target');
var Channel = Class(Target, {
	topic: '',
	topicSetBy: '',
	topicSetAt: 0,
	users: {},
	initialize: function(channel){
		var self = this;
		self.target = channel;
	},
	getChannel: function(){
		var self = this;
		return self.target;
	},
	setTopic: function(topic){
		var self = this;
		self.topic = topic;
		self.topicSetBy = null;
		self.topicSetAt = (new Date).getTime();
	},
	setTopicSetBy: function(setBy){
		var self = this;
		self.topicSetBy = topicSetBy;
	},
	getTopicSetBy: function(){
		var self = this;
		return self.topicSetBy;
	},
	getTopicSetAt: function(){
		var self = this;
		return self.topicSetAt;
	},
	getUsers: function(){
		var self = this;
		return self.users;
	}
});
module.exports = Channel;
