var gain = document.getElementById('gain');
var waveform = document.getElementById('waveform');
var q = document.getElementById('q');
var cutoff = document.getElementById('cutoff');

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var oscillator = audioCtx.createOscillator();
var filter = audioCtx.createBiquadFilter();
var envelope = audioCtx.createGain();
var gainNode = audioCtx.createGain();

oscillator.connect(filter);
filter.connect(envelope);
envelope.connect(gainNode);
gainNode.connect(audioCtx.destination);

oscillator.type = getSelectValue(waveform);
oscillator.frequency.value = 0;
oscillator.start();

filter.type = 'lowpass';
filter.frequency.value = 24000;
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
    // TODO - currently sending 0hz on note off
    //        for now ignore that and let it decay
    //        future: don't use special handling of 0 gate close messages

    if (freq !== 0) {
        // if left with following does a frequency sweep from last value - oscillator.frequency.value = freq;
        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

        // end scheduled events from recently pressed keys
        envelope.gain.cancelScheduledValues(audioCtx.currentTime);

        // attempt to remove click between rapidly pressed notes - envelope.gain.exponentialRampToValueAtTime(1.0, audioCtx.currentTime + 40/1000);
        envelope.gain.setValueAtTime(1.0, audioCtx.currentTime);

        // 2 second decay
        envelope.gain.exponentialRampToValueAtTime(0.000001, audioCtx.currentTime + 2);
    }
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
