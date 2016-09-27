function SpectrumAnalyzer(audioCtx) {
    var analyser = audioCtx.createAnalyser();

    var canvas = document.getElementById("spectrumCanvas");

    var samples = Object.create(canvasPlot.samples);
    samples.init(new Float32Array(16384), new Float32Array(16384));

    var signal = Object.create(canvasPlot.spectrumAnalyserSignal);
    signal.init(samples, null);
    signal.analyser = analyser;
    signal.updateAnalyser();

    var sa = Object.create(canvasPlot.simpleSpectrumAnalyserWidget);
    sa.init(canvas, null, [signal], null, null,
        Object.create(canvasPlot.curveDrawerLinear));

    function setValElement(name) {
        var elem = document.getElementById(name);
        elem.valElement = document.getElementById(name + "_val");
        if (elem.valElement.innerHTML != elem.value)
            elem.valElement.innerHTML = elem.value;
        return elem;
    }
    var x1_elem = setValElement("s_x1");
    var x2_elem = setValElement("s_x2");
    var y1_elem = setValElement("s_y1");
    var y2_elem = setValElement("s_y2");
    var points_elem = setValElement("s_points");

    sa.spectrumAnalyser.xRange.min = parseFloat(x1_elem.value);
    sa.spectrumAnalyser.xRange.max = parseFloat(x2_elem.value);
    sa.spectrumAnalyser.yRange.min = parseFloat(y1_elem.value);
    sa.spectrumAnalyser.yRange.max = parseFloat(y2_elem.value);
    sa.spectrumAnalyser.points = parseInt(points_elem.value);

    function xaxis_change () {
        sa.spectrumAnalyser.linearMap = this.value == "linear";
        sa.update(false);
    }
    var xaxis_elems = document.getElementsByName("s_xaxis");
    for (var i = 0; i < xaxis_elems.length; i++) {
        xaxis_elems[i].addEventListener("change", xaxis_change);
        if (xaxis_elems[i].checked)
            sa.spectrumAnalyser.linearMap =
                xaxis_elems[i].value == "linear";
    }

    function grid_change () {
        sa.spectrumAnalyser.showGrid = this.value == "visible";
        sa.update(false);
    }
    var grid_elems = document.getElementsByName("s_grid");
    for (var i = 0; i < grid_elems.length; i++) {
        grid_elems[i].addEventListener("change", grid_change);
        if (grid_elems[i].checked)
            sa.spectrumAnalyser.showGrid =
                grid_elems[i].value == "visible";
    }

    function interpolation_change () {
        sa.spectrumAnalyser.interpolate =
            this.value == "linear" ? canvasPlot.interpolateLinear
                : null;
        sa.update(false);
    }
    var interpolation_elems = document.getElementsByName("interpolation");
    for (var i = 0; i < interpolation_elems.length; i++) {
        interpolation_elems[i].addEventListener("change",
            interpolation_change);
        if (interpolation_elems[i].checked)
            sa.spectrumAnalyser.interpolate =
                interpolation_elems[i].value == "linear"
                    ? canvasPlot.interpolateLinear : null;
    }

    sa.update(false);

    function input() {
        if (this.valElement.innerHTML == this.value)
            return;
        this.valElement.innerHTML = this.value;

        switch (this) {
            case x1_elem:
                sa.spectrumAnalyser.xRange.min =
                    parseFloat(this.value);
                sa.update(false);
                break;
            case x2_elem:
                sa.spectrumAnalyser.xRange.max =
                    parseFloat(this.value);
                sa.update(false);
                break;
            case y1_elem:
                sa.spectrumAnalyser.yRange.min =
                    parseFloat(this.value);
                sa.update(false);
                break;
            case y2_elem:
                sa.spectrumAnalyser.yRange.max =
                    parseFloat(this.value);
                sa.update(false);
                break;
            case points_elem:
                sa.spectrumAnalyser.points =
                    parseInt(this.value);
                sa.update(false);
                break;
        }
    }
    x1_elem.addEventListener("input", input);
    x2_elem.addEventListener("input", input);
    y1_elem.addEventListener("input", input);
    y2_elem.addEventListener("input", input);
    points_elem.addEventListener("input", input);

    var ctx = canvas.getContext("2d");

    var lastTime;
    var fps = 0;
    function draw() {
        requestAnimationFrame(draw);
        sa.updateSignals();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        sa.draw();

        var curTime = Date.now();
        if (lastTime) {
            fps = 0.1 * 1000 / (curTime - lastTime) + 0.9 * fps;
            ctx.fillStyle = "white";
            ctx.font = "16px sans";
            ctx.fillText("FPS: " + fps.toFixed(2), 10, 26);
        }
        lastTime = curTime;
    }
    draw();

    return analyser;
}
