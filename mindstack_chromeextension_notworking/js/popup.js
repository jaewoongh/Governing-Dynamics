var parser = null;

document.addEventListener('DOMContentLoaded', function () {
	// Do what should be done first
	var refreshStack = setInterval(showStack, 500);
});

// When pressed enter, send it to Mindstack
function handleInput(e) {
	if(e.keyCode === 13) {
		var result = parser.parse(document.getElementById('inputtext').value + '\n');
		document.getElementById('inputtext').value = '';
		showStack();
	}
}

// Show Mindstack
function showStack() {
	var stackcontent = '';
	for(var i = Mindstack.stack.length-1; i >= 0; i--) {
		if(Mindstack.stack[i].length > 1) {
			stackcontent += '<p>' + Mindstack.stack[i][0];
			for(var j = 0; j < Mindstack.stack[i].length; j++) {
				if(Mindstack.stack[i][j] instanceof Timer) {
					if(Mindstack.stack[i][j].done) {
						Mindstack.stack[i].splice(j, 1);
						j--;
						continue;
					} else {
						stackcontent += '<br />&#9203;&nbsp;';
						stackcontent += Mindstack.stack[i][j].timeRemaining();
					}
				}
			}
		} else {
			stackcontent += '<p>' + Mindstack.stack[i];
		}
		stackcontent += '</p>';
	}
	document.getElementById('stack').innerHTML = '<h4>STACK</h4>' + stackcontent;
}

