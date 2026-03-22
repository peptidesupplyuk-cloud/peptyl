const PUBLIC_APP_HOSTS = new Set([
  "peptyl.co.uk",
  "www.peptyl.co.uk",
  "peptyl.lovable.app",
]);

export const isPublicAppHost = (hostname?: string) => {
  if (typeof window === "undefined") return false;
  return PUBLIC_APP_HOSTS.has(hostname ?? window.location.hostname);
};

export const isEditorPreviewHost = () => {
  if (typeof window === "undefined") return false;

  const { hostname, search } = window.location;
  const params = new URLSearchParams(search);

  return (
    hostname.includes("id-preview--") ||
    hostname.endsWith(".lovableproject.com") ||
    params.has("__lovable_token")
  );
};