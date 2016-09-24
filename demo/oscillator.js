var freq = document.getElementById('frequency');
var gain = document.getElementById('gain');
var waveform = document.getElementById('waveform');

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var oscillator = audioCtx.createOscillator();
var gainNode = audioCtx.createGain();

oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);

oscillator.type = getSelectValue(waveform);
oscillator.frequency.value = getFloat(freq);
oscillator.start();

freq.addEventListener('input', function() {
  oscillator.frequency.value = getFloat(freq);
});

gain.addEventListener('input', function() {
  gainNode.gain.value = getFloat(gain);
});

waveform.addEventListener('change', function() {
  oscillator.type = getSelectValue(waveform);
});

function getFloat(elt) {
  return parseFloat(elt.value);
}

function getSelectValue(elt) {
  return elt.options[elt.selectedIndex].value;
}
