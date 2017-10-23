require('dotenv').config();
require('https').globalAgent.options.rejectUnauthorized = false;

const request = require('request');
const WebSocket = require('ws');

console.log('Initializing cam mediator sockets');
const ws = new WebSocket(process.env.PERSON_IDENTIFIER_CAM_WS);

let currentImageData = null;

const loadImage = () => {
	request.get(process.env.MEDIATOR_SHOT_BASE_URL.replace(/\{rand\}/, Math.random()), (error, response, body) => {
	    if (!error && response.statusCode == 200) {
	        console.log('Image loaded succefully');
	        currentImageData = new Buffer(body).toString('base64');
	    } else {
	    	console.log('Cam mediator failed to load image')
	    	currentImageData = null;
	    	setTimeout(loadImage, 200);
	    }
	});
}

const sendWSMessage = (type, data) => {
	data = data || {};
	data.type = type;
	data.manager_id = process.env.MEDIATOR_MANAGER_ID;
	data.mediator_id = process.env.MEDIATOR_ID;

	ws.send(JSON.stringify(data));
}

const sendCurrentImage = () => {
	console.log('sendCurrentImage');

	if (currentImageData == null) {
		return;
	}

	console.log('Mediator sending image');
	sendWSMessage('IMAGE', {format: 'jpg', data: currentImageData,});
}

ws.on('open', () => {
	sendWSMessage('INITIALIZE');
});

ws.on('message', (data) => {
	data = JSON.parse(data);

	switch(data.type) {
		case 'INITIALIZED':
			let interval = setInterval(() => {
				if (currentImageData) {
					clearInterval(interval);
					sendCurrentImage();
				} else {
					console.log('Initialized but not ready, retrying in 100ms');
				}
			}, 100);
			break;
		case 'PROCESSED':
			sendCurrentImage();
			break;
	}
});

loadImage();

//require('https').globalAgent.options.rejectUnauthorized = false; 

/*
const fs = require('fs');
const client = require('socket.io-client');
console.log('Connecting')
const socket = client(
	urlIdentifierService,
	{
		transports: ['websocket'], 
		path: '/', 
		secure: true,
		rejectUnauthorized: false,
	}
);
console.log('Connecting 2')

// socket.emit('test', 1)

// client.setConnectTimeout(5000);
// client.setReadTimeout(15000);
// client.setWriteTimeout(15000);
setTimeout(() => {
	socket.send(JSON.stringify({'type': 'NULL'}))
}, 1000)

socket.on('connection', () => {
	console.log('connection')
});
socket.on('connect', () => {
	console.log('connect')
});
socket.on('event', (data) => {
	console.log('event', data)
});
socket.on('binary', function (buf) {
	console.log('binary')
})
socket.on('disconnect', () => {
	console.log('disconnect')
});

socket.on('connect_error', (error) => {
  console.log('connect_error', error)
});
socket.on('connect_timeout', (timeout) => {
  console.log('connect_timeout', timeout)
});
socket.on('error', (error) => {
  console.log('error', error)
});
socket.on('reconnect', (attemptNumber) => {
  console.log('reconnect', attemptNumber)
});
socket.on('reconnect_attempt', (attemptNumber) => {
  console.log('reconnect_attempt', attemptNumber)
});
socket.on('reconnecting', (attemptNumber) => {
  console.log('reconnecting', attemptNumber)
});


// http://192.168.1.6:8080/shot.jpg?rnd=897447
*/
