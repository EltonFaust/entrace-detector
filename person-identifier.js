require('https').globalAgent.options.rejectUnauthorized = false;
require('dotenv').config();

const WebSocket = require('ws');
const fs = require("fs");
const { execSync } = require('child_process');

console.log('Initializing person identifier sockets');
const wssCamMediator = new WebSocket.Server({ port: 9000 });
const wssEntraceManager = new WebSocket.Server({ port: 9001 });

let managers = {};
let managerNames = process.env.ENTRACE_MANAGER_NAMES.split(',');

console.log('Pre setting managers configs');
process.env.ENTRACE_MANAGER_IDS.split(',').forEach((manager_id, i) => {
	console.log('Set manager %s with identifier %s', managerNames[i], manager_id);

	managers[manager_id] = {
		name: managerNames[i],
		isReceiving: true,
		client: null,
		mediators: {},
	};
});

const sendToWS = (ws, type, data) => {
	data = data || {};
	data.type = type;

	ws.send(JSON.stringify(data));
}
 
wssCamMediator.on('connection', (ws) => {
	console.log('Cam mediator connected');

	ws.on('message', (data) => {
		data = JSON.parse(data);

		if (typeof managers[data.manager_id] == 'undefined') {
			console.log('Manager with identifier %s not configured!', data.manager_id);
			return;
		}

		switch(data.type) {
			case 'INITIALIZE':
				console.log('Mediator with id %s set to manager with id %s', data.mediator_id, data.manager_id)
				managers[data.manager_id].mediators[data.mediator_id] = ws;
				sendToWS(ws, 'INITIALIZED');
				break;
			case 'IMAGE':
				if (!managers[data.manager_id].isReceiving) {
					return;
				}

				managers[data.manager_id].isReceiving = false;

				fs.writeFile('./data/process/' + data.manager_id + '.' + data.format, Buffer.from(data.data, 'base64'), function(err) {
				// fs.writeFile('./data/process/' + data.manager_id + '.' + data.format, data.data, 'base64', function(err) {
			  		if (err) {
			  			console.log(err);
			  			return;
			  		}

			  		try {
				  		let commang = '/root/openface/demos/classifier.py infer /face-detector/data/project_dataset/features/classifier.pkl /face-detector/data/process/' + data.manager_id + '.' + data.format;
				  		let commandResult = execSync(commang).toString();
				  		let classifierResult = commandResult.match(/([0-9]{11})[^\d]+([\d|\.]+)/);
			  			
				  		console.log('Classifier result', commandResult);
				  		// console.log('Classifier result', classifierResult[1], parseFloat(classifierResult[2]));
			  		} catch(e) {
			  			console.log(e.message);
			  		}

					managers[data.manager_id].isReceiving = true;
			  		sendToWS(ws, 'PROCESSED');
				});
				break;
			// case '':
			// 	break;
		}
	});
});
 
wssEntraceManager.on('connection', (ws) => {
	console.log('Entrace manager connected');

	ws.on('message', (data) => {
		data = JSON.parse(data);

		if (typeof managers[data.manager_id] == 'undefined') {
			console.log('Manager with identifier %s not configured!', data.manager_id);
			return;
		}

		if (!managers[data.manager_id].client) {
			console.log('Manager client set for id %s', data.manager_id);
			managers[data.manager_id].client = ws;
		}
	});
});
