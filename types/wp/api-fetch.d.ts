// types/wp/api-fetch.d.ts
declare module '@wordpress/api-fetch' {
    export type APIFetchOptions = Record<string, unknown>;
    export type Middleware = (options: APIFetchOptions, next: (opts: APIFetchOptions) => Promise<any>) => Promise<any>;

    const apiFetch: {
        (options: APIFetchOptions): Promise<any>;
        use: (mw: Middleware) => void;
        middlewares: Middleware[];
        clearMiddlewares: () => void;
        createNonceMiddleware: (nonce: string) => Middleware;
        createPreloadingMiddleware: (preloadedData: Record<string, any>) => Middleware;
        setNonce: (nonce: string) => void;
        setRootURL: (url: string) => void;
    };

    export default apiFetch;
}
