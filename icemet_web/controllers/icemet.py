from icemet_web import app, version
from icemet_web.util import render

import flask

@app.route("/")
def index():
	return render("icemet.htm", version=version)

@app.route("/database/")
def icemet_database():
	return flask.redirect(app.config["PHPMYADMIN_URL"])

@app.route("/help/")
def icemet_help():
	return render("help.htm")
