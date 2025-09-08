import crypto from "crypto";

export function signNcpRequest(params: {
  method: string;
  pathWithQuery: string;
  timestamp: string;
  accessKey: string;
  secretKey: string;
}): string {
  const { method, pathWithQuery, timestamp, accessKey, secretKey } = params;
  const message = `${method.toUpperCase()} ${pathWithQuery}\n${timestamp}\n${accessKey}`;
  return crypto
    .createHmac("sha256", secretKey)
    .update(message)
    .digest("base64");
}
