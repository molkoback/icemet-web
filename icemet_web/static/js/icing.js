"use strict";

class IcingEvents {
	constructor(api, limits) {
		this.api = api;
		this.limits = limits;
		this.update();
	}
	
	icingEventRow(event) {
		let color = "inherit";
		for (var limit in this.limits) {
			if (event.accretion >= limit)
				color = this.limits[limit];
		}
		const row = $("<tr/>");
		row.append($("<td/>").html(event.start));
		row.append($("<td/>").html(event.end));
		row.append($("<td/>").html(Math.round(event.duration / 60)));
		row.append($("<td/>").html(event.accretion.toFixed(1)).css("color", color));
		row.append($("<td/>").html((event.rate*1000).toFixed(1)));
		return row;
	}
	
	update(data) {
		$("#div-icing").hide();
		$("#loading").show();
		this.api.request("/icing", {}, (data) => {
			const table = $("#table-icing");
			table.find("tr:gt(0)").remove();
			$.each(data.events, (i, event) => {
				table.append(this.icingEventRow(event));
			});
			$("#loading").hide();
			$("#div-icing").show();
		});
	}
};
