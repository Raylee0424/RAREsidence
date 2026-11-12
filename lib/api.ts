// Same-origin path; next.config.ts rewrites /api to the NestJS server. The
// session is an httpOnly cookie the browser attaches automatically, so this
// file never sees or stores a token.
const BASE_URL = "/api";

// Logging in is the one call where a 401 means "wrong password", not
// "your session expired".
const LOGIN_PATH = "/auth/login";

interface RequestOptions {
  isFormData?: boolean;
  /** Treat a 401 as a normal error instead of ending the session (e.g. "am I logged in?"). */
  allowUnauthorized?: boolean;
}

// Nest sends `message` as a string, or as a list of validation messages.
function errorMessage(body: unknown, status: number): string {
  const message = (body as { message?: unknown } | null)?.message;
  if (Array.isArray(message)) return message.join(". ");
  if (typeof message === "string" && message) return message;
  return `Request failed (${status})`;
}

function endSession() {
  const { pathname, search } = window.location;
  if (pathname !== "/login") {
    window.location.href = `/login?next=${encodeURIComponent(pathname + search)}`;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: BodyInit,
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: options.isFormData ? undefined : { "Content-Type": "application/json" },
    body,
    credentials: "same-origin",
    cache: method === "GET" ? "no-store" : undefined,
  });

  if (!response.ok) {
    if (response.status === 401 && path !== LOGIN_PATH && !options.allowUnauthorized) {
      endSession();
      throw new Error("Your session has expired. Please log in again.");
    }
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorMessage(errorBody, response.status));
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

function jsonBody(body?: unknown): string | undefined {
  return body === undefined ? undefined : JSON.stringify(body);
}

export function apiGet<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>("GET", path, undefined, options);
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("POST", path, jsonBody(body));
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("PATCH", path, jsonBody(body));
}

export function apiDelete<T>(path: string): Promise<T> {
  return request<T>("DELETE", path);
}

export function apiPostFormData<T>(path: string, formData: FormData): Promise<T> {
  return request<T>("POST", path, formData, { isFormData: true });
}

export function getImageUrl(photoPath?: string | null): string {
  if (!photoPath) {
    return "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80";
  }
  if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) {
    return photoPath;
  }
  // Served through the same /uploads rewrite as the API.
  return `/${photoPath.replace(/^\/+/, "")}`;
}
