(function() {
    var canvas = document.getElementById('envCanvas');
    var ctx = canvas.getContext( '2d' );
    var fps = 30;
    var now;
    var then = Date.now();
    var interval = 1000/fps;
    var delta;
    var x = 0;
    var y = 0;
    var width = canvas.width;
    var height = canvas.height;
    var gateEverOpened = false;

    var lastGateOpen = gateOpen;

    ctx.strokeStyle = "#0f0";
    ctx.fillStyle = "#0f0";

    // http://codetheory.in/controlling-the-frame-rate-with-requestanimationframe/
    function draw() {

        requestAnimationFrame(draw);

        now = Date.now();
        delta = now - then;

        if (delta > interval) {
            // update time stuffs

            // Just `then = now` is not enough.
            // Lets say we set fps at 10 which means
            // each frame must take 100ms
            // Now frame executes in 16ms (60fps) so
            // the loop iterates 7 times (16*7 = 112ms) until
            // delta > interval === true
            // Eventually this lowers down the FPS as
            // 112*10 = 1120ms (NOT 1000ms).
            // So we have to get rid of that extra 12ms
            // by subtracting delta (112) % interval (100).
            // Hope that makes sense.

            then = now - (delta % interval);

            // ... Code for Drawing the Frame ...

            if (gateOpen) {
                gateEverOpened = true;
            }

            if (! gateEverOpened) {
                return;
            }

            if (! lastGateOpen && gateOpen) {
                // gate just opened, reset envelope vis
                x = 10;
                ctx.clearRect(0, 0, width, height);
            }

            y = height - (height * envelope.gain.value);

            // make it all fit in canvas nicer
            y *= 0.93;
            y += 5;

            // ctx.beginPath();
            // ctx.moveTo(x, y);
            // ctx.lineTo(x, y);
            // ctx.closePath(); // draws last line of the triangle
            // ctx.stroke();

            ctx.fillRect(x, y, 1, 1);

            x += 2;
            lastGateOpen = gateOpen;
        }
    }

    draw();
})();
