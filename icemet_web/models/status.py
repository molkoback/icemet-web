from icemet_web.app import app

import flask

import sqlite3
import time

__status_delta__ = 15 * 60

class Status:
	def __init__(self, id, name, time_):
		self.id = int(id)
		self.name = str(name)
		self.time = int(time_)
	
	def delta(self):
		return int(time.time()) - self.time
	
	def status(self):
		return self.delta() < __status_delta__

class StatusContainer:
	def __init__(self, file):
		self.conn = sqlite3.connect(file)
		curs = self.conn.cursor()
		curs.execute("CREATE TABLE IF NOT EXISTS status (ID INTEGER PRIMARY KEY, Name TEXT, Time INTEGER);")
		self.conn.commit()
		curs.close()
	
	def close(self):
		self.conn.close()
	
	def write(self, status):
		curs = self.conn.cursor()
		curs.execute("SELECT 1 FROM status WHERE ID=?;", (status.id,))
		if curs.fetchone() is None:
			curs.execute("INSERT INTO status (ID, Name, Time) VALUES (?, ?, ?);", (status.id, status.name, status.time))
		else:
			curs.execute("UPDATE status SET Name=?, Time=? WHERE ID=?;", (status.name, status.time, status.id))
		self.conn.commit()
		curs.close()
	
	def read(self):
		rows = []
		curs = self.conn.cursor()
		for row in curs.execute("SELECT ID, Name, Time FROM status"):
			rows.append(Status(*row))
		curs.close()
		rows.sort(reverse=True, key=lambda s: s.time)
		return rows

def status_container_inst():
	if not hasattr(flask.g, "status_container"):
		flask.g.status_container = StatusContainer(app.config["ICEMET_STATUS_FILE"])
	return flask.g.status_container

@app.teardown_appcontext
def close(error):
	if hasattr(flask.g, "status_container"):
		flask.g.status_container.close()
