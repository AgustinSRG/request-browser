// Tests for request

"use strict";

import { makeApiRequest } from "../src";
import assert from "assert";
import HTTP from "http";

let port = 0;
let testServer = "127.0.0.1";

const LastRequest = {
    method: "",
    url: "",
    headers: {} as any,
    jsonBody: null as any,
};

const MustReturn = {
    status: 200,
    body: {} as any,
};

let server: HTTP.Server;

describe("Request", () => {
    before((done) => {
        server = HTTP.createServer((req, res) => {
            LastRequest.method = req.method || "";
            LastRequest.url = req.url || "";
            LastRequest.headers = req.headers;
            LastRequest.jsonBody = null;

            // console.log(`Received request: ${LastRequest.method} ${LastRequest.url}`);

            let data = "";

            req.on("data", chunk => {
                data += chunk;
            });

            req.on("end", () => {
                try {
                    LastRequest.jsonBody = JSON.parse(data);
                } catch (ex) { }

                res.writeHead(MustReturn.status, { "Content-Type": "application/json" });
                res.write(JSON.stringify(MustReturn.body));
                res.end();
            });
        }).listen(0, "127.0.0.1", undefined, () => {
            port = (server.address() as any).port;
            testServer = "127.0.0.1:" + port;
            // console.log("Test server listening on " + testServer);
            done();
        });
    });

    it("Should be able to perform a GET request", async () => {
        return new Promise((resolve, reject) => {
            MustReturn.status = 200;
            MustReturn.body = { field: "example" };

            makeApiRequest({
                method: "GET",
                url: `http://${testServer}/api/test/get?a=1&b=2`,
            })
                .onSuccess((res) => {
                    try {
                        assert.equal(res.field, "example");
                        assert.equal(LastRequest.method, "GET");
                        assert.equal(LastRequest.url, "/api/test/get?a=1&b=2");
                    } catch (ex) {
                        reject(ex);
                    }
                    resolve();
                })
                .onRequestError((err) => {
                    reject(new Error("Request error: " + err.status))
                })
                .onUnexpectedError((err) => {
                    reject(err);
                });
        });
    });

    it("Should be able to handle a GET request error", async () => {
        return new Promise((resolve, reject) => {
            MustReturn.status = 404;
            MustReturn.body = { code: "NOT_FOUND" };

            makeApiRequest({
                method: "GET",
                url: `http://${testServer}/api/test/get?a=1&b=2`,
                headers: {
                    "example-header": "example-value",
                },
            })
                .onSuccess(() => {
                    reject(new Error("Expected request error but got success"));
                })
                .onRequestError((err) => {
                    try {
                        assert.equal(err.status, 404);
                        assert.deepEqual(JSON.parse(err.body), { code: "NOT_FOUND" });
                        assert.equal(LastRequest.method, "GET");
                        assert.equal(LastRequest.url, "/api/test/get?a=1&b=2");
                        assert.equal(LastRequest.headers["example-header"], "example-value");
                    } catch (ex) {
                        reject(ex);
                    }
                    resolve();
                })
                .onUnexpectedError((err) => {
                    reject(err);
                });
        });
    });

    it("Should be able to perform a POST request", async () => {
        return new Promise((resolve, reject) => {
            MustReturn.status = 200;
            MustReturn.body = { field: "example" };

            const jsonBody = {
                bodyField1: 10,
                bodyField2: "test",
            };

            makeApiRequest({
                method: "POST",
                url: `http://${testServer}/api/test/post`,
                json: jsonBody,
                headers: {
                    "example-header": "example-value",
                },
            })
                .onSuccess((res) => {
                    try {
                        assert.equal(res.field, "example");
                        assert.equal(LastRequest.method, "POST");
                        assert.equal(LastRequest.url, "/api/test/post");
                        assert.equal(LastRequest.headers["example-header"], "example-value");
                        assert.deepEqual(LastRequest.jsonBody, jsonBody);
                    } catch (ex) {
                        reject(ex);
                    }
                    resolve();
                })
                .onRequestError((err) => {
                    reject(new Error("Request error: " + err.status))
                })
                .onUnexpectedError((err) => {
                    reject(err);
                });
        });
    });

    it("Should be able to perform a PUT request", async () => {
        return new Promise((resolve, reject) => {
            MustReturn.status = 200;
            MustReturn.body = { field: "example" };

            const jsonBody = {
                bodyField1: 10,
                bodyField2: "test",
            };

            makeApiRequest({
                method: "PUT",
                url: `http://${testServer}/api/test/put`,
                json: jsonBody,
                headers: {
                    "example-header": "example-value",
                },
            })
                .onSuccess((res) => {
                    try {
                        assert.equal(res.field, "example");
                        assert.equal(LastRequest.method, "PUT");
                        assert.equal(LastRequest.url, "/api/test/put");
                        assert.equal(LastRequest.headers["example-header"], "example-value");
                        assert.deepEqual(LastRequest.jsonBody, jsonBody);
                    } catch (ex) {
                        reject(ex);
                    }
                    resolve();
                })
                .onRequestError((err) => {
                    reject(new Error("Request error: " + err.status))
                })
                .onUnexpectedError((err) => {
                    reject(err);
                });
        });
    });

    it("Should be able to perform a DELETE request", async () => {
        return new Promise((resolve, reject) => {
            MustReturn.status = 200;
            MustReturn.body = { field: "example" };

            makeApiRequest({
                method: "DELETE",
                url: `http://${testServer}/api/test/delete?a=1&b=2`,
                headers: {
                    "example-header": "example-value",
                },
            })
                .onSuccess((res) => {
                    try {
                        assert.equal(res.field, "example");
                        assert.equal(LastRequest.method, "DELETE");
                        assert.equal(LastRequest.url, "/api/test/delete?a=1&b=2");
                        assert.equal(LastRequest.headers["example-header"], "example-value");
                    } catch (ex) {
                        reject(ex);
                    }
                    resolve();
                })
                .onRequestError((err) => {
                    reject(new Error("Request error: " + err.status))
                })
                .onUnexpectedError((err) => {
                    reject(err);
                });
        });
    });

    after(() => {
        server.close();
    });
});
