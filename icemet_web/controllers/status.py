from icemet_web.app import app
from icemet_web.models.status import Status, status_container_inst
from icemet_web.plugins import call_hook
from icemet_web.util import render, api

import flask

import time

@app.route("/api/status/", methods=["POST"])
def status_api_route():
	form = flask.request.form
	try:
		type = form["type"]
		id = int(form["id"])
		location = form.get("location", "")
		time_ = float(form["time"])
	except:
		return api(error="Invalid parameters")
	
	status = Status(type, id, location, time_)
	status_container_inst().write(status)
	call_hook("on_status", status)
	return api(delay=time.time()-time_)

@app.route("/status/", methods=["GET"])
def status_route():
	return render("status.htm", statuses=status_container_inst().read())
