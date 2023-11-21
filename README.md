# Request (Browser)

[![npm version](https://badge.fury.io/js/%40asanrom%2Frequest-browser.svg)](https://badge.fury.io/js/%40asanrom%2Frequest-browser)

Simple library to make API requests from the browser, using [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) and [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest).

Note: This library is just an abstraction for a very specific use case. If you want a more complete library, just use [Axios](https://axios-http.com/) or the native browser APIs.

 - API requests supported methods: `GET`, `POST`, `PUT`, `DELETE`
 - Body can be an object, encoded as `application/json` or an instance of [FormData](https://developer.mozilla.org/en/docs/Web/API/FormData).
 - Response from the server must be `application/json` to be parsed, otherwise is returned as plain text to the result handler.
 - The server must return errors with a status code different from 200 and a JSON body containing a `code` field. Example: `{"code": "ERROR_CODE"}`.

## Installation

In order to add the library to your projects, type:

```
npm install --save @asanrom/request-browser
```

## Usage

In order to make a request to the API, simply use the `makeApiRequest`, specifying the request parameters and the result handlers.

```ts
import { makeApiRequest } from "@asanrom/request-browser";

makeApiRequest({ method: "GET", url: location.protocol + "//" + location.host + "/api/path" })
    .onSuccess(response => {
        console.log("Request response: " + JSON.stringify(response));
    })
    .onRequestError(err => {
        console.log("The request failed. Status code = " + err.status + " / Details = " + JSON.stringify(err.body));
    })
    .onCancel(() => {
        console.log("The request was cancelled");
    })
    .onUnexpectedError(err => {
        console.error(err);
    });
```

### Defining an API

You can define an API in order to check the types of the result and the different kind of possible errors.

In order to do that, just create a function that returns the generic type `RequestParams`, parametrized with the return type and the error handler type.

Example:

```ts
import { RequestParams, RequestErrorHandler, CommonErrorHandler } from "@asanrom/request-browser";

/**
 * Expected result type
 */
export type ExampleApiResult = {
    exampleResultField: string,
    otherField: number[],
};

/**
 * Error handler type
 */
export type ExampleApiErrorHandler = CommonErrorHandler & {
    exampleError: () => void,
}

/**
 * Example API definition
 * @param body Request body parameters
 */
export function exampleApi(body: {exampleParameter: number, otherParameter: string}): RequestParams<ExampleApiResult, ExampleApiErrorHandler> {
    return {
        // Set the HTTP method
        method: "POST",
        // Set the request URL
        url: getApiURL(location.protocol + "//" + location.host + "/api/path"),
        // Set JSON request body
        json: body,
        // Optionally, set a function to handle the error
        handleError: (err, handler) => {
            new RequestErrorHandler()
                .add(400, "EXAMPLE_ERROR_CODE", handler.exampleError)
                .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                .handle(err);
        },
    };
}


// Call the API
makeApiRequest(exampleApi({exampleParameter: 1, otherParameter: "example"}))
    .onSuccess(response => {
        console.log("Example field: " + response.exampleResultField);
        console.log("Other field: " + response.otherField);
    })
    .onRequestError((err, handleErr) => {
        handleErr(err, {
            exampleError: () => {
                console.log("Request failed: Example error");
            },
            serverError: () => {
                console.log("Request failed: Internal server error");
            },
            networkError: () => {
                console.log("Request failed: Network or unknown error");
            },
        });
    })
    .onCancel(() => {
        console.log("The request was cancelled");
    })
    .onUnexpectedError(err => {
        console.error(err);
    });

```

### Using named requests

You can use named requests in order to ensure only one instance of the same request is allowed to be running at the same time.

In order to achieve that, use `makeNamedApiRequest`.

You can also use `abortNamedApiRequest` to to abort a request given its name.

```ts
import { makeNamedApiRequest, abortNamedApiRequest } from "@asanrom/request-browser";

function abortRequest() {
    abortNamedApiRequest("example-name");
}

makeNamedApiRequest("example-name", { method: "GET", url: location.protocol + "//" + location.host + "/api/path" })
    .onSuccess(response => {
        console.log("Request response: " + JSON.stringify(response));
    })
    .onRequestError(err => {
        console.log("The request failed. Status code = " + err.status + " / Details = " + JSON.stringify(err.body));
    })
    .onCancel(() => {
        console.log("The request was cancelled");
    })
    .onUnexpectedError(err => {
        console.error(err);
    });
```

## Documentation

 - [Library documentation (Auto-generated)](https://agustinsrg.github.io/request-browser/)
