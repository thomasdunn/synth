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
	try {
		midiAccess = access;
		var inputs = midiAccess.inputs.values();
		var midiDeviceCount = 0;

		for (var input = inputs.next(); input && ! input.done; input = inputs.next()) {
			input.value.onmidimessage = onMIDIMessage;
			midiDeviceCount++;
		}

		console.log('MIDI device count: ' + midiDeviceCount);

		window.MIDIDeviceCount = midiDeviceCount;
	}
	catch (e) {
		window.MIDIDeviceCount = 0;
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

function onMIDIFailure(error) {
	window.MIDIDeviceCount = 0;

	alert('Error requesting MIDI access: ' + error);
}

function noteOn(note, velocity) {
	if (velocity === 0) {
		// for midi running status, note on with velocity 0 treated as note off
		noteOff(note, velocity);
	}
	else {
		// console.log('Note ON: ' + note);

		notesOn.unshift(note);	

		openGate();

		// don't set frequency, instead 'trigger' event
		// setFrequency(getFrequencyFromNote(note));
		trigger(note);
	}
}

function noteOff(note, velocity) {
	// console.log('Note OFF: ' + note);

	// remove the note from notes on, multiple instances if they snuck in somehow 
	for (var i = notesOn.length - 1; i >= 0; i--) {
		if (notesOn[i] === note) {
			notesOn.splice(i, 1);
		}
	}

	if (notesOn.length > 0) {
		// don't set frequency, instead 'trigger' event
		//setFrequency(getFrequencyFromNote(notesOn[0]));

		// retrigger with last note priority
		trigger(notesOn[0]);
	}
	else {
		//setFrequency(0);
		closeGate();
	}
}

function getFrequencyFromNote(note) {
	// MIDI note 69 = A4 (440Hz)
	return Math.pow(2, (note - 69)/12) * 440;
}
