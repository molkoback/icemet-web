from icemet_web.app import app
from icemet_web.models.database import database_inst, particles_databases
from icemet_web.util import render, api, sql_filt_valid

import flask
import numpy as np

@app.route("/api/hist/<string:database>/<string:table>/", methods=["POST"])
def particles_hist_api_route(database, table):
	databases = particles_databases()
	if not database in databases or not table in databases[database]:
		return api(error="Invalid database or table")
	
	filt = flask.request.form.get("filt", "")
	if not sql_filt_valid(filt):
		return api(error="Invalid parameters")
	elif filt:
		filt = " WHERE "+filt
	
	sql = "SELECT Z, EquivDiam FROM `{}`.`{}`{};".format(database, table, filt)
	try:
		rows = database_inst().select(sql)
	except:
		return api(error="SQL error")
	
	Z, D = [], []
	for row in rows:
		Z.append(row["Z"])
		D.append(row["EquivDiam"])
	Z, D = np.array(Z), np.array(D)
	
	ND, binsD = np.histogram(D, bins=100)
	NZ, binsZ = np.histogram(Z, bins=100)
	return api({
		"hist": {
			"diam": {"N": ND.tolist(), "bins": binsD.tolist()},
			"z": {"N": NZ.tolist(), "bins": binsZ.tolist()}
		}
	})

@app.route("/hist/<string:database>/<string:table>/", methods=["GET"])
def particles_hist_route(database, table):
	databases = particles_databases()
	if not database in databases or not table in databases[database]:
		flask.abort(404)
	return render("histograms.htm", database=database, table=table)
