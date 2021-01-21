import flask

import os

version = "1.0.0-dev"
datadir =  os.path.join(os.path.dirname(__file__), "data")
homedir = os.path.join(os.path.expanduser("~"), ".icemet")
app = flask.Flask(__name__, template_folder="views", static_folder="static")

import icemet_web.config
import icemet_web.auth
import icemet_web.db

import icemet_web.controllers.icemet
import icemet_web.controllers.images
import icemet_web.controllers.histograms
import icemet_web.controllers.stats
