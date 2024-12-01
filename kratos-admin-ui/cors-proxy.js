import http from "http";

http.createServer(onRequestAdmin).listen(4435);
http.createServer(onRequestPublic).listen(4430);

console.log("listening ...");

function onRequestAdmin(client_req, client_res) {
  console.log("serve: " + client_req.url);

  var options = {
    hostname: "127.0.0.1",
    port: 4434,
    path: client_req.url,
    method: client_req.method,
    headers: client_req.headers,
  };

  var proxy = http.request(options, function (res) {
    const headers = res.headers;
    headers["access-control-allow-origin"] = "http://localhost:5173";
    headers["access-control-allow-credentials"] = "true";
    headers["access-control-allow-headers"] = "Content-Type";
    headers["access-control-allow-methods"] =
      "GET, PUT, DELETE, PATCH, HEAD, OPTIONS, POST";
    client_res.writeHead(res.statusCode, headers);
    res.pipe(client_res, {
      end: true,
    });
  });

  client_req.pipe(proxy, {
    end: true,
  });
}

function onRequestPublic(client_req, client_res) {
  console.log("serve: " + client_req.url);

  var options = {
    hostname: "127.0.0.1",
    port: 4433,
    path: client_req.url,
    method: client_req.method,
    headers: client_req.headers,
  };

  var proxy = http.request(options, function (res) {
    const headers = res.headers;
    headers["access-control-allow-origin"] = "http://localhost:5173";
    headers["access-control-allow-credentials"] = "true";
    headers["access-control-allow-headers"] = "Content-Type";
    headers["access-control-allow-methods"] =
      "GET, PUT, DELETE, PATCH, HEAD, OPTIONS, POST";
    client_res.writeHead(res.statusCode, headers);
    res.pipe(client_res, {
      end: true,
    });
  });

  client_req.pipe(proxy, {
    end: true,
  });
}
