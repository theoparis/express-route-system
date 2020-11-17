import {
    RouteOpts,
    Controller,
    RouteHandler,
    Method,
    isRenderRoute,
    isResponseRoute,
    ControllersOrPath,
    MultiRouteHandler,
} from "./types";
import path from "path";
import { Request, Response, RequestHandler, IRouter, Router } from "express";

export const getHandler = (
    handler: RouteHandler | MultiRouteHandler
): Array<RequestHandler> => {
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
                            : JSON.stringify(handler.data)
                    ),
        ];
    else if (Array.isArray(handler))
        return (handler as Array<RouteHandler>).flatMap((h) => {
            return getHandler(h);
        });
    else return [handler];
};

/**
 *
 * @param opts The options to use
 */
function handle(
    controllers: ControllersOrPath,
    rootRouter: IRouter,
    opts: RouteOpts
) {
    controllers.forEach((controller) => {
        if (typeof controller === "string") {
            const routePath = path.join(
                opts.baseDir ?? path.dirname(require.main.filename),
                path.dirname(opts.routeFile),
                controller
            );
            import(routePath)
                .then((imported) => imported.default)
                .then((routes: (Controller | string)[] | Controller) => {
                    Array.isArray(routes)
                        ? handle(routes, rootRouter, opts)
                        : handleController(routes, rootRouter, opts);
                })
                .catch((err) => console.error(`Error loading route:${err}`));
            return;
        } else {
            handleController(controller, rootRouter, opts);
        }
    });
}

const handleController = (
    controller: Controller,
    rootRouter: IRouter,
    opts: RouteOpts
) => {
    let apiPath = controller.path;
    // If the path does not contain a / in the beginning, add it.
    if (apiPath && !apiPath.startsWith("/")) apiPath = "/" + apiPath;

    const handlers = controller.methods;
    if (handlers) {
        const methods = Object.keys(handlers) as Method[];
        // assign handlers for each method
        methods.forEach((method) => {
            rootRouter[method](apiPath ?? "/", getHandler(handlers[method]));
        });
    }

    if (controller.children && controller.children.length > 0) {
        const router = Router();
        handle(controller.children, router, opts);
        rootRouter.use(apiPath ?? "/", router);
    }
};

export function handleRoutes(opts: RouteOpts) {
    // load the current route object
    const routePath = path.join(
        opts.baseDir ?? path.dirname(require.main.filename),
        opts.routeFile
    );
    if (opts.debug) console.log(`Loading routes from ${routePath}...`);
    import(routePath)
        .then((imported) => imported.default)
        .then((routes: (Controller | string)[] | Controller) => {
            handle(
                Array.isArray(routes) ? routes : [routes],
                opts.router,
                opts
            );
        })
        .catch((err) => console.error(`Error loading route:${err}`));
}

export default handleRoutes;
export * from "./types";
