import {
    RequestHandler,
    IRouter,
} from "express";
/**
 * If baseDir is specified,
 * you can use path.dirname(require.main.filename) or __dirname to get your app's root folder.
 */
export interface RouteOpts {
    router: IRouter;
    baseDir?: string;
    routeFile: string;
    debug?: boolean;
}

export interface Route {
    path: string;
    handlers: Record<Method, RouteHandler>;
    children: Route[];
}

export type RouteHandler = RequestHandler<any> | RenderRoute | ResponseRoute;

export const isRenderRoute = (x: any): x is RenderRoute => "view" in x;

export type RenderRoute = {
    view: string;
    options: object;
};

export const isResponseRoute = (x: any): x is ResponseRoute =>
    (x as ResponseRoute).data !== undefined;

export type ResponseRoute = {
    status: number;
    data: string | object;
};

export type Method =
    | "get"
    | "post"
    | "put"
    | "delete"
    | "patch"
    | "options"
    | "head";
