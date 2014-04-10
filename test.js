YattaIRC = require('./lib/IRC');
IRC = new YattaIRC;
session = IRC.connect('irc.freenode.net', 6667);
IRC.nick(session, 'YattaTest');
IRC.user(session, 'yatta', 8, 'Hiro Nakamura');
IRC.join(session, '#bbqdroid');

// Command line interface
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(msg){
	try{
		IRC.raw(session, msg);
	}catch(e){
		console.log(e);
	}
});
IRC.event.on('join', function(event){
	console.log('[JOIN] ' + event.source.nick + ' joined ' + event.channel);
console.log(IRC.servers[0].getChannel('bbqdroid'));
});
IRC.event.on('privmsg', function(event){
	console.log('[MSG] [' + event.target + '] '+event.source.nick+' says: ' + event.message);
});
IRC.event.on('topic', function(event){
	console.log(event);
});
