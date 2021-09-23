"use strict";

class DateTimePicker {
	constructor() {
		this.fmt = "YYYY-MM-DD HH:mm";
		this.callbacks = [];
		$("#input-datetime").daterangepicker({
			timePicker: true,
			timePicker24Hour: true,
			locale: {format: this.fmt}
		}, (start, end, label) => {
			start = start.format(this.fmt);
			end = end.format(this.fmt)
			for (const cb of this.callbacks)
				cb(start, end);
		});
	}
	
	onUpdate(cb) {
		this.callbacks.push(cb);
	}
}
