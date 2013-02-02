var FloodProtection = function(server, minDelay, maxDelay){
	var self = this;
	
	self.server = server;
	
	self.minDelay = minDelay;
	self.maxDelay = maxDelay;
	self.delay = 0;
	self.lastMessageTime = 0;
	
};
FloodProtection.prototype.send = function(msg){
	var self = this,
		socket = self.server.socket,
		time = new Date().getTime();
	if (self.lastMessageTime + self.delay > time){
		setTimeout(function(){
			socket.write(msg + '\r\n');
		}, self.lastMessageTime + self.delay - time);
		self.lastMessageTime += self.delay;
		self.delay = Math.min(self.delay + 50, self.maxDelay);
	} else {
		if (time - self.lastMessageTime > self.delay * 2) {
			self.delay = self.minDelay;
		}
		socket.write(msg + '\r\n');
		self.lastMessageTime = time;
	}
};
module.exports = FloodProtection;