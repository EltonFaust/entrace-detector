require('https').globalAgent.options.rejectUnauthorized = false;
require('dotenv').config();

const WebSocket = require('ws');
const fs = require("fs");
const { execSync } = require('child_process');

console.log('Initializing person identifier sockets');
const wssCamMediator = new WebSocket.Server({ port: 9000 });
const wssEntraceManager = new WebSocket.Server({ port: 9001 });

let managers = {};
let entraceNames = process.env.ENTRACE_MANAGER_NAMES.split(',');

console.log('Pre setting managers configs');
process.env.ENTRACE_MANAGER_IDS.split(',').forEach((manager_id, i) => {
	console.log('Set manager %s with identifier %s', entraceNames[i], manager_id);

	managers[manager_id] = {
		name: entraceNames[i],
		isReceiving: true,
		client: null,
		mediators: {},
	};
});
 
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
				ws.send(JSON.stringify({type: 'INITIALIZED'}));
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

			  		let commang = '/root/openface/demos/classifier.py infer ./data/project_dataset/features/classifier.pkl ./data/proccess/' + data.manager_id + '.' + data.format;
			  		let classifierResult = execSync(commang).toString();

			  		console.log('Classifier result', classifierResult);

					managers[data.manager_id].isReceiving = true;
			  		ws.send(JSON.stringify({type: 'PROCESSED'}));
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
