var gain = document.getElementById('gain');
var waveform = document.getElementById('waveform');

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var oscillator = audioCtx.createOscillator();
var gainNode = audioCtx.createGain();

var midiAccess;
var noteIsOn = false;

oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);

oscillator.type = getSelectValue(waveform);
oscillator.frequency.value = 0;
oscillator.start();

gain.addEventListener('input', function() {
  gainNode.gain.value = getFloat(gain);
});

waveform.addEventListener('change', function() {
  oscillator.type = getSelectValue(waveform);
});

if (navigator.requestMIDIAccess) {
	navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
}
else {
	alert('No MIDI support.');
}

// DEFINITIONS

function onMIDISuccess(access) {
	midiAccess = access;
	var inputs = midiAccess.inputs.values();

	for (var input = inputs.next(); input && ! input.done; input = inputs.next()) {
		input.value.onmidimessage = onMIDIMessage;
	}
}

function onMIDIMessage(message) {
	// console.log(message.data);
	// done touch high 4 bits, clear low 4 bits - gets just type
	var data = message.data,
		msgType = data[0] & 0xf0
		note = data[1],
		velocity = data[2];

    // console.log(msgType);

	switch (msgType) {
		case 144:
			noteOn(note, velocity);
			break;
		case 128:
			noteOff(note, velocity);
			break;
	}
}

function noteOn(note, velocity) {
	if (! noteIsOn) {
		console.log('Note ON: ' + note);
		setFrequency(getFrequencyFromNote(note));		
		noteIsOn = true;
	}
	else {
		// for some reason I'm getting a second note on message
		// rather than a note off 
		setFrequency(0);
		noteIsOn = false;
	}
}

function noteOff(note, velocity) {
	console.log('Note OFF: ' + note);
//	setFrequency(0);
}

function getFrequencyFromNote(note) {
	return Math.pow(2, (note - 69)/12) * 440;
}

function onMIDIFailure(error) {
	alert('Error requesting MIDI access: ' + error);
}

function setFrequency(freq) {
  oscillator.frequency.value = freq;
}

function getFloat(elt) {
  return parseFloat(elt.value);
}

function getSelectValue(elt) {
  return elt.options[elt.selectedIndex].value;
}
