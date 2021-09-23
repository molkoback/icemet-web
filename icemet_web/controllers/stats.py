from icemet_web.app import app
from icemet_web.models.database import database_inst, stats_databases
from icemet_web.util import render, api
from icemet.db import StatsRow
from icemet.ice import Cylinder

import flask

from datetime import datetime

@app.route("/api/stats/<string:database>/<string:table>/", methods=["POST"])
def stats_api_route(database, table):
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
	
	stats = {"DateTime": [], "LWC": [], "MVD": [], "Temp": [], "Wind": [], "IcingRate": []}
	obj = Cylinder(0.030, 1.0)
	for row in rows:
		stats["DateTime"].append(row["DateTime"].strftime("%Y-%m-%d %H:%M:%S"))
		stats["LWC"].append(row["LWC"])
		stats["MVD"].append(row["MVD"])
		stats["Temp"].append(row.get("Temp", None))
		stats["Wind"].append(row.get("Wind", None))
		stats["IcingRate"].append(row.icingrate(obj))
	return api(stats=stats)

@app.route("/stats/<string:database>/<string:table>/", methods=["GET"])
def stats_route(database, table):
	databases = stats_databases()
	if not database in databases or not table in databases[database]:
		flask.abort(404)
	return render("stats.htm", database=database, table=table)
