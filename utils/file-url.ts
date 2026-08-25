export function getFileUrl(
  path?: string | null,
  cacheKey?: string | number | null,
): string | null {
  if (!path) return null;

  const trimmed = path.trim();
  if (!trimmed) return null;

  // If already a full URL (http/https), return directly
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return appendCacheKey(trimmed, cacheKey);
  }

  // If it's a blob URL, return as-is (preview case)
  if (trimmed.startsWith("blob:")) {
    return trimmed;
  }

  // Otherwise proxy backend file
  return appendCacheKey(`/file-api/${trimmed}`, cacheKey);
}

function appendCacheKey(url: string, cacheKey?: string | number | null) {
  if (!cacheKey) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${encodeURIComponent(cacheKey)}`;
}
