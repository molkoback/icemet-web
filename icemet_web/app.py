import flask

app = flask.Flask(__name__, template_folder="views", static_folder="static")

import icemet_web.config
import icemet_web.auth
import icemet_web.db

import icemet_web.controllers.icemet
import icemet_web.controllers.images
import icemet_web.controllers.histograms
import icemet_web.controllers.stats
