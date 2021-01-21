"use strict";

var Stats = function(url) {
	this.url = url;
	
	this.dtStart = "";
	this.dtEnd = "";
	
	this.maxTicksLimit = 20;
	this.gridColor = "rgba(204, 204, 204, 1.0)";
	this.lwcColor = "rgba(0, 0, 255, 1.0)";
	this.mvdColor = "rgba(232, 83, 17, 1.0)";
	
	this.chartLWCMVD = undefined;
	
	this.updateGraphs = function(json) {
		if (this.chartLWCMVD)
			this.chartLWCMVD.destroy();
		
		this.chartLWCMVD = new Chart($("#canvas-lwcmvd")[0].getContext("2d"), {
			type: "line",
			data: {
				labels: json.stats.time,
				datasets: [{
						label: "LWC",
						yAxisID: "LWC",
						data: json.stats.lwc.map(x => x.toFixed(3)),
						fill: false,
						backgroundColor: this.lwcColor,
						borderColor: "rgba(0, 0, 0, 0)",
						pointBackgroundColor: this.lwcColor
					}, {
						label: "MVD",
						yAxisID: "MVD",
						data: json.stats.mvd.map(x => (x*1000000.0).toFixed(1)),
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
	
	this.update = function() {
		$("#div-stats").hide();
		$("#loading").show();
		var self = this;
		$.post({
			url: this.url,
			data: {dt_start: self.dtStart, dt_end: self.dtEnd},
			dataType: "json"
		}).done(function(json) {
			if (json.error) {
				error(json.error);
			}
			else {
				$("#loading").hide();
				$("#div-stats").show();
				self.updateGraphs(json);
			}
		}).fail(function() {
			error("Failed POST request");
		});
	};
};

var stats_init = function(url) {
	var stats = new Stats(url);
	stats.update();
	
	var fmt = "YYYY-MM-DD HH:mm";
	$("#input-datetime").daterangepicker({
		timePicker: true,
		timePicker24Hour: true,
		locale: {format: fmt}
	}, function(start, end, label) {
		stats.dtStart = start.format(fmt);
		stats.dtEnd = end.format(fmt);
		stats.update();
	});
};
