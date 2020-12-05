const PORT = 3002;
const THROTTLE = 1500;
const express = require('express');

// 1. Init express
const app = express();

app.set('json spaces', 2);
app.use(express.json());
app.use(express.static('src/apidoc'));

// 2. Middleware
const cors = require('cors');
app.use(cors());
console.log('CORS is enabled ...');

app.use(function (req, res, next) {
	if (req.originalUrl.includes('favicon.ico') || req.method === 'OPTIONS') {
		res.status(204).end();
	} else {
		const logger = `${res.statusCode} ${req.method} ${req.originalUrl}`;
		console.log(logger);
		setTimeout(next, Math.random() * THROTTLE);
	}
});

// 3. Use Routes
app.all('*', function (req, res) {
	let path = req.originalUrl;

	try {
		if (path.startsWith('/ApiDoc') && path.includes('/ApiDoc')) {
			// Request from API Doc - Web
			if (path === '/ApiDoc/api') {
				const mock = require('./mockdata/api.json');
				res.json({
					detail: mock,
				});
			} else {
				path = path.replace('/ApiDoc', '');
				const mockReq = require('./mockdata' + path + '/request.json');
				const mockRes = require('./mockdata' + path + '/response.json');

				const Res = {
					detail: {
						reqData: mockReq,
						resData: mockRes,
					},
				};
				res.json(Res);
			}
		} else {
			// Others Request
			const mock = require('./mockdata' + path + '/response.json');
			res.json(mock);
		}
	} catch (error) {
		console.log(error);

		res.json({
			detail: `API ${path} is not mocked (existed)`,
			Message: `API ${path} is not mocked (existed)`,
		});
	}
});

// 4. Start Express
app.listen(PORT, () => {
	console.log(`Mock server started on port ${PORT}`);
});
