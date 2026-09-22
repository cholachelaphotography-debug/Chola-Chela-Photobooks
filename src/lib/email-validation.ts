/** Basic checks to reduce obviously fake / disposable signups */

const DISPOSABLE = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "tempmail.com",
  "temp-mail.org",
  "10minutemail.com",
  "throwawaymail.com",
  "yopmail.com",
  "sharklasers.com",
  "trashmail.com",
  "fakeinbox.com",
  "getnada.com",
  "maildrop.cc",
]);

export function validateSignupEmail(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return "Please enter a valid email address";
  }
  const domain = normalized.split("@")[1] || "";
  if (domain.length < 4 || !domain.includes(".")) {
    return "Please enter a valid email domain";
  }
  // Block bare localhost / test domains
  if (
    domain === "localhost" ||
    domain.endsWith(".local") ||
    domain === "test.com" ||
    domain === "example.com" ||
    domain === "example.org"
  ) {
    return "Please use a real email address";
  }
  if (DISPOSABLE.has(domain)) {
    return "Disposable email addresses are not allowed. Please use a permanent email.";
  }
  // Very short local part often spam
  const local = normalized.split("@")[0] || "";
  if (local.length < 2) {
    return "Please enter a valid email address";
  }
  return null;
}
