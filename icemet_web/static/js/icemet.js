"use strict";

class API {
	constructor(root, database, table, onError) {
		this.url = root + "api";
		this.database = database;
		this.table = table;
		this.onError = onError;
	}
	
	request(page, data, onSuccess, onError) {
		const _onError = this.onError ? this.onError : onError;
		const url = this.url + page + "/" + this.database + "/" + this.table + "/";
		$.post({
			url: url,
			data: data,
			dataType: "json"
		}).done((data) => {
			if (data.error) {
				if (_onError)
					_onError(data.error);
			}
			else {
				onSuccess(data);
			}
		}).fail(() => {
			if (_onError)
				_onError("Failed request");
		});
	}
}

class CSV {
	constructor() {
		this.header = null;
		this.rows = [];
	}
	
	setHeader(labels) {
		this.header = labels;
	}
	
	addRow(row) {
		this.rows.push(row);
	}
	
	get() {
		let data = this.header ? this.header.join(",") + "\n" : "";
		for (const row of this.rows)
			data += row.join(",") + "\n";
		return data;
	}
	
	createDownload(div, name) {
		name = name ? name : "data.csv";
		$(div).click((event) => {
			const data = "data:application/octet-stream;charset=utf-8," + encodeURIComponent(this.get());
			event.currentTarget.setAttribute("href", data);
			event.currentTarget.setAttribute("download", name);
		});
	}
}

function handleError(msg) {
	alert(msg);
}

function icemetInit() {
	$(".dropdown").each((_, dropdown) => {
		$(dropdown).find("> button").click(() => {
			$(".dropdown-submenu-content").hide();
			$(dropdown).siblings().each((_, sub) => {
				$(sub).find("> .dropdown-content").hide();
			});
			$(dropdown).find("> .dropdown-content").toggle();
		});
	});
	$(".dropdown-submenu").each((_, dropdown) => {
		$(dropdown).find("> button").click(() => {
			$(dropdown).siblings().each((_, sub) => {
				$(sub).find("> .dropdown-submenu-content").hide();
			});
			$(dropdown).find("> .dropdown-submenu-content").toggle();
		});
	});
	$(document).on("click", (event) => {
		if ($(".dropdown").has(event.target).length === 0) {
			$(".dropdown-content").hide();
			$(".dropdown-submenu-content").hide();
		}
	});
}
