import crypto from "crypto";

const SECRET = process.env.BOOKING_TOKEN_SECRET!;

export function signToken(payload: object) {
  const json = JSON.stringify(payload);
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(json)
    .digest("hex");

  return Buffer.from(json).toString("base64") + "." + sig;
}

export function verifyToken(token: string) {
  const [data, sig] = token.split(".");
  const json = Buffer.from(data, "base64").toString();

  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(json)
    .digest("hex");

  if (sig !== expected) throw new Error("Invalid token");
  return JSON.parse(json);
}
