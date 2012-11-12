#Copyright (C) 2012 Thomas Lekanger

#Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

#The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

#THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
net = require 'net'
util = require 'util'
event = require './Event'
# I should create some awesome loader for this
IRCEvent = require './events/IRCEvent'
PingEvent = './events/PingEvent'
JoinEvent = require './events/JoinEvent'
exports.IRCEvent = IRCEvent;
exports.PingEvent = PingEvent;
exports.JoinEvent = JoinEvent;
splitUntil = (source, split, u) ->
	splitUntilOccurrence(source, split, u, 0)
splitUntilOccurrence = (source, split, u, occurrence) ->
	untilIndex = source.indexOf(u)
	for i in occurrence
		untilIndex = source.indexOf(u, untilIndex + u.length);
	if untilIndex <= 0 or untilIndex >= source.length
		return source.split(split)
	toSplit = source.substring(0, untilIndex)
	remainder = source.substring(untilIndex + u.length)
	splitted = toSplit.split(split)
	out = []
	for a in splitted
		out.push a
	out[out.length - 1] = remainder;
	return out
class Server
	defaultPort: 6667
	nick: ''
	socket: new net.Socket
	constructor: (@server, @port = @defaultPort, @irc) ->
	connect: ->
		IRCEvent = new IRCEvent(this, @socket)
		@socket.on 'connect', =>
			@log 'Connected to ' + @server + ':' + @port
			return;
		@socket.on 'data', (data) =>
			try 
				@onData data
			catch e
				throw e
			return;
			
		@socket.setEncoding 'utf8'
		@socket.setNoDelay()
		@socket.connect @port, @server

		#@raw 'NICK ' + 'YattaIRC'
		#@raw 'USER ' + 'yatta' + ' 8 * :' + 'Hiro Nakamura'
		serverKey = Object.keys(@irc.servers).length
		@irc.servers[serverKey] = this
		
		return serverKey
	onData: (data) ->
		# Clean code? Screw clean code, haxxx all teh way.
		data = data.trim().split('\r');
		if data.length > 1
			for line in data
				@onData line
				return;
		if not data
			# Empty line
			return;
		data = data.join('')
		parts = splitUntilOccurrence(data, ' ', ':', (data.indexOf(':') == 0) ? 1 : 0);
		#@log parts
		source = null
		command = null
		
		if parts[0].indexOf ':' == -1
			modifiedParts = []
			modifiedParts.push parts[parts.length - 1];
			for part in parts
				modifiedParts.push part;
			parts = modifiedParts[1..]
			
		source = parts[0]
		if source == null
			source = @server
		else if source.indexOf ':' != -1
			source = source.replace ':', ''
		if parts[1]
			command = parts[1]
		# Slice away the first 2 parts
		if parts.length > 2
			params = parts[2..]
		else
			params = []
		if command
			event = command.charAt(0).toUpperCase()+command.substring(1).toLowerCase()
			event += 'Event'
			@log event
			if event and exports[event]
				event = new exports[event]
				# Parse
				event.parse source, command, params
		@log 'Source: ' + source
		@log 'Command: ' + command
		@log 'Params: ' + params
		return;
	log: ->
		console.log.apply(this, arguments)
	raw: (msg) ->
		@log '[RAW]', msg
		@socket.write msg+'\r\n'
	nick: (nick) ->
		@nick = nick;
		@raw 'NICK ' + nick
	user: (user, mode, realname) ->
		@raw 'USER ' + user + ' ' + mode + ' * :' + realname 
	join: (channel) ->
		@raw 'JOIN ' + channel
	message: (target, message) ->
		@raw 'PRIVMSG ' + target + ' :' + message
exports.Server = Server;