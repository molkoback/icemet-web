from icemet_web.app import app
from icemet_web.models.database import database_inst

import flask
from flask_basicauth import BasicAuth

app.secret_key = app.config["SECRET_KEY"]

class ICEMETAuth(BasicAuth):
	def init_app(self, app):
		app.config.setdefault("BASIC_AUTH_REALM", "icemet-web")
		
		@app.before_request
		def before_request():
			if not flask.session.get("LOGGED_IN", False):
				if self.authenticate():
					flask.session["LOGGED_IN"] = True
					if "logout" in str(flask.request.url_rule):
						return flask.redirect(flask.url_for("index_route"))
					return None
				else:
					return self.challenge()
	
	def check_credentials(self, username, password):
		if username in app.config.get("SQL_DISABLED_USERS", []):
			return False
		flask.session["SQL_USERNAME"] = username
		flask.session["SQL_PASSWORD"] = password
		return not database_inst() is None
	
	def logout(self):
		flask.session["LOGGED_IN"] = False
		return auth.challenge()

auth = ICEMETAuth(app)
