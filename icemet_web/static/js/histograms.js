"use strict";

var ParticleHistograms = function(url) {
	this.url = url;
	this.filt = "";
	
	this.maxTicksLimit = 20;
	this.barColor = "rgba(0, 138, 254, 1.0)";
	this.gridColor = "rgba(204, 204, 204, 1.0)";
	this.type = "linear"
	
	this.data = undefined;
	this.chartDiam = undefined;
	this.chartZ = undefined;
	
	this.updateHistograms = function() {
		if (this.chartDiam)
			this.chartDiam.destroy();
		if (this.chartZ)
			this.chartZ.destroy();
		
		this.chartDiam = new Chart($("#canvas-diam")[0].getContext("2d"), {
			type: "bar",
			data: {
				labels: this.data.hist.diam.bins.map(x => parseInt(Math.round(x*1000000))),
				datasets: [{
					data: this.data.hist.diam.N,
					backgroundColor: new Array(this.data.hist.diam.N.length).fill(this.barColor)
				}]
			},
			options: {
				title: {display: true, text: "Particle Size Distribution"},
				legend: {display: false},
				scales: {
					yAxes: [{
						scaleLabel: {display: true, labelString: "Particles"},
						type: this.type,
						gridLines: {color: this.gridColor}
					}],
					xAxes: [{
						scaleLabel: {display: true, labelString: "Equivalent Diameter (μm)"},
						ticks: {autoSkip: true, maxTicksLimit: this.maxTicksLimit},
						gridLines: {color: this.gridColor}
					}]
				}
			}
		});
		
		this.chartZ = new Chart($("#canvas-z")[0].getContext("2d"), {
			type: "bar",
			data: {
				labels: this.data.hist.z.bins.map(x => (x*1000).toFixed(1)),
				datasets: [{
					data: this.data.hist.z.N,
					backgroundColor: new Array(this.data.hist.z.N.length).fill(this.barColor)
				}]
			},
			options: {
				title: {display: true, text: "Particle Z-Positions"},
				legend: {display: false},
				scales: {
					yAxes: [{
						scaleLabel: {display: true, labelString: "Particles"},
						type: this.type,
						gridLines: {color: this.gridColor}
					}],
					xAxes: [{
						scaleLabel: {display: true, labelString: "Position (mm)"},
						ticks: {autoSkip: true, maxTicksLimit: this.maxTicksLimit},
						gridLines: {color: this.gridColor}
					}]
				}
			}
		});
	};
	
	this.update = function() {
		$("#div-histograms").hide();
		$("#loading").show();
		var self = this;
		$.post({
			url: this.url,
			data: {filt: self.filt},
			dataType: "json"
		}).done(function(json) {
			if (json.error) {
				error(json.error);
			}
			else {
				$("#loading").hide();
				$("#div-histograms").show();
				self.data = json;
				self.updateHistograms();
			}
		}).fail(function() {
			error("Failed POST request");
		});
	};
};

var histograms_init = function(url) {
	var hist = new ParticleHistograms(url);
	
	$("#a-linear").click(function() {
		hist.type = "linear";
		hist.updateHistograms();
		$("#a-linear").css("font-weight", "bold");
		$("#a-log").css("font-weight", "normal");
	});
	$("#a-log").click(function() {
		hist.type = "logarithmic";
		hist.updateHistograms();
		$("#a-linear").css("font-weight", "normal");
		$("#a-log").css("font-weight", "bold");
	});
	$("#a-linear").css("font-weight", "bold");
	
	$("#input-filt").keyup(function(event) {
		if (event.which == 13) {
			hist.filt = $("#input-filt").val();
			hist.update();
		}
	});
	hist.filt = $("#input-filt").val();
	
	hist.update();
};
