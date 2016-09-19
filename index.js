var gainRange = document.getElementById('gain');

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var oscillator = audioCtx.createOscillator();
var gainNode = audioCtx.createGain();

oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);

oscillator.type = 'triangle';
oscillator.frequency.value = 185;
oscillator.start();

gainRange.addEventListener('input', function() {
  gainNode.gain.value = parseFloat(gainRange.value);
});
