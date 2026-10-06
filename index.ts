declare module "bun" {
    interface Env {
        EXPIRES_IN: number;
        ALLOWED_ORIGINS: string;
    }
}
import { S3Client } from "bun";

const requiredEnvVars = [
    "S3_ACCESS_KEY_ID",
    "S3_SECRET_ACCESS_KEY",
    "S3_ENDPOINT",
    "PORT",
    "EXPIRES_IN",
    "ALLOWED_ORIGINS",
];
const missingEnvVars = requiredEnvVars.filter((varName) =>
    !process.env[varName]
);

if (missingEnvVars.length > 0) {
    console.error(new Date().toLocaleString(),`Service stop, Because missing environment variables: ${missingEnvVars}`);
    process.exit(1);
}

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",").map(
    (origin) => origin.trim(),
).filter((origin) => origin !== "");

const s3 = new S3Client({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    endpoint: process.env.S3_ENDPOINT,
    virtualHostedStyle: true,
});

const server = Bun.serve({
    routes: {
        "/": {
            POST: (req) => {
                const origin = req.headers.get("origin") ?? "";
                const isAllowed = allowedOrigins.includes("*") ||
                    allowedOrigins.includes(origin);
                if (!isAllowed) return new Response(null, { status: 403 });
                const url = s3.presign(crypto.randomUUID(), {
                    expiresIn: process.env.EXPIRES_IN,
                    method: "PUT",
                });
                return new Response(url, {
                    headers: { "Access-Control-Allow-Origin": origin },
                });
            },
            GET: () => new Response("S3 Presigned URL Generation Service."),
        },
    },
    fetch: () => new Response(null, { status: 403 }),
});
console.log(new Date().toLocaleString(),`Service start, Listening on ${server.url}`);