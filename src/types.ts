import { RequestHandler, IRouter } from "express";
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

export interface Controller {
    path?: string;
    methods: Partial<Record<Method, MultiRouteHandler>>;
    children?: (Controller | string)[];
}

export type RouteHandler = RenderRoute | ResponseRoute | RequestHandler;
export type MultiRouteHandler = Partial<RouteHandler>[];

export const isRequestHandlerArray = (obj: unknown): boolean =>
    Array.isArray(obj) && obj.every((h) => typeof h === "function");

export const isRenderRoute = (x: unknown): x is RenderRoute =>
    (x as RenderRoute).view !== undefined;

export type RenderRoute<O = Record<string, unknown>> = {
    view: string;
    options: O;
};

export const isResponseRoute = (x: unknown): x is ResponseRoute =>
    (x as ResponseRoute).data !== undefined;

export type ResponseRoute = {
    status: number;
    data: string | Record<string, unknown>;
};

export type Method =
    | "all"
    | "get"
    | "post"
    | "put"
    | "delete"
    | "patch"
    | "options"
    | "head";

export type ControllersOrPath = (Controller | string)[];
