
const urlCamera = 'http://192.168.1.6:8080/shot.jpg?rnd=';
const urlService = 'wss://localhost:9000/'

const request = require('request');
const WebSocket = require('ws');

require('https').globalAgent.options.rejectUnauthorized = false;
const ws = new WebSocket(urlService);

let currentImageData = null;

const loadImage = () => {
	request.get(urlCamera + Math.random(), (error, response, body) => {
	    if (!error && response.statusCode == 200) {
	        currentImageData = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString('base64');
	    } else {
	    	currentImageData = null;
	    	setTimeout(loadImage, 200);
	    }
	});
}

const sendCurrentImage = () => {
	if (currentImageData == null) {
		return;
	}

	ws.send(JSON.stringify({
		'type': 'FRAME',
		'dataURL': currentImageData,
		"identity": -1,
	}));
}

// currentImageData = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAEsAZADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDgzSU6krYBKOlFFAAelJiloxSHuNPWjFLRQITFL9aSikMcKWkHFOFAhMc0tLRigAo7UuKOOlABS4pNwFNzQA6gtimc0UAKWpppQpNOEfrQBGKUKSeBUoUCl/CgCIJTwop2KKAG4paU0mKYWA0lKaSgBKPrSkYpO9ACd6Q0po7c0gG0UtJQAlFHeg0AhKTtS0lACYpKWigBKMUdKSgANJQaKQCGkxS0lACGilpKALp5pMUpoFaAIRxSUvejGRSGIKSlxRjikAlGKWj60AJRRRSGFOFNFL0oEx340EimdqBQIdmkzQFJpwT1pDG0oUmn7QKdTAYE9aUKM040tACYFLiiigQYpKX3ooGJRiloNAhtApaKAEpKdTaBh1pKXFJQIT8KDQaKAEPrSE5paSgYlJS0hoEJRRRQAlIaU02gANJS0UAIaSlNJSASkpaKAEpO1LSUAXjSU40laAJgYpO9OIzSUgCkNLRQMT3pKUCg0gEoIpcUCkA3HNKQTS04YoAbs9acq4paUUAApcUUooAMUY4oNHagAoopaADFGKO1FACUUtGKAEooooEgpKWkoHcKQUtFACGkpTSGgBMUUtJ3oAaeaQ06koASkNKaSkIQ0lLSUxiGkp1NoEJR3paSgBKQ0po70gG0UppKAEo7UGkpDL9FLzR0rQBtBp1HemA2jFOpKQWGnpRmndqSkAlHFKKKQCCloooAWlFHWloAKDSiigGFLSCloABRRRQAUd6KKAA0CjtRQHUKSlpKACjFBNANABSUtIaAEpKWkoAKSlpKQhKSl5pDQMQ0lLRQIaRSUpopgN6UUppKQDaKU0lACGkzSmjt0oGNNJS0UCEoNFJSGaJpKcO9JWoBSGlopAJikp1JQAlFKKMUgQ2inUmKAExRS0lIBRTqZThzQDFpaKKQBiiiigBaSiimAtFJS0DCikzRmkAZooJpM0CFopKKACiikoAKKOaQGgANIaU0hoASkpaSgQneg0GigY00UGkoEBpO1KaTFACUlLSUAJQaKQ0AJRS0lA0JSUppKQjTxSCloxWoxMUEUuKMYFACGjFGKKQCYxQfrS0mKQxO9IetOxSd6BCUUppKQxO9L0NBpKBWH+9FIPelpAFFFFAxe1JRRQAUGijNABRSZ4pKAFooo6UxC0U3NGaQxTRmkopiAmiik7UgCkpaSgApKKKAA0nag0lACUdqWk4pAIfakpTSUxCUlKaSgApDRSGkMKSjFFAhKTtS0lAGpQaXtRitRiUUtB+lADcUtGKD7UgExRS9KSkAlJS0GgBv0opcUnSkMQ0lONJQAlOFNoBpAPoptFAC0UdqSgBc0neg9KKBi0lFJQIWikoBoAKWkooAWkozRmgAopKOlAhaSikoAXFNpTSUAwpDS0lAAelJRSUAFJS0hpCEpKWkoGIaDQaQ0AJRRRQISkpTSGgDW60dqXOaPrWpQ3FKaMc8UUCQmKKWkpAHWkNKaKAGmilNIaQxOlIaUikpAJSUtIaAEpKXvSGkMUUU3NLQIXNFJmjNAC5pM0UhIoGLRnFNLUZzQA7NJSUUAOzRmm0ooAWikoFAgpaTNFABRmkooEBNFFJQAZooNFIBKSlPSkoAOlIaPrSUCAikpTSUAJSGlpKAEo7UGigBKQ0ppKANc9KKSlArUYd6KB70dKAQUlLRSGN6mjNL3ooEhO9JilNJSGIaSlpCKQDTSGnGm0AJSd6WkNIBDSClPSm0AOzSFsc01nCjrUDSZNK4EjS0wyE96iJzRSAeZDQJDUdJQBMJOad5uBVeigCyJacJB3qrmlDGgC4CDS1VVyKmV807gSUUmc0UwFopKKACiikoAXFJmjNFIQlJS0lABSUtJQAlIetKaSgAptKaSgQUlFFACUUUhoA2KKXpSVqAv4UEUCgmgYg60vNAo70gQlB6UUUAJim4p3SkNIY00lKaSkAlN706kNADTSUppDSGJUUjhafI+0VVY5NJsQEljTSKUZNBFSAlJS5pM0wAUUCigBKKWjFACUUuKCKAAGnq3NR0tAFpWBFPzVZGwasKc07gLmjNJRQIKKKSgANFFJQAZpCaWkPFABmkzRRQAlFFFACUlBooASiig0gEpKWigRsHFHaiithiiko70GgApTSfSikAGkpe9JQAnekNLikNIYhpKXtSYoAaT6UhpTSGgBtIacaY5wM1LGV5m5qHNOc5am4qWIcDgUnWkpwFIQ0ijFPxShaLjI8UYp2KMYouAgWnBeM0oU4qaOIuhIHShsdiDFJiphGaayEUrhYgxzS4pxWlxkUxDelTK3FRkcUo4pgTA0tMU8UtMQuaQUUUAFFJRigAooopAJRRRTASkpeaSkIQ0UtGKBjaKKSgAo5oFONMRrdaKKK1GFFFLigAPSk+lL2pKQBSClJpKACkopKQ7hTTSmkoAaaQ04000hjahnbAxUxqrcN82KTEQjrSmhRmg9agAAp4pqqWPGanW3c9BSbsAztS4GKnFtJ6CjyH7qanmQ7Mg24FPjiLtkjip0ty1X4bcJzgVLnYpIrLakLkjrUttDgEEVc2Z4A5qaK1IUsRUOZokZfkAhh+VV5YtpwRWuYwspyKZc24dcihSE0YUiYNNUVcniMZwRVbAraLuZtDStNK5HFOphbBqhMVPvVJUSn5uakBpiFxSUZoAzQJhRmkPBpcGmAhzSZpxpuKLCADIpO9KKD1oATpRilPSkoAbSk8Uh60UAB6UlKaSgYtJmiigRr96KOKMVqMKKSloBIKMc0UcUgA0neikoAD1ooNBpDGmkPFLQaQDTTTTjTTyKAGmqlwMNVs9Kqzj5qTASPG2nFMjNRqamVgRis2IsW0I2ZPWr8KDsMCqsHCGrcU6JwTWMjRWRY8kYAxVm3tFB3MATUMd3Gx5IAFXYZom+64P41m7lXRFcWiSZIUAgdaZHZZx81aO1WHXNLEg5HcVN2VYgitNpycVYMYAxUgpMc+1IdyhcW59eaqnOwg9a2HUNVG4h5zirQ2Y92A6fSsphgkGtuaIIT6GsmdMMa1joZyTK3eon4NSZw1Nl5rYyEj5bmpsVBFndxViqQDcU8HikNFAgNIaU0maAA0lHWg0AJQaKKAEHNLikHBpTQA1qSnHpTKAFpKUUGgBKKKKBGvQetJS1qMBR7UduKSgBaDSc0UgDOKSlJpKACijNJmkAlJmlzSUDGnmkpSaSgBpNVp+tWTVedckYqWBBnFPU8imOCrYNTQxM5GBWbAsKzeUAvU1PBayyYJOPap7a0/dgsOlSvMsIwTisXLsVYjOnTMQquAKG064h+aN8j61J/aKDHLH6CnDUNxwp/OleQaCQXF5EwDbvxrYt5mbDfnWfG3mDJFW7dxnHSobKWho+ZlaiknEY+bikbgVQum3ZBNSimWP7SgDYLAGmtqFu+QHFY72iOx+c80jaaAuY5mz71paIuZl25ZHXKmsa7BDZqx5dxEuDyB6VXlYuNrDBrRA5FA/epjGnvwxBqPHNaIyJYl4zUtMjGBT6sANJQaSgQp6Uhpe1JQAlLmkzS0AJRSGigBD1p3akPSgHigANNanUh6UCG0p6U3NLQMSloNJQBr0UZpK1EKARQaKO9AxM0tJRQAZpKXvSUgDvSH2oopMEIaTGaU0UAIRTDUhNRmgYhpm3Lg56GnUDg81LAivlG8MBVmwHAqG7IYACrFiMJWL2K6mtEcJxVaa2EhyRmpoyduBUyDPFc7bTKSKAslZcN0HalFssfA6GtHAGQRUTgHoKfOw5UiON1ijIHU1LaMWfNV3SrFoMEYpWKSNRiPKrNnHJq+xzHVWWEyciqUdC2tDJlZxkqOabHesp2yRke4q+IGB6Uj2gJ+7z601bZmTTvcjjnVxwcio3tfMfcBVmGyVX3YINWZFCIQKeiehVn1OTvV2TsvoahQZNW7xDLeMB61AF2jFboye44UvekFKaoQZ4pKKKBCikNFIaACikoFAAaBQaSgBaToaWkPWgBcc0hpe1JQDGnrQKU0lAgpKWkNAGtRSZoFagLmjPNJRQMWgmkzSE0BcXNIaTNFILhRRmkoGFKKbmlHSgAJpjU40xqAG0lLSGkBG55q3aH5QKqOM9Ks2pwKxmho1YatIQBVKE8CrCtmuaRoiZyDSLHupUGetTN+7iLAdqkZQnIVsZqS1xmqTbpJC57mrtpE+Nxq7AnqXnbCinxD5aqylhjIOKmtGypU1T2NGyRkX0pAuOtPPNMLYqbdRCMAKqXL4U4qdmPes69kCoxqkhNmQ2TO7fU1Xbk0/wAzBb3qM1ujBsXNBpKWrEFITRSGkIWikpaAENApKBQApppp3ammgBRQelJS9qBAOlHamjg040DEptONNNAhaKQUtAzToye1ITzRmtRCmjNJntR9aAFopKTNAC8UnekzQaQ0HejNIaTPNADiaM8cUwmmbtp9qBkuc0w0uc9KbmhiCgikHWlpDGVJA3NRmhDh6iS0BM1YW4q0hrOgfnmryuAuTXLJFpluMgU6RwYyDjFZUuoqhwKqzag7IQD1qVFtjci6ZolbG8ZFadtcxiIdK5FZCXyTWot4EtgMAnFaOIuY3Li5jZNowT6UtsNo3etcn9rkE24Mfzres9QRoxuPOKTi7FqVzVJqJm600SB0yvNI7VMSrjJGwprF1GXtmtC5l2isC7cySnBNaxREmRig0w5X6Uu7IrYyuLS0lLTEIaSlNITQAtFIKWgBDSUppvekA7NBFIKU0wG06m0uaQCHrS0hoB4piFpDyKWkpANpaDSUAanpRzSE0VsOwZozmjikPWgBaTpQKDRYBDR9aQ+tIaQC5zSE0GkpAGeKacHrSk0lADQSD7U7OaSikMUc0Ug6U1pAO9MBTTCcNUTyk9OKbkk5NQ2I0o26Gn3ExCYB61DbHclEiMzgCsGtSiuFZ2qZrU7Bz1q3BCq9RUjRqRSvqNIpx2ir3zU/2VOu449KlSEHvTzA2PvUXZooGXLasGJQZAqNC8ZzyK1fKYdDUc8QKZI5p81iHGzLGm3TMu1jzV2SXHNY9kdklWpJTjnpRbUq+hFfT/Keay85NOupd8mB0qvmtYoybuyVhkVDyrUu800nJqrCJhS1DuNG40ICakNRhqcGBoC4tKKaKWgBaaacaaaGAopaZT6QDTQKDSDrQAtAoo70CFopKKBiGkp1NoYF6OUOODzUmRis1GIPFXYmLJk1UX0FclzSZpKK0AeKCKQ8ClzkU0AwnHWkzStTTUsYE0h5o7Uh6UgCkOKQkio3kbNJsCQmo3kAFQs7HvTSaTYEhlOMCo9xpKKQg705uAKaOtPapYye2l2HFXUlXcDWUp5qdWOaiSGa6EEcUsgwMg1WgdttSSu2w81j1Hcb9o2NzUiXIc8A1RenwEgitEhqbNIEkdKNmR81OT7n4VDNKwbAqOpT1GxQhXJqG9lEfyg8mpDIwQ1lzuzOSTVolshY5bNNpTSd63RmFJRRQMKXtSUtCEJSikNA6UAPDU8VDTlJBoAlpppR0zQaBjacKb3pRSQCmm04000MBRQaKKBADxRSDrTqBiU006kNAH//2Q==";

ws.on('open', () => {
	ws.send(JSON.stringify({'type': 'NULL'}), () => {
		sendCurrentImage();
	});
	// ws.send(JSON.stringify({
	// 	'type': 'TRAINING',
	// 	'val': false,
	// }));

});

ws.on('message', (data) => {
	data = JSON.parse(data);

	if (data.type == 'PROCESSED') {
		sendCurrentImage();
	}
});

loadImage();

//require('https').globalAgent.options.rejectUnauthorized = false; 

/*
const fs = require('fs');
const client = require('socket.io-client');
console.log('Connecting')
const socket = client(
	urlService,
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
