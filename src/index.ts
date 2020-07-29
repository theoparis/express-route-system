import {
    RouteOpts,
    Route,
    RouteHandler,
    Method,
    isRenderRoute,
    isResponseRoute,
    MultiRouteHandler,
    isRequestHandlerArray,
} from "./types";
import path from "path";
import {
    Request,
    Response,
    RequestHandler,
    IRouter,
    Router,
    IRouterMatcher,
} from "express";

export const getHandler = (handler: RouteHandler): Array<RequestHandler> => {
    if (isRenderRoute(handler))
        return [
            async (_: Request, res: Response) =>
                res.render(handler.view, handler.options),
        ];
    else if (isResponseRoute(handler))
        return [
            async (_: Request, res: Response) =>
                res
                    .status(handler.status || 200)
                    .send(
                        typeof handler.data === "string"
                            ? handler.data
                            : JSON.stringify(handler.data),
                    ),
        ];
    else if (isRequestHandlerArray(handler))
        return handler as Array<RequestHandler>;
    else return getHandler(handler);
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

        let handlers = routeObject.methods;
        if (handlers) {
            let methods = Object.keys(handlers) as Method[];
            // assign handlers for each method
            methods.forEach((method) => {
                rootRouter[method](
                    apiPath || "/",
                    getHandler(handlers[method]),
                );
            });
        }

        if (routeObject.children && routeObject.children.length > 0) {
            const router = Router();
            handle(routeObject.children, router);
            rootRouter.use(apiPath || "/", router);
        }
    });
}

export function handleRoutes(opts: RouteOpts) {
    // load the current route object
    const routePath = path.join(
        opts.baseDir || path.dirname(require.main.filename),
        opts.routeFile,
    );
    if (opts.debug) console.log(`Loading routes from ${routePath}...`);
    import(routePath)
        .then((imported) => imported.default)
        .then((route: Route) => {
            if (route.children) handle([...route.children, route], opts.router);
            else handle([route], opts.router);
        });
}

export default handleRoutes;
export * from "./types";
