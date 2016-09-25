var Keyboard = require('piano-keyboard');

//create keyboard
var keyboard = new Keyboard({
	element: document.querySelector('.keyboard'),
	range: ['c2', 'c#7'],
	a11y: true,
	qwerty: true
});
keyboard.on('noteOn', function (data) {
	try {
		noteOn(getMidiNumFromPianoKeyNum(data.which), 100);
	} catch (e) {
		alert(e);
	}
});
keyboard.on('noteOff', function (data) {
	try {
		noteOff(getMidiNumFromPianoKeyNum(data.which), 100);
	} catch (e) {
		alert(e);
	}
});

function getMidiNumFromPianoKeyNum(num) {
	return num + 20;
}