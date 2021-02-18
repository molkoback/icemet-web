from icemet_web import version
from icemet_web.app import app
from icemet_web.auth import auth
from icemet_web.util import render

import flask

@app.route("/")
def index_route():
	return render("icemet.htm", version=version)

@app.route("/database/")
def database_route():
	return flask.redirect(app.config["SQL_WEBSITE"])

@app.route("/help/")
def help_route():
	return render("help.htm")

@app.route("/logout/")
def logout_route():
	return auth.logout()
