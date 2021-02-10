from icemet_web.app import app
from icemet_web.db import database_inst, particles_databases
from icemet_web.util import image_extensions, render, api, sql_filt_valid

from icemet.db import ParticlesRow

import flask

import os

def find_ext(database, table, row):
	root = os.path.join(app.config["ICEMET_RESULTS_PATH"], database, table)
	root_recon = os.path.join(root, "recon")
	root_preview = os.path.join(root, "preview")
	file_recon = row.file()
	file_preview = row.file()
	file_preview.sub = 0
	ext_res, ext_res_lossy = None, None
	for ext in image_extensions:
		if ext_res is None and os.path.exists(file_recon.path(root=root_recon, ext=ext)):
			ext_res = ext
		if ext_res_lossy is None and os.path.exists(file_preview.path(root=root_preview, ext=ext)):
			ext_res_lossy = ext
	return ext_res, ext_res_lossy

@app.route("/api/images/<string:database>/<string:table>/", methods=["POST"])
def particles_images_api_route(database, table):
	databases = particles_databases()
	if not database in databases or not table in databases[database]:
		return api(error="Invalid database or table")
	
	try:
		perpage = int(flask.request.form.get("perpage", 50))
		page = int(flask.request.form.get("page", 0))
		orderby = flask.request.form.get("order_key", "ID")
		order = flask.request.form.get("order", "DESC")
		if not order.upper() in ["ASC", "DESC"]:
			raise Exception()
		filt = flask.request.form.get("filt", "")
		if not sql_filt_valid(filt):
			raise Exception()
		elif filt:
			filt = " WHERE "+filt
	except:
		return api(error="Invalid parameters")
	
	sql = "SELECT * FROM `{}`.`{}`{} ORDER BY {} {} LIMIT {} OFFSET {};".format(
		database, table,
		filt,
		orderby, order,
		perpage, perpage*page
	)
	try:
		rows = database_inst().select(sql, cls=ParticlesRow)
	except:
		return api(error="SQL error")
	
	particles = []
	root = flask.url_for("particles_files_route", database=database, table=table, img="")
	root_recon = root + "recon"
	root_threshold = root + "threshold"
	root_preview = root + "preview"
	ext_res, ext_res_lossy = None, None
	for row in rows:
		if ext_res is None or ext_res_lossy is None:
			ext_res, ext_res_lossy = find_ext(database, table, row)
			if ext_res is None or ext_res_lossy is None:
				return api(error="Image files not found")
		
		file = row.file()
		file.sub = 0
		file_sub = row.file()
		particles.append({
			"id": row.ID,
			"datetime": row.DateTime.strftime("%Y-%m-%d %H:%M:%S"),
			"x": row.X,
			"y": row.Y,
			"z": row.Z,
			"diam": row.EquivDiam,
			"diamcorr": row.EquivDiamCorr,
			"circ": row.Circularity,
			"dynrange": row.DynRange,
			"effpxsz": row.EffPxSz,
			"img": file_sub.path(root=root_recon, ext=ext_res, sep="/"),
			"imgth": file_sub.path(root=root_threshold, ext=ext_res, sep="/"),
			"imgprev": file.path(root=root_preview, ext=ext_res_lossy, sep="/")
		})
	return api({"page": page, "particles": particles})

@app.route("/images/<string:database>/<string:table>/", methods=["GET"])
def particles_images_route(database, table):
	databases = particles_databases()
	if not database in databases or not table in databases[database]:
		flask.abort(404)
	return render("images.htm", database=database, table=table)

@app.route("/images/<string:database>/<string:table>/<path:img>", methods=["GET"])
def particles_files_route(database, table, img):
	file = os.path.join(app.config["ICEMET_RESULTS_PATH"], database, table, img.replace("/", os.path.sep))
	if not os.path.exists(file):
		flask.abort(404)
	return flask.send_from_directory(os.path.dirname(file), os.path.basename(file))
