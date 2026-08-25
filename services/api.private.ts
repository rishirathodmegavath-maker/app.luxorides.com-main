export async function privateApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("fleetovo_client_token")
      : null;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...options.headers,
  };

  const res = await fetch(`/api${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Backend error:", text);
    throw new Error(text);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export async function privateFileApi(path: string): Promise<Blob> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("fleetovo_client_token")
      : null;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`/api${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("File request failed");
  }

  return res.blob();
}
