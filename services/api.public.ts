import { CONFIG } from "./config";

type JsonObject = Record<string, unknown>;

export async function publicApi<TResponse, TRequest extends JsonObject>(
  path: string,
  options: Omit<RequestInit, "body"> & { body?: TRequest },
): Promise<TResponse> {
  const isFormData = options.body instanceof FormData;

  let finalBody: BodyInit | undefined;

  if (isFormData) {
    finalBody = options.body as unknown as FormData;
  } else {
    const payload: JsonObject = {
      ...(options.body ?? {}),
      orgId: CONFIG.ORG_ID,
    };
    console.log("Request payload:", payload)
    console.log(CONFIG.ORG_ID)
    finalBody = JSON.stringify(payload);
  }

  const res = await fetch(`/api${path}`, {
    ...options,
    body: finalBody,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let message = "Request failed";

    try {
      const err = await res.json();
      message = err?.message ?? JSON.stringify(err);
    } catch {}

    throw new Error(message);
  }

  return res.json();
}
