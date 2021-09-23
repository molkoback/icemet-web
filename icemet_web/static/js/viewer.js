"use strict";

class ParticleViewer {
	constructor(api) {
		this.api = api;
		this.perpage = 50;
		this.page = 0;
		this.orderKey = "ID";
		this.order = "ASC";
		this.filt = null;
		
		const columns = ["ID", "DateTime", "EquivDiam", "Z", "Circularity", "DynRange"];
		for (let i in columns) {
			const a = "#a-" + columns[i].toLowerCase();
			$(a).click(() => {this.switchOrderKey(columns[i])});
		}
		$(".a-prev").each((_, elem) => {
			$(elem).click(() => {this.pagePrev()});
		});
		$(".a-next").each((_, elem) => {
			$(elem).click(() => {this.pageNext()});
		});
		$("#input-filter").keyup((event) => {
			if (event.which == 13)
				this.update($("#input-filter").val());
		});
		$("#a-total").click(() => {
			$("#span-total").html("...");
			this.api.request("/hist", {filt: this.filt}, (data) => {
				let total = 0;
				for (let i in data.hist.diam.N)
					total += data.hist.diam.N[i];
				$("#span-total").html(total);
			});
		});
		
		this.update($("#input-filter").val());
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
	
	createHilight(img, par) {
		const canvas = document.createElement("canvas");
		canvas.width = img.naturalWidth;
		canvas.height = img.naturalHeight;
		const ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0);
		ctx.beginPath();
		ctx.lineWidth = "2";
		ctx.strokeStyle = "#00ff00";
		ctx.rect(par.SubX, par.SubY, par.SubW, par.SubH);
		ctx.stroke();
		return canvas.toDataURL();
	}
	
	openPreview(par) {
		const createHilight = this.createHilight;
		const img = new Image();
		img.onload = function() {
			const url = createHilight(this, par);
			window.open(url);
		}
		img.src = par.ImgPrev;
	}
	
	particleViewerRow(par) {
		const row = $("<tr>");
		row.append($("<td>").html(par.ID));
		row.append($("<td>").html(par.DateTime));
		row.append($("<td>").html(
			$("<a>", {href: par.Img, target: "_blank"})
				.html($("<img >", {src: par.Img}))
				.css("text-align", "center")
		 ));
		row.append($("<td>").html(
			$("<a>", {href: par.ImgTh, target: "_blank"})
				.html($("<img >", {src: par.ImgTh}))
				.css("text-align", "center")
		));
		row.append($("<td>").html(
			$("<a>", {href: "javascript:void(0)"})
				.html($("<img >", {src: par.ImgPrev}))
				.click(() => {this.openPreview(par)})
				.css("text-align", "center")
		));
		row.append($("<td>").html(parseInt(par.EquivDiam*1000000.0)));
		row.append($("<td>").html((par.Z*1000.0).toFixed(3)));
		row.append($("<td>").html(par.Circularity.toFixed(2)));
		row.append($("<td>").html(par.DynRange));
		return row;
	}
	
	update(filt) {
		if (filt != undefined && filt != this.filt) {
			this.filt = filt;
			$("#span-total").html("?");
		}
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
}
