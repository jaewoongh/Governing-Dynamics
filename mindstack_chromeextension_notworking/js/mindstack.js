
var Mindstack = {
	/*********************************************
	* CORE VARIABLES                             *
	*********************************************/

	stack: [],
	undoables: [],
	redoables: [],
	lastaction: { 'fn': undefined, 'args': undefined },


	/*********************************************
	* CORE FUNCTIONS: eval, keepjournal, lookup  *
	*********************************************/

	// Get input parsed PLT.js and PEG.js, and process it
	eval: function(input) {
		var string = '';
		var fn = undefined;

		while(input.length > 0) {
			string += ' ' + input[0];		// Stack up all words until it matches to the name of function
			input.shift();
			fn = this.lookup(string.toUpperCase().trim());
			if(fn instanceof Function) {
				if(fn != this.dia) {
					Mindstack.lastaction.fn = fn;
					Mindstack.lastaction.args = input;
				}
				return fn(input);
			}
		}
		Mindstack.lastaction.fn = this.push;
		Mindstack.lastaction.args = string.trim();
		return this.push(string.trim());
	},

	// Keep history of the stack
	keepjournal: function() {
		Mindstack.undoables.push(Mindstack.stack.slice(0));
		if(Mindstack.undoables.length > 13) Mindstack.undoables.shift();
		Mindstack.redoables = [];
	},

	// Look up for the dictionary and get matching function
	lookup: function(word) {
		for(var i = 0; i < dictionary.length; i++) {
			if(dictionary[i].entry.some(word)) return dictionary[i].fn;
		}
		return undefined;
	},


	/*********************************************
	* FUNCTIONS: in an alphabetical order        *
	*********************************************/

	// Clear the stack
	clr: function() {
		if(Mindstack.stack.length < 1) return false;
		Mindstack.keepjournal();
		Mindstack.stack = [];
		return true;
	},

	// Do it again, the last action
	dia: function() {
		if(Mindstack.lastaction.fn == undefined) return false;
		return Mindstack.lastaction.fn(Mindstack.lastaction.args);
	},

	// Duplicate the topmost one
	dup: function() {
		if(Mindstack.stack.length < 1) return false;
		Mindstack.keepjournal();
		var last = Mindstack.stack.pop();
		Mindstack.stack.push(last);
		Mindstack.stack.push(last);
		return true;
	},

	// Pop out the topmost one
	pop: function() {
		if(Mindstack.stack.length < 1) return false;
		Mindstack.keepjournal();
		Mindstack.stack.pop();
		return true;
	},

	// Push to the top
	push: function(input) {
		var str;
		if(input instanceof Array) str = input.join(' ');
		else str = input;
		if(str.length < 1) return false;
		Mindstack.keepjournal();
		Mindstack.stack.push([str]);
		return true;
	},

	// Roll everything downwards
	rdn: function() {
		if(Mindstack.stack.length < 1) return false;
		Mindstack.keepjournal();
		var shelter = Mindstack.stack.shift();
		Mindstack.stack.push(shelter);
		return true;
	},

	// Undo undo
	redo: function() {
		if(Mindstack.redoables.length < 1) return false;
		Mindstack.undoables.push(Mindstack.stack.slice(0));
		Mindstack.stack = Mindstack.redoables.pop().slice(0);
		return true;
	},

	// Roll everything upwards
	rup: function() {
		if(Mindstack.stack.length < 1) return false;
		Mindstack.keepjournal();
		var shelter = Mindstack.stack.pop();
		Mindstack.stack.unshift(shelter);
		return true;
	},

	// Swap two topmost things
	swap: function() {
		if(Mindstack.stack.length < 2) return false;
		Mindstack.keepjournal();
		var last = Mindstack.stack.pop();
		var secondtolast = Mindstack.stack.pop();
		Mindstack.stack.push(last);
		Mindstack.stack.push(secondtolast);
		return true;
	},

	// Attach timer to topmost thing, triggered in certain time
	timin: function(time) {
		if(Mindstack.stack.length < 1) return false;
		if(time.length < 1) return 'I need a time to let you know in';
		if(time.length > 2) return 'Time should not exceed two words, like 10 min or 1 hour';
		if(time[0] != parseInt(time[0]).toString()) return 'I need a number and unit for time, like 15 sec or 2 min';
		
		var t = parseInt(time[0]);
		switch(typeof time[1] == 'string' ? time[1].toLowerCase() : time[1]) {
			case 'second':	case 'seconds':	case 'sec':				case 'secs':	case 's':
				t *= 1000; break;
			case undefined:	case 'minute':	case 'minutes':		case 'min':		case 'mins':		case 'm':
				t *= 60000; break;
			case 'hour':		case 'hours':		case 'h':					case 'hr':		case 'hrs':
				t *= 3600000; break;
		}

		Mindstack.keepjournal();
		var thing = Mindstack.stack.pop();
		thing.push(new Timer('timeout', t, thing[0]));
		Mindstack.stack.push(thing);
		return true;
	},

	// Attach timer to topmost thing, triggered on certain time
	timon: function() {

	},

	// Undo
	undo: function() {
		if(Mindstack.undoables.length < 1) return false;
		Mindstack.redoables.push(Mindstack.stack.slice(0));
		Mindstack.stack = Mindstack.undoables.pop().slice(0);
		return true;
	}
}


