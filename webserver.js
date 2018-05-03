const http = require('http');
const url = require('url');
var port = 3000;

const server = http.createServer(function(request, response) {
	const url_parts = url.parse(request.url, true);
	const query = url_parts.query;
		 if (request.method == 'GET') {
			response.writeHead(200,
				{
					'Content-Type': 'application/json',
					'access-control-allow-origin': '*'
				});
			const headers = JSON.stringify(request.headers);
			const data = JSON.stringify(query);
			response.write(JSON.stringify({
				"id": "1A4",
				"body": ":call_me_hand2:",
				"headers": headers,
				"data": data
			}));
			response.end();
		} else {
			var body = '';
			request.on('data', function(data) {
					body += data;
				});
			request.on('end', function() {
					var post = body;
					response.writeHead(200,
						{
							'Content-Type': 'application/json',
							'access-control-allow-origin': '*'
						});
					response.write(JSON.stringify({
						"data": post
					}));
					response.end();
				});
		}
}).listen(port);


server.on('error', (err) => {
	if (err.code === 'EADDRINUSE')
		port = port + 1;
		server.close();
		server.listen(port);
});


