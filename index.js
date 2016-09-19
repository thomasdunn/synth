var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var oscillator = audioCtx.createOscillator();
var gain = audioCtx.createGain();

oscillator.connect(gain);
gain.connect(audioCtx.destination);

oscillator.type = 'triangle';
oscillator.frequency.value = 185;
oscillator.start();
