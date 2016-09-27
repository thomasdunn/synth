var gain = document.getElementById('gain');
var waveform = document.getElementById('waveform');
var q = document.getElementById('q');
var cutoff = document.getElementById('cutoff');

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var oscillator = audioCtx.createOscillator();
var gainNode = audioCtx.createGain();
var filter = audioCtx.createBiquadFilter();

oscillator.connect(filter);
filter.connect(gainNode);
gainNode.connect(audioCtx.destination);

oscillator.type = getSelectValue(waveform);
oscillator.frequency.value = 0;
oscillator.start();

filter.type = 'lowpass';
filter.frequency.value = 32768;
filter.Q.value = 1;

gain.addEventListener('input', function() {
  gainNode.gain.value = getFloat(gain);
});

cutoff.addEventListener('input', function() {
    filter.frequency.value = getInt(cutoff);
});

q.addEventListener('input', function() {
    filter.Q.value = getFloat(q);
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

function getInt(elt) {
    return parseInt(elt.value, 10);
}

function getSelectValue(elt) {
  return elt.options[elt.selectedIndex].value;
}
