from icemet_web import homedir
from icemet_web.app import app

import atexit
import os
import pkgutil
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

for loader, name, ispkg in pkgutil.iter_modules([app.config.get("ICEMET_PLUGINS_PATH", os.path.join(homedir, "plugins"))]):
	plugin = loader.find_module(name).load_module(name)
	plugins.append(plugin)

def call_hook(name, *args, **kwargs):
	for plugin in plugins:
		if name in dir(plugin):
			getattr(plugin, name)(*args, **kwargs)

call_hook("init")
atexit.register(lambda : call_hook("close"))
