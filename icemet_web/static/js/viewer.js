"use strict";

class ParticleViewer {
	constructor(api) {
		this.api = api;
		this.perpage = 50;
		this.page = 0;
		this.orderKey = "id";
		this.order = "ASC";
		this.filt = $("#input-filter").val();
		
		$("#a-id").click(() => { this.switchOrderKey("ID"); });
		$("#a-datetime").click(() => { this.switchOrderKey("DateTime"); });
		$("#a-diam").click(() => { this.switchOrderKey("EquivDiam"); });
		$("#a-z").click(() => { this.switchOrderKey("Z"); });
		$("#a-circ").click(() => { this.switchOrderKey("Circularity"); });
		$("#a-dnr").click(() => { this.switchOrderKey("DynRange"); });
		$(".a-prev").each((_, elem) => {
			$(elem).click(() => { this.pagePrev(); });
		});
		$(".a-next").each((_, elem) => {
			$(elem).click(() => { this.pageNext(); });
		});
		$("#input-filter").keyup((event) => {
			if (event.which == 13) {
				this.filt = $("#input-filter").val();
				this.update();
			}
		});
		
		this.update();
	}
	
	setPage(page) {
		this.page = page < 0 ? 0 : page;
		this.update();
	}
	
	pagePrev() {
		this.setPage(this.page-1);
	}
	
	pageNext() {
		this.setPage(this.page+1);
	}
	
	switchOrderKey(key) {
		if (this.orderKey == key) {
			this.order = this.order == "ASC" ? "DESC" : "ASC";
		}
		else {
			this.orderKey = key;
			this.order = "ASC";
		}
		this.page = 0;
		this.update();
	}
	
	particleViewerRow(par) {
		const row = $("<tr/>");
		row.append($("<td/>").html(par.id));
		row.append($("<td/>").html(par.datetime));
		row.append($("<td/>").html($("<a/>", {href: par.img, target: "_blank"}).css("text-align", "center").html("<img src=\""+par.img+"\"\>")));
		row.append($("<td/>").html($("<a/>", {href: par.imgth, target: "_blank"}).css("text-align", "center").html("<img src=\""+par.imgth+"\"\>")));
		row.append($("<td/>").html($("<a/>", {href: par.imgprev, target: "_blank"}).css("text-align", "center").html("<img src=\""+par.imgprev+"\"\>")));
		row.append($("<td/>").html(parseInt(par.diam*1000000.0)));
		row.append($("<td/>").html((par.z*1000.0).toFixed(3)));
		row.append($("<td/>").html(par.circ.toFixed(2)));
		row.append($("<td/>").html(par.dynrange));
		return row;
	}
	
	update() {
		$("#div-viewer").hide();
		$("#loading").show();
		const data = {
			perpage: this.perpage,
			page: this.page,
			order_key: this.orderKey,
			order: this.order,
			filt: this.filt
		};
		this.api.request("/images", data, (data) => {
			const table = $("#table-particles");
			table.find("tr:gt(0)").remove();
			$.each(data.particles, (i, par) => {
				table.append(this.particleViewerRow(par));
			});
			$(".span-page").each((i, elem) => {
				$(elem).html(data.page+1);
			});
			$("#loading").hide();
			$("#div-viewer").show();
		});
	}
};
