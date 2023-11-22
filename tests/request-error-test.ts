// Tests for request error handler

"use strict";

import assert from "assert";
import { RequestErrorHandler, RequestError } from "../src";

describe("Request Error Handler", () => {
    it("Should be able to handle a properly formatted error", () => {
        let errorBody: string;
        let requestError: RequestError;

        errorBody = JSON.stringify({ code: "EXAMPLE_ERROR" });
        requestError = { status: 404, body: errorBody };

        let ok: boolean;

        ok = false;

        new RequestErrorHandler()
            .add(400, "*", () => {
                assert.fail("Wrong handler branch");
            })
            .add(404, "*", () => {
                ok = true;
            })
            .add(403, "*", () => {
                assert.fail("Wrong handler branch");
            })
            .add("*", "*", () => {
                assert.fail("Wrong handler branch");
            })
            .handle(requestError);

        assert.equal(ok, true, "Expected handler branch was not called");

        ok = false;

        new RequestErrorHandler()
            .add(400, "EXAMPLE_ERROR", () => {
                assert.fail("Wrong handler branch");
            })
            .add(404, "*", () => {
                ok = true;
            })
            .add(403, "EXAMPLE_ERROR", () => {
                assert.fail("Wrong handler branch");
            })
            .add("*", "*", () => {
                assert.fail("Wrong handler branch");
            })
            .handle(requestError);

        assert.equal(ok, true, "Expected handler branch was not called");

        ok = false;

        new RequestErrorHandler()
            .add(400, "*", () => {
                assert.fail("Wrong handler branch");
            })
            .add(404, "EXAMPLE_ERROR", () => {
                ok = true;
            })
            .add(404, "*", () => {
                assert.fail("Wrong handler branch");
            })
            .add(403, "*", () => {
                assert.fail("Wrong handler branch");
            })
            .add("*", "*", () => {
                assert.fail("Wrong handler branch");
            })
            .handle(requestError);

        assert.equal(ok, true, "Expected handler branch was not called");
    });

    it("Should be able to handle a badly formatted JSON error", () => {
        let errorBody: string;
        let requestError: RequestError;

        errorBody = JSON.stringify({ randomField: 1 });
        requestError = { status: 404, body: errorBody };

        let ok: boolean;

        ok = false;

        new RequestErrorHandler()
            .add(400, "*", () => {
                assert.fail("Wrong handler branch");
            })
            .add(404, "*", () => {
                ok = true;
            })
            .add(403, "*", () => {
                assert.fail("Wrong handler branch");
            })
            .add("*", "*", () => {
                assert.fail("Wrong handler branch");
            })
            .handle(requestError);

        assert.equal(ok, true, "Expected handler branch was not called");

        ok = false;

        new RequestErrorHandler()
            .add(400, "*", () => {
                assert.fail("Wrong handler branch");
            })
            .add(404, "EXAMPLE_ERROR", () => {
                assert.fail("Wrong handler branch");
            })
            .add(404, "*", () => {
                ok = true;
            })
            .add(403, "*", () => {
                assert.fail("Wrong handler branch");
            })
            .add("*", "*", () => {
                assert.fail("Wrong handler branch");
            })
            .handle(requestError);

        assert.equal(ok, true, "Expected handler branch was not called");
    });

    it("Should be able to handle a badly formatted non-JSON error", () => {
        let errorBody: string;
        let requestError: RequestError;

        errorBody = "example-non-json";
        requestError = { status: 403, body: errorBody };

        let ok: boolean;

        ok = false;

        new RequestErrorHandler()
            .add(400, "*", () => {
                assert.fail("Wrong handler branch");
            })
            .add(404, "*", () => {
                assert.fail("Wrong handler branch");
            })
            .add(403, "*", () => {
                ok = true;
            })
            .add("*", "*", () => {
                assert.fail("Wrong handler branch");
            })
            .handle(requestError);

        assert.equal(ok, true, "Expected handler branch was not called");
    });

    it("Should be able to handle an empty error", () => {
        let requestError: RequestError;

        requestError = { status: 0, body: "" };

        let ok: boolean;

        ok = false;

        new RequestErrorHandler()
            .add(400, "*", () => {
                assert.fail("Wrong handler branch");
            })
            .add(404, "*", () => {
                assert.fail("Wrong handler branch");
            })
            .add(403, "*", () => {
                assert.fail("Wrong handler branch");
            })
            .add("*", "*", () => {
                ok = true;
            })
            .handle(requestError);

        assert.equal(ok, true, "Expected handler branch was not called");
    });
});
