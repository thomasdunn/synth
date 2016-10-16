var gain = document.getElementById('gain');
var waveform = document.getElementById('waveform');
var q = document.getElementById('q');
var cutoff = document.getElementById('cutoff');

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var oscillator = audioCtx.createOscillator();
var filter = audioCtx.createBiquadFilter();
var envelope = audioCtx.createGain();
var gainNode = audioCtx.createGain();

var minGain = 0.000001;

var envelopeStateAttackDecay = 'AD';
var envelopeStateSustain = 'S';
var envelopeStateRelease = 'R';
var envelopeState;

var timeConstantFactor = 10;

// var attackTime = 0.2;
// var decayTime = 0.75;
// var sustainLevel = 0.4;
// var releaseTime = 1.5;

var attackTime = 0.2;
var decayTime = 0.4;
var sustainLevel = 0.5;
var releaseTime = 0.5;

// for now : implement ADSR w/ retriggering (from S back to A+D) w/ last note priority
var gateOpen = false;

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

function trigger(note) {

    // use setValueAtTime since setting value directly does a frequency sweep from last value
    oscillator.frequency.setValueAtTime(getFrequencyFromNote(note), audioCtx.currentTime);

    switch (envelopeState) {
        case envelopeStateAttackDecay:
            // restart AD from current level (do not reset to zero)
            // if its decaying, it will rise up to max again
            // if its attacking, it will continue to rise to max but under new pitch
            attackDecay();

            // ? other option could be to reset to zero if in this state?
            break;
        case envelopeStateSustain:
            // restart AD from sustain level
            attackDecay(sustainLevel);

            break;
        case envelopeStateRelease:
            // restart AD from current level (do not reset to zero)
            attackDecay();

            break;
        default:
            // envelope is not active
            // start AD
            attackDecay(minGain);

            break;
    }
}

function attackDecay(level) {
    if (level === minGain) {
        // start anew

        // cancel previous envelope to start up the next...
        envelope.gain.cancelScheduledValues(audioCtx.currentTime);

        // start at silence - setTargetAtTime to avoid click from ending previous play at non-zero crossing point
        envelope.gain.setTargetAtTime(0, audioCtx.currentTime, 0.015);

        // attack to max
        envelope.gain.exponentialRampToValueAtTime(1.0, audioCtx.currentTime + attackTime);

        // decay to sustain
        envelope.gain.setTargetAtTime(sustainLevel, audioCtx.currentTime + attackTime, decayTime / timeConstantFactor);
    }
    else if (level === sustainLevel) {
        // restart at sustain
    }
    else {
        // restart from current level
    }
}

function release() {
    // decay back to silence
    envelope.gain.setTargetAtTime(minGain, audioCtx.currentTime, releaseTime / timeConstantFactor);
}

function openGate() {
    if (! gateOpen) {
        gateOpen = true;
    }
}

function closeGate() {
    if (gateOpen) {
        gateOpen = false;

        release();
    }
}


function setFrequency(freq) {
    // TODO - currently sending 0hz on note off
    //        for now ignore that and let it decay
    //        future: don't use special handling of 0 gate close messages

    if (freq !== 0) {
        // if left with following does a frequency sweep from last value - oscillator.frequency.value = freq;
        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

        // cancel previous envelope to start up the next...
        envelope.gain.cancelScheduledValues(audioCtx.currentTime);

        // start at silence - setTargetAtTime to avoid click from ending previous play at non-zero crossing point
        envelope.gain.setTargetAtTime(0, audioCtx.currentTime, 0.015);

        // attack
        envelope.gain.exponentialRampToValueAtTime(1.0, audioCtx.currentTime + 0.1);

        // sustain
        envelope.gain.setValueAtTime(1.0, audioCtx.currentTime + 0.6);

        // decay
        envelope.gain.exponentialRampToValueAtTime(minGain, audioCtx.currentTime + 3.6);
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
