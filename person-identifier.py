
# https://github.com/dpallot/simple-websocket-server
# https://github.com/ageitgey/face_recognition

import urllib2
import pickle
import json
import face_recognition
from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket

import scipy.misc
from six.moves.urllib.request import build_opener
from io import BytesIO



with open('./data/face-classified-data.txt') as encodingsFile:
	classifiedData = pickle.load(encodingsFile)

managers = {}

managers['id_1'] = {
	'name': 'Teste',
	'client': False,
	'entraces': {},
}

print 'Initializing'

def sendWSMessage(ws, entraceId, messageType, data={}):
	data['entrace_id'] = entraceId
	data['type'] = messageType
	ws.sendMessage(json.dumps(data))

def getEntracePictureToIdentifyFace(ws, managerId, entraceId):
	try:
		opener = build_opener()
		opener.addheaders = [('User-Agent', 'python/face_recognition/1.0')]
		file = BytesIO(opener.open(managers[managerId]['entraces'][entraceId]['urlImage']).read())
		image = scipy.misc.imread(file, mode='RGB')
		face_locations = face_recognition.face_locations(image)

		if len(face_locations) == 0:
			print 'not found any face'
			getEntracePictureToIdentifyFace(ws, managerId, entraceId)
			return

		face_encodings = face_recognition.face_encodings(image, face_locations)
		matches = face_recognition.compare_faces(classifiedData['encodings'], face_encodings[0], tolerance=0.54)

		matchIdentifier = False

		for (i, match) in enumerate(matches):
			if match:
				print 'Match found ', classifiedData['labels'][i]
				matchIdentifier = classifiedData['labels'][i]
				break

		if matchIdentifier:
			sendWSMessage(ws, entraceId, 'identified', {'identifier': matchIdentifier})
		else:
			sendWSMessage(ws, entraceId, 'not_identified')
	except Exception as inst:
		print type(inst)     # the exception instance
		print inst.args      # arguments stored in .args
		print inst           # __str__ allows args to be printed directly
		x, y = inst.args
		print 'x =', x
		print 'y =', y

class PersonIdentifier(WebSocket):
	def handleMessage(self):
		print 'Data received {}'.format(self.data)

		try:
			data = json.loads(self.data)

			if not managers[data['manager_id']]:
				print 'Manager with identifier {} not configured'.format(data['manager_id'])
				return

			if not managers[data['manager_id']]['client']:
				print 'Manager client set for id {}'.format(data['manager_id'])
				managers[data['manager_id']]['client'] = self

			if data['type'] == 'initialize':
				managers[data['manager_id']]['entraces'][data['entrace_id']] = {
					'isReceiving': True,
					'urlImage': data['url_image']
				}

				sendWSMessage(self, data['entrace_id'], 'initialized')
				return

			if not managers[data['manager_id']]['entraces'][data['entrace_id']]:
				print 'Entrace with id {} not initialized'.format(data['entrace_id'])
				return

			if data['type'] == 'start_identifier':
				getEntracePictureToIdentifyFace(self, data['manager_id'], data['entrace_id'])
		except Exception as inst:
			print type(inst)     # the exception instance
			print inst.args      # arguments stored in .args
			print inst           # __str__ allows args to be printed directly
			x, y = inst.args
			print 'x =', x
			print 'y =', y
		

		# if (!managers[data.manager_id].client) {
		# 	console.log('Manager client set for id %s', data.manager_id);
		# 	managers[data.manager_id].client = ws;
		# }
	   # for client in clients:
	   #	if client != self:
	   #	   client.sendMessage(self.address[0] + u' - ' + self.data)

	def handleConnected(self):
		print 'connected'
		# print(self.address, 'connected')
		# response = urllib2.urlopen('http://www.example.com/')
		# html = response.read()
		# for client in clients:
		# 	client.sendMessage(self.address[0] + u' - connected')
		# clients.append(self)

	def handleClose(self):
		print 'close'
		# clients.remove(self)

server = SimpleWebSocketServer('', 9001, PersonIdentifier)
server.serveforever()


# print classifiedData['labels'][0]



