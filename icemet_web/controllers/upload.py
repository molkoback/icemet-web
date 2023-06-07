from icemet_web.app import app
from icemet_web.util import api
from icemet.file import File

import flask

import os
import uuid

@app.route("/api/upload/", defaults={"path": "/"}, methods=["POST"])
@app.route("/api/upload/<path:path>", methods=["POST"])
def upload_api_route(path):
	files = flask.request.files
	if not "file" in files:
		return api(error="Invalid parameters")
	
	try:
		dir = os.path.join(app.config["ICEMET_WATCH_PATH"], path.strip("/"))
		file = files["file"].filename
		File.frompath(file)
		
		tmp = os.path.join(dir, ".icemet-" + uuid.uuid4().hex + os.path.splitext(file)[1])
		tmp = os.path.normpath(tmp)
		dst = os.path.join(dir, file)
		dst = os.path.normpath(dst)
		if not dst.startswith(app.config["ICEMET_WATCH_PATH"]):
			return api(error="Invalid path")
		
		files["file"].save(tmp)
		os.replace(tmp, dst)
	except Exception as e:
		return api(error="Invalid file")
	return api()
