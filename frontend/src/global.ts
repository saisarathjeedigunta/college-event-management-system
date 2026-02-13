// Polyfill for global object required by some libraries (like sockjs-client)
if (typeof global === 'undefined') {
    (window as any).global = window;
}
