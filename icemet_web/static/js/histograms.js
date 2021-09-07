"use strict";

class ParticleHistograms {
	constructor(api) {
		this.api = api;
		this.filt = $("#input-filter").val();
		
		this.maxTicksLimit = 20;
		this.barColor = "rgba(0, 138, 254, 1.0)";
		this.gridColor = "rgba(204, 204, 204, 1.0)";
		this.type = "linear"
		
		this.data = null;
		this.chartDiam = null;
		this.chartZ = null;
		
		$("#a-linear").click(() => {
			this.type = "linear";
			this.updateHistograms();
			$("#a-linear").css("font-weight", "bold");
			$("#a-log").css("font-weight", "normal");
		});
		$("#a-log").click(() => {
			this.type = "logarithmic";
			this.updateHistograms();
			$("#a-linear").css("font-weight", "normal");
			$("#a-log").css("font-weight", "bold");
		});
		$("#a-linear").css("font-weight", "bold");
		
		$("#input-filter").keyup((event) => {
			if (event.which == 13) {
				this.filt = $("#input-filter").val();
				this.update();
			}
		});
		
		this.update();
	};
	
	updateHistograms() {
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
	
	update() {
		$("#div-histograms").hide();
		$("#loading").show();
		this.api.request("/hist", {filt: this.filt}, (data) => {
			this.data = data;
			this.updateHistograms();
			$("#loading").hide();
			$("#div-histograms").show();
		});
	}
};
