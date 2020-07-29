import {
    RouteOpts,
    Route,
    RouteHandler,
    Method,
    isRenderRoute,
    isResponseRoute,
} from "./types";
import path from "path";
import { Request, Response, RequestHandler, IRouter, Router } from "express";

export const getHandler = (handler: RouteHandler): RequestHandler => {
    let result: any = handler;
    if (isRenderRoute(handler))
        result = async (_: Request, res: Response) =>
            res.render(handler.view, handler.options);
    else if (isResponseRoute(handler))
        result = async (_: Request, res: Response) =>
            res
                .status(handler.status || 200)
                .send(
                    typeof handler.data === "string"
                        ? handler.data
                        : JSON.stringify(handler.data),
                );

    return result;
};

/**
 *
 * @param opts The options to use
 */
function handle(routes: Route[], rootRouter: IRouter) {
    routes.forEach((routeObject) => {
        let apiPath = routeObject.path;
        // If the path does not contain a / in the beginning, add it.
        if (apiPath && !apiPath.startsWith("/")) apiPath = "/" + apiPath;

        let handlers = routeObject.handlers;
        let methods = Object.keys(handlers) as Method[];

        if (routeObject.children && routeObject.children.length > 0) {
            const router = Router();
            handle(routeObject.children, router);
            rootRouter.use(apiPath || "/", router);
        }
        // assign handlers for each method
        methods.forEach((method) => {
            rootRouter[method](apiPath || "/", getHandler(handlers[method]));
        });
    });
}

export function handleRoutes(opts: RouteOpts) {
    // load the current route object
    const fun = async () => {
        const routePath = path.join(
            opts.baseDir || path.dirname(require.main.filename),
            opts.routeFile,
        );
        if (opts.debug) console.log(`Loading routes from ${routePath}...`);
        let route: Route = await import(routePath);
        if (route.children) handle([...route.children, route], opts.router);
        else handle([route], opts.router);
    };
    fun();
}

export default handleRoutes;
export * from "./types";
