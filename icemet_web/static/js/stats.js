"use strict";

class StatsChart {
	constructor(api) {
		this.api = api;
		
		this.dtStart = "";
		this.dtEnd = "";
		
		this.maxTicksLimit = 20;
		this.gridColor = "rgba(204, 204, 204, 1.0)";
		this.lwcColor = "rgba(0, 0, 255, 1.0)";
		this.mvdColor = "rgba(232, 83, 17, 1.0)";
		
		this.chartLWCMVD = null;
		
		const fmt = "YYYY-MM-DD HH:mm";
		$("#input-datetime").daterangepicker({
			timePicker: true,
			timePicker24Hour: true,
			locale: {format: fmt}
		}, (start, end, label) => {
			this.dtStart = start.format(fmt);
			this.dtEnd = end.format(fmt);
			this.update();
		});
		
		this.update();
	}
	
	updateGraphs(data) {
		if (this.chartLWCMVD)
			this.chartLWCMVD.destroy();
		
		this.chartLWCMVD = new Chart($("#canvas-lwcmvd")[0].getContext("2d"), {
			type: "line",
			data: {
				labels: data.stats.time,
				datasets: [{
						label: "LWC",
						yAxisID: "LWC",
						data: data.stats.lwc.map(x => x.toFixed(3)),
						fill: false,
						backgroundColor: this.lwcColor,
						borderColor: "rgba(0, 0, 0, 0)",
						pointBackgroundColor: this.lwcColor
					}, {
						label: "MVD",
						yAxisID: "MVD",
						data: data.stats.mvd.map(x => (x*1000000.0).toFixed(1)),
						fill: false,
						backgroundColor: this.mvdColor,
						borderColor: "rgba(0, 0, 0, 0)",
						pointBackgroundColor: this.mvdColor
				}]
			},
			options: {
				title: {display: true, text: "LWC and MVD values over time"},
				scales: {
					yAxes: [{
						id: "LWC",
						type: "linear",
						position: "left",
						scaleLabel: {display: true, labelString: "LWC (g/m3)"},
						ticks: {min: 0},
						gridLines: {color: "rgba(0, 0, 0, 0)"}
					}, {
						id: "MVD",
						type: "linear",
						position: "right",
						scaleLabel: {display: true, labelString: "MVD (μm)"},
						ticks: {min: 5, max: 100},
						gridLines: {color: "rgba(0, 0, 0, 0)"}
					}],
					xAxes: [{
						type: "time",
						time: {unit: "hour"},
						ticks: {autoSkip: true, maxTicksLimit: this.maxTicksLimit},
						gridLines: {color: this.gridColor}
					}]
				}
			}
		});
	};
	
	update() {
		$("#div-stats").hide();
		$("#loading").show();
		const data = {
			dt_start: self.dtStart,
			dt_end: self.dtEnd
		};
		this.api.request("/stats", data, (data) => {
			this.updateGraphs(data);
			$("#loading").hide();
			$("#div-stats").show();
		});
	};
};
