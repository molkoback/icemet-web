"use strict";

var ParticleViewer = function(url) {
	this.url = url;
	this.perpage = 50;
	this.page = 0;
	this.orderKey = "id";
	this.order = "ASC";
	this.filt = "";
	
	this.setPage = function(page) {
		if (page < 0)
			this.spage = 0;
		else
			this.page = page;
		this.update();
	};
	
	this.pagePrev = function() {
		this.setPage(this.page-1);
	};
	
	this.pageNext = function() {
		this.setPage(this.page+1);
	};
	
	this.switchOrderKey = function(key) {
		if (this.orderKey == key) {
			this.order = this.order == "ASC" ? "DESC" : "ASC";
		}
		else {
			this.orderKey = key;
			this.order = "ASC";
		}
		this.page = 0;
		this.update();
	};
	
	this.updateTable = function(json) {
		var particles = json.particles;
		$("#table-particles").find("tr:gt(0)").remove();
		for (var i in particles) {
			var id = "<td >" + particles[i].id + "</td>";
			var dt = "<td>" + particles[i].datetime + "</td>";
			var img = "<td style=\"text-align:center\"><a href=\"" + particles[i].img + "\" target=\"_blank\"><img src=\"" + particles[i].img + "\"\></a></td>";
			var imgTh = "<td style=\"text-align:center\"><a href=\"" + particles[i].imgth + "\" target=\"_blank\"><img src=\"" + particles[i].imgth + "\"\></a></td>";
			var imgPrev = "<td style=\"text-align:center\"><a href=\"" + particles[i].imgprev + "\"  target=\"_blank\"><img src=\"" + particles[i].imgprev + "\"\></a></td>";
			var diam = "<td>" + parseInt(particles[i].diam*1000000.0)  + "</td>";
			var z = "<td>" + (particles[i].z*1000.0).toFixed(3) + "</td>";
			var circ = "<td>" + particles[i].circ.toFixed(2) + "</td>";
			var dr = "<td>" + particles[i].dynrange + "</td>";
			var row = "<tr>" + id + dt + img + imgTh + imgPrev + diam + z + circ + dr + "</tr>";
			$("#table-particles tr:last").after(row);
		}
		$(".span-page").each(function() {
			$(this).html(json.page+1);
		});
	};
	
	this.update = function() {
		$("#div-viewer").hide();
		$("#loading").show();
		var self = this;
		$.post({
			url: this.url,
			data: {
				perpage: self.perpage,
				page: self.page,
				order_key: self.orderKey,
				order: self.order,
				filt: self.filt
			},
			dataType: "json"
		}).done(function(json) {
			if (json.error) {
				error(json.error);
			}
			else {
				$("#loading").hide();
				$("#div-viewer").show();
				self.updateTable(json);
			}
		}).fail(function() {
			error("Failed POST request");
		});
	};
};

var viewer_init = function(url) {
	var viewer = new ParticleViewer(url);
	
	$("#a-id").click(function() { viewer.switchOrderKey("ID"); });
	$("#a-datetime").click(function() { viewer.switchOrderKey("DateTime"); });
	$("#a-diam").click(function() { viewer.switchOrderKey("EquivDiam"); });
	$("#a-z").click(function() { viewer.switchOrderKey("Z"); });
	$("#a-circ").click(function() { viewer.switchOrderKey("Circularity"); });
	$("#a-dnr").click(function() { viewer.switchOrderKey("DynRange"); });
	$(".a-prev").each(function() {
		$(this).click(function() { viewer.pagePrev(); });
	});
	$(".a-next").each(function() {
		$(this).click(function() { viewer.pageNext(); });
	});
	
	$("#input-filt").keyup(function(event) {
		if (event.which == 13) {
			viewer.filt = $("#input-filt").val();
			viewer.update();
		}
	});
	viewer.filt = $("#input-filt").val();
	
	viewer.update();
};
