import { handleRoutes } from "../src";
import express from "express";

const app = express();

handleRoutes({ router: app, routeFile: "./routes.ts" });

app.listen(5080, () => console.log(`Listening on :5080`));
