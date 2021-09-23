from icemet_web.app import app
from icemet_web.models.database import database_inst, stats_databases
from icemet_web.util import render, api
from icemet.db import StatsRow
from icemet.ice import Cylinder, Event

import flask

from datetime import datetime

def event2dict(event):
	duration = event.end.timestamp() - event.start.timestamp()
	return {
		"start": event.start.strftime("%Y-%m-%d %H:%M:%S"),
		"end": event.end.strftime("%Y-%m-%d %H:%M:%S"),
		"duration": duration,
		"accretion": event.accretion,
		"rate": event.accretion / duration
	}

@app.route("/api/events/<string:database>/<string:table>/", methods=["POST"])
def events_api_route(database, table):
	databases = stats_databases()
	if not database in databases or not table in databases[database]:
		return api(error="Invalid database or table")
	
	dt_start = flask.request.form.get("dt_start")
	dt_end = flask.request.form.get("dt_end")
	if dt_start and dt_end:
		try:
			datetime.strptime(dt_start, "%Y-%m-%d %H:%M")
			datetime.strptime(dt_end, "%Y-%m-%d %H:%M")
		except:
			return api(error="Invalid datetime format")
		filt = " WHERE DateTime >= '{}' and DateTime <= '{}'".format(dt_start, dt_end)
	else:
		filt = ""
	
	sql = "SELECT * FROM `{}`.`{}`{} ORDER BY DateTime ASC;".format(database, table, filt)
	try:
		rows = [*database_inst().select(sql, cls=StatsRow)]
	except:
		return api(error="SQL error")
	
	obj = Cylinder(0.030, 1.0)
	events = []
	event = None
	for row in rows:
		rate = row.icingrate(obj)
		if rate is None or rate == 0:
			if not event is None:
				event.append(rate, row.DateTime)
				events.append(event)
				event = None
		else:
			if event is None:
				event = Event()
			event.append(rate, row.DateTime)
	
	if not event is None:
		events.append(event)
	
	# Filter, reverse, to dict
	events_filt = []
	for event in events:
		if event.accretion > 1.0:
			events_filt.insert(0, event2dict(event))
	
	return api(events=events_filt)

@app.route("/events/<string:database>/<string:table>/", methods=["GET"])
def events_route(database, table):
	databases = stats_databases()
	if not database in databases or not table in databases[database]:
		flask.abort(404)
	return render("events.htm", database=database, table=table)
