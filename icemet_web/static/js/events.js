"use strict";

class Events {
	constructor(api, limits, picker) {
		this.api = api;
		this.dtStart = "";
		this.dtEnd = "";
		
		this.limits = limits;
		
		picker.onUpdate((start, end) => {
			this.dtStart = start;
			this.dtEnd = end;
			this.update();
		});
		
		this.update();
	}
	
	csvRow(event) {
		return [event.start, event.end, Math.round(event.duration / 60), event.accretion, event.rate];
	}
	
	tableRow(event) {
		let color = "inherit";
		for (var limit in this.limits) {
			if (event.accretion >= limit)
				color = this.limits[limit];
		}
		const row = $("<tr>");
		row.append($("<td>").html(event.start));
		row.append($("<td>").html(event.end));
		row.append($("<td>").html(Math.round(event.duration / 60)));
		row.append($("<td>").html(event.accretion.toFixed(1)).css("color", color));
		row.append($("<td>").html((event.rate*1000).toFixed(1)));
		return row;
	}
	
	update() {
		$("#div-events").hide();
		$("#loading").show();
		const data = {
			dt_start: this.dtStart,
			dt_end: this.dtEnd
		};
		this.api.request("/events", data, (data) => {
			if (data.events.length === 0) {
				$("#div-events").html($("<p>").html("No icing events."));
			}
			else {
				const csv = new CSV();
				csv.createDownload("#a-csv");
				csv.setHeader(["Start", "End", "Duration", "Accretion", "Rate"]);
				const table = $("#table-events");
				table.find("tr:gt(0)").remove();
				$.each(data.events, (i, event) => {
					csv.addRow(this.csvRow(event));
					table.append(this.tableRow(event));
				});
			}
			$("#loading").hide();
			$("#div-events").show();
		});
	}
}
