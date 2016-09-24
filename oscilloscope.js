function Oscilloscope(audioCtx) {
	var analyser = audioCtx.createAnalyser();

	var canvas = document.getElementById("canvas");

	var samples = Object.create(canvasPlot.samples);
	samples.init(new Float32Array(32768), new Float32Array(32768));

	var signal = Object.create(canvasPlot.scopeSignal);
	signal.init(samples, null);
	signal.analyser = analyser;

	var resampler = Object.create(canvasPlot.resamplerLinear);
	resampler.init();

	var scope = Object.create(canvasPlot.simpleScopeWidget);
	scope.init(canvas, null, [signal], null,
		Object.create(canvasPlot.curveDrawerLinear));

	function setValElement(name) {
		var elem = document.getElementById(name);
		elem.valElement = document.getElementById(name + "_val");
		if (elem.valElement.innerHTML != elem.value)
			elem.valElement.innerHTML = elem.value;
		return elem;
	}

	var time_elem = setValElement("time");
	var y1_elem = setValElement("y1");
	var y2_elem = setValElement("y2");
	var triggerLevel_elem = setValElement("triggerLevel");
	var points_elem = setValElement("points");

	var fftSize = Math.ceil(Math.log2(0.001 * time_elem.max
					  * audioCtx.sampleRate));
	if (fftSize < 5)
		fftSize = 5;
	else if (fftSize > 15)
		fftSize = 15;
	analyser.fftSize = 1 << fftSize;
	signal.updateAnalyser();

	scope.scope.time = parseFloat(time_elem.value) * 0.001;
	scope.scope.yRange.min = parseFloat(y1_elem.value);
	scope.scope.yRange.max = parseFloat(y2_elem.value);
	signal.triggerLevel = parseFloat(triggerLevel_elem.value);
	scope.scope.resamplerPoints = parseInt(points_elem.value);

	function grid_change () {
		scope.scope.showGrid = this.value == "visible";
		scope.update(false);
	}
	var grid_elems = document.getElementsByName("grid");
	for (var i = 0; i < grid_elems.length; i++) {
		grid_elems[i].addEventListener("change", grid_change);
		if (grid_elems[i].checked)
			scope.scope.showGrid = grid_elems[i].value == "visible";
	}

	function trigger_change () {
		signal.trigger = canvasPlot.scopeSignal.triggerType[this.value];
	}
	var trigger_elems = document.getElementsByName("trigger");
	for (var i = 0; i < trigger_elems.length; i++) {
		trigger_elems[i].addEventListener("change", trigger_change);
		if (trigger_elems[i].checked)
			signal.trigger = canvasPlot.scopeSignal
					 .triggerType[trigger_elems[i].value];
	}

	function resampler_change () {
		scope.scope.resampler = this.value == "linear" ? resampler
							       : null;
	}
	var resampler_elems = document.getElementsByName("resampler");
	for (var i = 0; i < resampler_elems.length; i++) {
		resampler_elems[i].addEventListener("change", resampler_change);
		if (resampler_elems[i].checked)
			scope.scope.resampler =
				resampler_elems[i].value == "linear" ? resampler
								     : null;
	}

	scope.update(false);

	function input() {
		if (this.valElement.innerHTML == this.value)
			return;
		this.valElement.innerHTML = this.value;

		switch (this) {
			case time_elem:
				scope.scope.time = parseFloat(this.value)
						   * 0.001;
				scope.update(false);
				break;
			case y1_elem:
				scope.scope.yRange.min = parseFloat(this.value);
				scope.update(false);
				break;
			case y2_elem:
				scope.scope.yRange.max = parseFloat(this.value);
				scope.update(false);
				break;
			case triggerLevel_elem:
				signal.triggerLevel = parseFloat(this.value);
				break;
			case points_elem:
				scope.scope.resamplerPoints =
					parseInt(this.value);
				break;
		}
	}
	time_elem.addEventListener("input", input);
	y1_elem.addEventListener("input", input);
	y2_elem.addEventListener("input", input);
	triggerLevel_elem.addEventListener("input", input);
	points_elem.addEventListener("input", input);

	var ctx = canvas.getContext("2d");

	var lastTime;
	var fps = 0;
	function draw() {
		requestAnimationFrame(draw);
		scope.updateSignals();
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		scope.draw();

		var curTime = Date.now();
		if (lastTime) {
			fps = 0.1 * 1000 / (curTime - lastTime) + 0.9 * fps;
			ctx.fillStyle = "black";
			ctx.font = "16px sans";
			ctx.fillText("FPS: " + fps.toFixed(2), 10, 26);
		}
		lastTime = curTime;
	}
	draw();

	return analyser;
}
