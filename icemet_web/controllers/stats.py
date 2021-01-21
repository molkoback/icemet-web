from icemet_web import app
from icemet_web.db import database_inst, stats_databases
from icemet_web.util import render, api

import flask

from datetime import datetime

@app.route("/api/stats/<string:database>/<string:table>/", methods=["POST"])
def stats_api_route(database, table):
	databases = stats_databases()
	if not database in databases or not table in databases[database]:
		return api(error="Invalid database or table")
	
	dt_start = flask.request.form.get("dt_start"),
	dt_end = flask.request.form.get("dt_end")
	
	if not dt_start is None and dt_end is None:
		try:
			datetime.strptime(dt_start, "%Y-%m-%d %H:%M")
			datetime.strptime(dt_end, "%Y-%m-%d %H:%M")
		except:
			return api("Invalid datetime format")
		filt = " WHERE DateTime >= '{}' and DateTime <= '{}'".format(dt_start, dt_end)
	else:
		filt = ""
	
	sql = "SELECT DateTime, LWC, MVD FROM `{}`.`{}`{} ORDER BY DateTime ASC;".format(database, table, filt)
	try:
		rows = database_inst().select(sql)
	except:
		return api(error="SQL error")
	
	stats = {"time": [], "lwc": [], "mvd": []}
	for row in rows:
		stats["time"].append(row["DateTime"].strftime("%Y-%m-%d %H:%M"))
		stats["lwc"].append(row["LWC"])
		stats["mvd"].append(row["MVD"])
	return api({"stats": stats})

@app.route("/stats/<string:database>/<string:table>/", methods=["GET"])
def stats_route(database, table):
	databases = stats_databases()
	if not database in databases or not table in databases[database]:
		flask.abort(404)
	return render("stats.htm", database=database, table=table)
