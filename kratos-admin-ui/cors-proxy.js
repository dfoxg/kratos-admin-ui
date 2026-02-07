import http from "http";

http.createServer(onRequestAdmin).listen(4435);
http.createServer(onRequestPublic).listen(4430);

console.log("listening ...");
function getCorsHeaders(client_req) {
  return {
    "access-control-allow-origin": "http://localhost:5173",
    "access-control-allow-credentials": "true",
    "access-control-allow-headers":
      client_req.headers["access-control-request-headers"] || "Content-Type",
    "access-control-allow-methods":
      "GET, PUT, DELETE, PATCH, HEAD, OPTIONS, POST",
  };
}

function handlePreflight(client_req, client_res) {
  if (client_req.method === "OPTIONS") {
    client_res.writeHead(200, getCorsHeaders(client_req));
    client_res.end();
    return true;
  }
  return false;
}

function proxyToPort(port, client_req, client_res) {
  var options = {
    hostname: "127.0.0.1",
    port: port,
    path: client_req.url,
    method: client_req.method,
    headers: client_req.headers,
  };

  var proxy = http.request(options, function (res) {
    const headers = res.headers || {};
    Object.assign(headers, getCorsHeaders(client_req));
    client_res.writeHead(res.statusCode, headers);
    res.pipe(client_res, { end: true });
  });

  client_req.pipe(proxy, { end: true });
}

function onRequestAdmin(client_req, client_res) {
  console.log("serve: " + client_req.url);

  if (handlePreflight(client_req, client_res)) return;

  proxyToPort(4434, client_req, client_res);
}

function onRequestPublic(client_req, client_res) {
  console.log("serve: " + client_req.url);

  if (handlePreflight(client_req, client_res)) return;

  proxyToPort(4433, client_req, client_res);
}
