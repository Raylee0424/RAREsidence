// The session JWT lives in this httpOnly cookie, so page scripts (and any
// injected script) can't read it. frontend/proxy.ts reads the same name.
export const AUTH_COOKIE = 'raresidence_session';
