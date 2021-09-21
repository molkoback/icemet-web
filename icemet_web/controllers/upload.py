from icemet_web.app import app
from icemet_web.util import api
from icemet.file import File

import flask

import os

@app.route("/api/upload/", defaults={"path": "/"}, methods=["POST"])
@app.route("/api/upload/<path:path>", methods=["POST"])
def upload_api_route(path):
	files = flask.request.files
	if not "file" in files:
		return api(error="Invalid parameters")
	
	try:
		root = os.path.normpath(app.config["ICEMET_WATCH_PATH"])
		path = path.strip("/")
		path = os.path.join(root, path, files["file"].filename)
		path = os.path.normpath(path)
		if not path.startswith(app.config["ICEMET_WATCH_PATH"]):
			return api(error="Invalid path")
		File.frompath(path)
		files["file"].save(path)
	except Exception as e:
		return api(error="Invalid file")
	return api()
