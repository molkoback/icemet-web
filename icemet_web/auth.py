from icemet_web import app

import flask
from flask_basicauth import BasicAuth

app.secret_key = app.config["SECRET_KEY"]
auth = BasicAuth(app)

@app.before_request
def before_request():
	if not flask.session.get("logged_in", False):
		if auth.authenticate():
			flask.session["logged_in"] = True
		else:
			return auth.challenge()
