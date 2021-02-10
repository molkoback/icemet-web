from icemet_web import version
from icemet_web.app import app
from icemet_web.auth import auth
from icemet_web.util import render

import flask

@app.route("/")
def index():
	return render("icemet.htm", version=version)

@app.route("/database/")
def icemet_database():
	return flask.redirect(app.config["SQL_WEBSITE"])

@app.route("/help/")
def icemet_help():
	return render("help.htm")

@app.route("/logout/")
def icemet_logout():
	return auth.logout()
