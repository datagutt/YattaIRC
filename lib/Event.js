/* 
Copyright (C) 2012 Thomas Lekanger

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var Event = Class({
	constructor: function(){
		var self = this;
		self.events = {};
	},
	on: function(event, callback){
		var self = this;
		if(event && callback){
			self.events[event] = callback;
		}
	},
	fire: function(event, args){
		var self = this;
		if(!args){
			throw new Error('['+event+'] No arguments provided')
		}
		if(event){
			for(e in self.events){
				if(e == event && typeof self.events[e] == 'function'){
					self.events[e].apply(self, [args]);
				}
			}
		}
	}
});
module.exports = Event;