import crypto from "crypto";

const SECRET = process.env.BOOKING_TOKEN_SECRET!;

// Base64URL helpers
function base64urlEncode(str: string) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64urlDecode(str: string) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = str.length % 4;
  if (pad) str += "=".repeat(4 - pad);
  return Buffer.from(str, "base64").toString();
}

export function signToken(payload: object) {
  const json = JSON.stringify(payload);

  const data = base64urlEncode(json);
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("hex");

  return `${data}.${sig}`;
}

export function verifyToken(token: string) {
  const [data, sig] = token.split(".");
  if (!data || !sig) throw new Error("Invalid token");

  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    throw new Error("Invalid token");
  }

  return JSON.parse(base64urlDecode(data));
}
