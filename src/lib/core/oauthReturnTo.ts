// Allowlist of app-layer origins permitted to receive an OAuth launch token.
// Comma-separated origins in OAUTH_RETURN_TO_ALLOWLIST, e.g. "http://localhost:3001,https://cityzen.example.com".
export function isAllowedReturnTo(returnTo: string | null): returnTo is string {
  if (!returnTo) return false
  const allow = (process.env.OAUTH_RETURN_TO_ALLOWLIST ?? "")
    .split(",").map((s) => s.trim().replace(/\/$/, "")).filter(Boolean)
  try {
    const u = new URL(returnTo)
    return allow.includes(`${u.protocol}//${u.host}`)
  } catch {
    return false
  }
}
