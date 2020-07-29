# Express Route System

[![npm version](https://badge.fury.io/js/express-route-system.svg)](https://badge.fury.io/js/express-route-system)
![npm bundle size](https://img.shields.io/bundlephobia/min/express-route-system)  
A route system for expressjs that lets you define routes using a single json file. You can also use typescript or javascript files for the route file.

## Installation

With pnpm: `pnpm i express-route-system`  
With yarn: `yarn add express-route-system`  
With npm: `npm i express-route-system`

## Usage

First, you need to import the route system like so:

```typescript
import { handleRoutes } from "express-route-system";
```

Next, under your express app initialization, call handleRoutes like so:

```typescript
handleRoutes({ router: app, routeFile: "routes.json" });
```

Here you can see we are initializing the routes with your express app as the router and the file name as `routes.json`. You can also specify a `baseDir` (use `__dirname` to get your app's root directory).

### Routes File

Now you can create a routes file which
can be either `.json`, `.ts` or `.js`.
Below is an basic example of a routes file written in typescript:

```ts
export default {
    methods: {
        get: {
            data: "Hello, world!",
        },
    },
    children: [
        {
            path: "test",
            methods: {
                get: {
                    data: "This is a test message.",
                },
            },
        },
    ],
};
```

Here, the root object has a path of `/` if not specified.
You do not have to include slashes in the beginning
of the path property unless you want to.

Each "method" can be either a json object
with a data and a status property,
a custom function (only useable in `.ts` or `.js` files),
or a json object containing a `view` and a `options` property.
If the object has a view property, express will call `res.render(view, options)`.

If it has a data property, it will be considered as a normal response object
and sent using `res.status(status).send(data)`.

A method can also be an array of method handlers,
so you can have mulitple functions for one method.
Here's an example:

```ts
methods: {
    get: [
        async (req, res) => {
            console.log("testing...");
            next();
        },
        {
            data: "This is a test message."
        },
    ]
},
```
