import crypto from "crypto";

export default function generateId(prefix) {
    const timestamp = Date.now().toString(36);
    const randomPart = crypto
        .randomBytes(3)
        .toString("hex");

    return `${prefix}${timestamp}${randomPart}`;
}