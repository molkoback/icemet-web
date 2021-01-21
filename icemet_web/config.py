from icemet_web import app, datadir, homedir

import os
import shutil
import yaml

default_config_file = os.path.join(homedir, "icemet-web.yaml")
app.config["ICEMET_WEB_CONFIG"] = os.environ.get("ICEMET_WEB_CONFIG", default_config_file)
if not os.path.exists(app.config["ICEMET_WEB_CONFIG"]):
	os.makedirs(os.path.split(app.config["ICEMET_WEB_CONFIG"])[0], exist_ok=True)
	shutil.copy(os.path.join(datadir, "icemet-web.yaml"), app.config["ICEMET_WEB_CONFIG"])

with open(app.config["ICEMET_WEB_CONFIG"], "r") as fp:
	for k, v in yaml.load(fp, Loader=yaml.Loader).items():
		app.config[k] = v
