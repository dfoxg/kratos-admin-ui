var http = require('http');

http.createServer(onRequestAdmin).listen(4435);

console.log("listening ...")
function onRequestAdmin(client_req, client_res) {
  console.log('serve: ' + client_req.url);

  var options = {
    hostname: '127.0.0.1',
    port: 4434,
    path: client_req.url,
    method: client_req.method,
    headers: client_req.headers
  };

  var proxy = http.request(options, function (res) {
    const headers = res.headers;
    headers["Access-Control-Allow-Origin"] = "http://127.0.0.1:3000"
    headers["Access-Control-Allow-Credentials"] = "true"
    headers["Access-Control-Allow-Headers"] = "Content-Type"
    headers["Access-Control-Allow-Methods"] = "GET, PUT, DELETE, PATCH, HEAD, OPTIONS, POST"
    client_res.writeHead(res.statusCode, headers)
    res.pipe(client_res, {
      end: true
    });
  });

  client_req.pipe(proxy, {
    end: true
  });
}