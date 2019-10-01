const url = require("url");
const express = require("express");
const args = require("./args");
const configureOAuth = require("./configureOAuth");
const port = 3000;

const app = configureOAuth(express(), args.getOAuthConfiguration(process.argv));

app.get("/requiresAuthentication", (request, response) => {
    app.oauth.authenticate()(request, response, (...args) => {
        if (args.sever_error) {
            throw args.sever_error;
        }

        const urlParts = url.parse(request.url, true);
        const query = urlParts.query;

        response.writeHead(200, {
            "Content-Type": "application/json",
            "access-control-allow-origin": "*"
        });

        const headers = JSON.stringify(request.headers);
        const data = JSON.stringify(query);
        response.write(
            JSON.stringify({
                id: "SomeId",
                body: "This request was authenticated",
                headers: headers,
                data: data
            })
        );

        response.end();
    });
});

app.get("/", (request, response) => {
    const urlParts = url.parse(request.url, true);
    const query = urlParts.query;

    response.writeHead(200, {
        "Content-Type": "application/json",
        "access-control-allow-origin": "*"
    });

    const headers = JSON.stringify(request.headers);
    const data = JSON.stringify(query);
    response.write(
        JSON.stringify({
            id: "1A4",
            body: ":call_me_hand2:",
            headers: headers,
            data: data
        })
    );
    response.end();
});

app.post("/", (request, response) => {
    var body = "";
    request.on("data", function(data) {
        body += data;
    });
    request.on("end", function() {
        var post = body;
        response.writeHead(200, {
            "Content-Type": "application/json",
            "access-control-allow-origin": "*"
        });
        response.write(
            JSON.stringify({
                data: post
            })
        );
        response.end();
    });
});

app.listen(port);

console.log("Listening for requests...");
