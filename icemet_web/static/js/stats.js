"use strict";

class StatsCharts {
	constructor(api, picker) {
		this.api = api;
		this.dtStart = "";
		this.dtEnd = "";
		
		this.chartLWCMVD = null;
		this.chartTempWind = null;
		this.chartIcing = null;
		
		picker.onUpdate((start, end) => {
			this.dtStart = start;
			this.dtEnd = end;
			this.update();
		});
		
		this.update();
	}
	
	updateCharts(stats) {
		if (this.chartLWCMVD)
			this.chartLWCMVD.destroy();
		if (this.chartTempWind)
			this.chartTempWind.destroy();
		if (this.chartIcing)
			this.chartIcing.destroy();
		
		const gridColor = "rgba(204, 204, 204, 1.0)";
		const lwcColor = "rgba(9, 9, 128, 1.0)";
		const mvdColor = "rgba(230, 82, 17, 1.0)";
		const tempColor = "rgba(128, 9, 111, 1.0)";
		const windColor = "rgba(16, 121, 230, 1.0)";
		const icingColor = "rgba(16, 226, 230, 1.0)";
		
		const x =  {
			type: "time",
			time: {
				unit: "hour",
				displayFormats: {
					hour: "HH:mm"
				},
				tooltipFormat: "YYYY-MM-DD HH:mm"
			},
			ticks: {autoSkip: true, maxTicksLimit: 20},
			gridLines: {color: gridColor}
		};
		
		this.chartLWCMVD = new Chart($("#canvas-LWCMVD")[0].getContext("2d"), {
			type: "line",
			data: {
				labels: stats.DateTime,
				datasets: [{
					label: "LWC",
					yAxisID: "LWC",
					data: stats.LWC.map(x => x.toFixed(3)),
					fill: false,
					backgroundColor: lwcColor,
					borderColor: "rgba(0, 0, 0, 0)",
					pointBackgroundColor: lwcColor
				}, {
					label: "MVD",
					yAxisID: "MVD",
					data: stats.MVD.map(x => (x*1000000.0).toFixed(1)),
					fill: false,
					backgroundColor: mvdColor,
					borderColor: "rgba(0, 0, 0, 0)",
					pointBackgroundColor: mvdColor
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
					x: x
				},
				animation: false
			}
		});
		this.chartTempWind = new Chart($("#canvas-TempWind")[0].getContext("2d"), {
			type: "line",
			data: {
				labels: stats.DateTime,
				datasets: [{
					label: "Temperature",
					yAxisID: "Temp",
					data: stats.Temp.map(x => x === null ? null : x.toFixed(1)),
					fill: false,
					backgroundColor: tempColor,
					borderColor: "rgba(0, 0, 0, 0)",
					pointBackgroundColor: tempColor
				}, {
					label: "Wind speed",
					yAxisID: "Wind",
					data: stats.Wind.map(x => x === null ? null : x.toFixed(1)),
					fill: false,
					backgroundColor: windColor,
					borderColor: "rgba(0, 0, 0, 0)",
					pointBackgroundColor: windColor
				}]
			},
			options: {
				plugins: {
					title: {display: true, text: "Temperature and wind speed values over time"}
				},
				scales: {
					Temp: {
						type: "linear",
						position: "left",
						title: {display: true, text: "Temperature (°C)"},
						gridLines: {color: "rgba(0, 0, 0, 0)"}
					},
					Wind: {
						type: "linear",
						position: "right",
						title: {display: true, text: "Wind speed (m/s)"},
						gridLines: {color: "rgba(0, 0, 0, 0)"}
					},
					x: x
				},
				animation: false
			}
		});
		this.chartIcing = new Chart($("#canvas-Icing")[0].getContext("2d"), {
			type: "line",
			data: {
				labels: stats.DateTime,
				datasets: [{
					label: "Icing Rate",
					yAxisID: "Rate",
					data: stats.IcingRate.map(x => x === null ? null : (x*1000.0).toFixed(1)),
					fill: false,
					backgroundColor: icingColor,
					borderColor: "rgba(0, 0, 0, 0)",
					pointBackgroundColor: icingColor
				}]
			},
			options: {
				plugins: {
					title: {display: true, text: "Icing rate over time"}
				},
				scales: {
					Rate: {
						type: "linear",
						position: "left",
						title: {display: true, text: "Icing rate (mg/m/s)"},
						gridLines: {color: "rgba(0, 0, 0, 0)"}
					},
					x: x
				},
				animation: false
			}
		});
	}
	
	updateCsv(stats) {
		const csv = new CSV();
		csv.createDownload("#a-csv");
		csv.setHeader(["DateTime", "LWC", "MVD", "Temp", "Wind", "IcingRate"]);
		for (let i in stats.DateTime)
			csv.addRow([stats.DateTime[i], stats.LWC[i], stats.MVD[i], stats.Temp[i], stats.Wind[i], stats.IcingRate[i]]);
	}
	
	update() {
		$("#div-stats").hide();
		$("#loading").show();
		const data = {
			dt_start: this.dtStart,
			dt_end: this.dtEnd
		};
		this.api.request("/stats", data, (data) => {
			this.updateCharts(data.stats);
			this.updateCsv(data.stats);
			$("#loading").hide();
			$("#div-stats").show();
		});
	}
}
