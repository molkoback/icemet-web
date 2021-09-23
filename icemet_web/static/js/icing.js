"use strict";

class IcingEvents {
	constructor(api, limits) {
		this.api = api;
		this.limits = limits;
		this.csv = null;
		
		$("#a-csv").click((event) => {
			const data = "data:application/octet-stream;charset=utf-8," + encodeURIComponent(this.csv);
			event.currentTarget.setAttribute("href", data);
			event.currentTarget.setAttribute("download", "data.csv");
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
	
	update(data) {
		$("#div-icing").hide();
		$("#loading").show();
		this.api.request("/icing", {}, (data) => {
			if (data.events.length === 0) {
				$("#div-icing").html($("<p>").html("No icing events."));
			}
			else {
				this.csv = new CSV();
				this.csv.createDownload("#a-csv");
				this.csv.setHeader(["Start", "End", "Duration", "Accretion", "Rate"]);
				const table = $("#table-icing");
				table.find("tr:gt(0)").remove();
				$.each(data.events, (i, event) => {
					this.csv.addRow(this.csvRow(event));
					table.append(this.tableRow(event));
				});
			}
			$("#loading").hide();
			$("#div-icing").show();
		});
	}
}
