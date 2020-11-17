import { Controller } from "../src";

const controllers: Controller = {
    methods: {
        get: [
            {
                data: "Hello, world!",
            },
        ],
    },
    children: [
        {
            // /test
            path: "test",
            methods: {
                get: [
                    {
                        data: "This is a test message.",
                    },
                ],
            },
        },
        {
            // /*, used as 404 route
            path: "*",
            methods: {
                get: [
                    {
                        data: "Not Found!!",
                    },
                ],
            },
        },
    ],
};

export default controllers;
