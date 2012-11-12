YattaIRC = require './src/IRC';
IRC = new YattaIRC;
session = IRC.connect('irc.freenode.net', 6667);
IRC.nick(session, 'YattaBot');
IRC.user(session, 'yatta', 8, 'Hiro Nakamura');
IRC.join(session, '#blamesamsung');