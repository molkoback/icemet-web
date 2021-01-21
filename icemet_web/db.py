from icemet_web import app

from icemet.db import Database

import flask

def database_inst():
	if not hasattr(flask.g, "database_inst"):
		flask.g.database_inst = Database(
			host=app.config["SQL_HOST"],
			port=app.config["SQL_PORT"],
			user=app.config["SQL_USER"],
			password=app.config["SQL_PASSWORD"]
		)
	return flask.g.database_inst

def particles_databases():
	if not hasattr(flask.g, "particles_databases"):
		flask.g.particles_databases = database_inst().particles_databases()
	return flask.g.particles_databases

def stats_databases():
	if not hasattr(flask.g, "stats_databases"):
		flask.g.stats_databases = database_inst().stats_databases()
	return flask.g.stats_databases

@app.teardown_appcontext
def closeDB(error):
	if hasattr(flask.g, "mysql_db"):
		flask.g.mysql_db.close()
