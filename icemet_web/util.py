from icemet_web.models.database import particles_databases, stats_databases

import flask

import string

image_extensions = [".png", ".bmp", ".jpg", ".jpeg"]

def render(tmpl, **kwargs):
	kwargs["particles_databases"] = particles_databases()
	kwargs["stats_databases"] = stats_databases()
	return flask.render_template(tmpl, **kwargs)

def api(obj={}, error=None):
	obj["error"] = error
	return flask.jsonify(obj)

def api(error=None, **kwargs):
	kwargs["error"] = error
	return flask.jsonify(kwargs)

def sql_filt_valid(filt):
	legal = string.ascii_uppercase + string.ascii_lowercase + string.digits + " .'\"()!=<>-:"
	for c in filt:
		if not c in legal:
			return False
	return True
