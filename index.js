var freqRange = document.getElementById('frequency');
var gainRange = document.getElementById('gain');

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var oscillator = audioCtx.createOscillator();
var gainNode = audioCtx.createGain();

oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);

oscillator.type = 'triangle';
oscillator.frequency.value = getFloat(freqRange);
oscillator.start();

freqRange.addEventListener('input', function() {
  oscillator.frequency.value = getFloat(freqRange);
});

gainRange.addEventListener('input', function() {
  gainNode.gain.value = getFloat(gainRange);
});

function getFloat(elt) {
  return parseFloat(elt.value);
}