/*********************************************
* DICTIONARY: multiple entries to a function *
*********************************************/

var dictionary = [
	{ 'entry': ['CLR', 'CLEAR'],
		'fn':	Mindstack.clr					},

	{ 'entry': ['DIA', 'DO IT AGAIN', 'ONE MORE', 'ONE MORE TIME', 'KEEP GOING'],
		'fn': Mindstack.dia					},

	{ 'entry': ['DUP', 'DUPLICATE'],
		'fn': Mindstack.dup					},

	{ 'entry': ['POP', 'DROP', 'DONE', 'I\'M DONE', 'FINISHED'],
		'fn': Mindstack.pop					},

	{ 'entry': ['PUSH', 'I NEED TO', 'I\'M GONNA', 'I\'M GOING TO', 'NEED TO', 'GONNA', 'GOING TO'],
		'fn': Mindstack.push 				},

	{ 'entry': ['RDN', 'ROLLDOWN', 'ROLL DOWN'],
		'fn': Mindstack.rdn					},

	{ 'entry': ['REDO', 'CANCELCANCEL', 'DID MEAN IT'],
		'fn': Mindstack.redo				},

	{ 'entry': ['RUP', 'ROLLUP', 'ROLL UP'],
		'fn': Mindstack.rup					},

	{ 'entry': ['SWAP'],
		'fn': Mindstack.swap				},

	{ 'entry': ['TIMIN', 'SET TIMER IN', 'ATTACH TIMER IN', 'LET ME KNOW IN', 'LET ME KNOW AFTER', 'REMIND ME AFTER', 'REMIND ME IN', 'SET TIMER FOR'],
		'fn': Mindstack.timin				},

	{ 'entry': ['TIMON', 'SET TIMER ON', 'ATTACH TIMER ON', 'LET ME KNOW ON', 'REMIND ME ON', 'SET TIMER ON'],
		'fn': Mindstack.timon				},

	{ 'entry': ['UNDO', 'CANCEL', 'OOPS', 'DIDN\'T MEAN IT', 'MY BAD', 'ROLL BACK'],
		'fn': Mindstack.undo				}
]



/*********************************************
* TIMER CLASS                                *
*********************************************/

function Timer(type, settime, message) {
	this.done = false;
	this.type = type;
	this.message = message;
	this.targetTime = new Date().getTime() + settime;
	this.whenTriggered = this.defaultAlert;
	switch(type) {
		case 'timeout':
			this.timer = setTimeout(this.whenTriggered, settime, this);
			break;
		case 'clock':
			break;
		default:
			throw('Exception creating new Timer object: unkown type ' + type + ' is handed');
	}
}

Timer.prototype.defaultAlert = function(context) {
	context.done = true;

	// Create html notification
	var havePermission = window.webkitNotifications.checkPermission();
	console.log(havePermission);
	if (havePermission == 0) {		// 0 is PERMISSION_ALLOWED
		var notification = window.webkitNotifications.createNotification(
			'http://i.stack.imgur.com/dmHl0.png',
			'Notification from your mind!',
			context.message
		);

		notification.onclick = function () {
			notification.close();
		};

		notification.show();
	} else {
		document.getElementById('grantmepermission').innerHTML = '<input type="button" value="PERMISSION!" onclick="window.webkitNotifications.requestPermission()" />';
	}

	// // Create Chrome Rich Notification
	// chrome.notifications.create(
	// 	context.timer,
	// 	{
	// 		type:			'basic',
	// 		title:		'Call from your mind',
	// 		message:	context.message
	// 	}
	// );
}

Timer.prototype.timeRemaining = function() {
	var r = this.targetTime - new Date().getTime();
	var h = Math.floor(r/3600000);	r -= h*3600000;
	var m = Math.floor(r/60000);		r -= m*60000;
	var s = Math.floor(r/1000);			r -= s*1000;
	return (h > 0 ? h + ':' : '') + ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
}