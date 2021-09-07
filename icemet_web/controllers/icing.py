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

@app.route("/api/icing/<string:database>/<string:table>/", methods=["POST"])
def icing_api_route(database, table):
	databases = stats_databases()
	if not database in databases or not table in databases[database]:
		return api(error="Invalid database or table")
	
	sql = "SELECT * FROM `{}`.`{}` ORDER BY DateTime ASC;".format(database, table)
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
	
	# Filter, reverse, 2dict
	events_filt = []
	for event in events:
		if event.accretion > 1.0:
			events_filt.insert(0, event2dict(event))
	
	return api(events=events_filt)

@app.route("/icing/<string:database>/<string:table>/", methods=["GET"])
def icing_route(database, table):
	databases = stats_databases()
	if not database in databases or not table in databases[database]:
		flask.abort(404)
	return render("icing.htm", database=database, table=table)
