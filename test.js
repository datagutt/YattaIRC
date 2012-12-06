YattaIRC = require('./lib/IRC');
IRC = new YattaIRC;
session = IRC.connect('irc.freenode.net', 6667);
IRC.nick(session, 'YattaBot');
IRC.user(session, 'yatta', 8, 'Hiro Nakamura');
//IRC.join(session, '#blamesamsung');

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
});