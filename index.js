var gain = document.getElementById('gain');
var waveform = document.getElementById('waveform');

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var oscillator = audioCtx.createOscillator();
var gainNode = audioCtx.createGain();

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

window.addEventListener("load", function() {
    gainNode.connect( Oscilloscope(audioCtx) );
    gainNode.connect( SpectrumAnalyzer(audioCtx) );
});

// DEFINITIONS

function setFrequency(freq) {
	oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
}

function getFloat(elt) {
  return parseFloat(elt.value);
}

function getSelectValue(elt) {
  return elt.options[elt.selectedIndex].value;
}
