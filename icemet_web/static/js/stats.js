"use strict";

class StatsChart {
	constructor(api, picker) {
		this.api = api;
		
		this.dtStart = "";
		this.dtEnd = "";
		
		this.maxTicksLimit = 20;
		this.gridColor = "rgba(204, 204, 204, 1.0)";
		this.lwcColor = "rgba(17, 81, 232, 1.0)";
		this.mvdColor = "rgba(232, 83, 17, 1.0)";
		
		this.chart = null;
		this.csv = null;
		
		picker.onUpdate((start, end) => {
			this.dtStart = start;
			this.dtEnd = end;
			this.update();
		});;
		
		this.update();
	}
	
	updateChart(stats) {
		if (this.chart)
			this.chart.destroy();
		
		this.chart = new Chart($("#canvas-lwcmvd")[0].getContext("2d"), {
			type: "line",
			data: {
				labels: stats.DateTime,
				datasets: [{
					label: "LWC",
					yAxisID: "LWC",
					data: stats.LWC.map(x => x.toFixed(3)),
					fill: false,
					backgroundColor: this.lwcColor,
					borderColor: "rgba(0, 0, 0, 0)",
					pointBackgroundColor: this.lwcColor
				}, {
					label: "MVD",
					yAxisID: "MVD",
					data: stats.MVD.map(x => (x*1000000.0).toFixed(1)),
					fill: false,
					backgroundColor: this.mvdColor,
					borderColor: "rgba(0, 0, 0, 0)",
					pointBackgroundColor: this.mvdColor
				}]
			},
			options: {
				plugins: {
					title: {display: true, text: "LWC and MVD values over time"}
				},
				scales: {
					LWC: {
						type: "linear",
						position: "left",
						title: {display: true, text: "LWC (g/m3)"},
						ticks: {min: 0},
						gridLines: {color: "rgba(0, 0, 0, 0)"}
					},
					MVD: {
						type: "linear",
						position: "right",
						title: {display: true, text: "MVD (μm)"},
						ticks: {min: 5, max: 100},
						gridLines: {color: "rgba(0, 0, 0, 0)"}
					},
					x: {
						type: "time",
						time: {unit: "hour"},
						ticks: {autoSkip: true, maxTicksLimit: this.maxTicksLimit},
						gridLines: {color: this.gridColor}
					}
				},
				animation: false
			}
		});
	}
	
	updateCsv(stats) {
		this.csv = new CSV();
		this.csv.createDownload("#a-csv");
		this.csv.setHeader(["DateTime", "LWC", "MVD"]);
		for (let i in stats.DateTime)
			this.csv.addRow([stats.DateTime[i], stats.LWC[i], stats.MVD[i]]);
	}
	
	update() {
		$("#div-stats").hide();
		$("#loading").show();
		const data = {
			dt_start: this.dtStart,
			dt_end: this.dtEnd
		};
		this.api.request("/stats", data, (data) => {
			this.updateChart(data.stats);
			this.updateCsv(data.stats);
			$("#loading").hide();
			$("#div-stats").show();
		});
	};
}
