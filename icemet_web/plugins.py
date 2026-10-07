from icemet_web import homedir
from icemet_web.app import app

import atexit
import importlib.util
import os
import pkgutil
import sys
from threading import Event, Thread

plugins = []

class ThreadRunner:
	def __init__(self):
		self._thread = Thread(target=self.run)
		self._thread.daemon = True
		self._stop = Event()
	
	def run(self):
		raise NotImplementedError()
	
	def start(self):
		self._thread.start()
	
	def stop(self):
		self._stop.set()
		self._thread.join()

plugins_path = app.config.get("ICEMET_PLUGINS_PATH", os.path.join(homedir, "plugins"))
for finder, name, ispkg in pkgutil.iter_modules([plugins_path]):
	spec = finder.find_spec(name)
	plugin = importlib.util.module_from_spec(spec)
	sys.modules[name] = plugin
	spec.loader.exec_module(plugin)
	plugins.append(plugin)

def call_hook(name, *args, **kwargs):
	for plugin in plugins:
		hook = getattr(plugin, name, None)
		if callable(hook):
			hook(*args, **kwargs)

call_hook("init")
atexit.register(call_hook, "close")
