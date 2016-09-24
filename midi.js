var midiAccess;
var notesOn = [];

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
	var data = message.data,
		// don't touch high 4 bits, clear low 4 bits - gets just type
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
	if (velocity === 0) {
		// for midi running status, note on with velocity 0 treated as note off
		noteOff(note, velocity);
	}
	else {
		console.log('Note ON: ' + note);

		notesOn.unshift(note);	
		setFrequency(getFrequencyFromNote(note));		
	}
}

function noteOff(note, velocity) {
	console.log('Note OFF: ' + note);

	// remove the note from notes on, multiple instances if they snuck in somehow 
	for (var i = notesOn.length - 1; i >= 0; i--) {
		if (notesOn[i] === note) {
			notesOn.splice(i, 1);
		}
	}

	if (notesOn.length > 0) {
		setFrequency(getFrequencyFromNote(notesOn[0]));		
	}
	else {
		setFrequency(0);
	}
}

function getFrequencyFromNote(note) {
	return Math.pow(2, (note - 69)/12) * 440;
}

function onMIDIFailure(error) {
	alert('Error requesting MIDI access: ' + error);
}
