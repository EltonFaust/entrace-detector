
# https://github.com/dpallot/simple-websocket-server
# https://github.com/ageitgey/face_recognition

import urllib2
import pickle
import json
import face_recognition
from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket

with open('./data/face-classified-data.txt') as encodingsFile:
	classifiedData = pickle.load(encodingsFile)


managers = {}

managers['id_1'] = {
	'name': 'Teste',
	# 'client': 0,
	'entraces': {},
}

def getEntraceImage():
	print 'teste'

class PersonIdentifier(WebSocket):

	def handleMessage(self):
		data = json.load(self.data)

		if not managers[data.manager_id]:
			print 'Manager with identifier {} not configured'.format(data.manager_id)
			return

		if not managers[data.manager_id].client:
			print 'Manager client set for id {}'.format(data.manager_id)
			managers[data.manager_id].client = self

		if data.type == 'initialize':
			managers[data.manager_id].entraces[data.entrace_id] = {
				'isReceiving': True,
				'urlImage': data.url_image
			}

			return

		if not managers[data.manager_id].entraces[data.entrace_id]:
			print 'Entrace with id {} not initialized'.format(data.entrace_id)
			return


			

			# console.log('Manager with identifier %s not configured!', data.manager_id);
			# return;
		

		# if (!managers[data.manager_id].client) {
		# 	console.log('Manager client set for id %s', data.manager_id);
		# 	managers[data.manager_id].client = ws;
		# }
	   # for client in clients:
	   #	if client != self:
	   #	   client.sendMessage(self.address[0] + u' - ' + self.data)

	def handleConnected(self):
		print(self.address, 'connected')
		response = urllib2.urlopen('http://www.example.com/')
		html = response.read()
		# for client in clients:
		# 	client.sendMessage(self.address[0] + u' - connected')
		# clients.append(self)

	def handleClose(self):
		print 'close'
		# clients.remove(self)

server = SimpleWebSocketServer('', 9001, PersonIdentifier)
server.serveforever()


# print classifiedData['labels'][0]



