import { getSession, signOut } from "next-auth/react";

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface FetcherOptions {
  method?: Method;
  data?: any;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined | null>;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3010/api";

export async function fetcher<T>(
  url: string,
  { method = "GET", data, headers = {}, params }: FetcherOptions = {},
): Promise<T> {
  let fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;

  if (params) {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([_, v]) => v != null)
        .map(([k, v]) => [k, String(v)]),
    ).toString();

    if (query) {
      fullUrl += fullUrl.includes("?") ? `&${query}` : `?${query}`;
    }
  }

  const session: any = await getSession();
  const token = session?.user?.backendToken;

  const isFormData = data instanceof FormData;

  const config: RequestInit = {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (!isFormData && data) {
    config.headers = { "Content-Type": "application/json", ...config.headers };
    config.body = JSON.stringify(data);
  } else if (isFormData) {
    config.body = data;
  }

  const res = await fetch(fullUrl, config);

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      signOut({ callbackUrl: "/login" });
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed ${res.status}`);
  }

  return res.json();
}
