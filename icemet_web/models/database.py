from icemet_web.app import app

from icemet.db import Database

import flask

def database_inst():
	if not hasattr(flask.g, "database_inst"):
		try:
			flask.g.database_inst = Database(
				host=app.config["SQL_HOST"],
				port=app.config["SQL_PORT"],
				user=flask.session["SQL_USERNAME"],
				password=flask.session["SQL_PASSWORD"]
			)
		except:
			return None
	return flask.g.database_inst

def particles_databases():
	db_inst = database_inst()
	if db_inst is None:
		return {}
	
	if not hasattr(flask.g, "particles_databases"):
		flask.g.particles_databases = db_inst.particles_databases()
	return flask.g.particles_databases

def stats_databases():
	db_inst = database_inst()
	if db_inst is None:
		return {}
	
	if not hasattr(flask.g, "stats_databases"):
		flask.g.stats_databases = db_inst.stats_databases()
	return flask.g.stats_databases

@app.teardown_appcontext
def close(error):
	if hasattr(flask.g, "database_inst"):
		flask.g.database_inst.close()
