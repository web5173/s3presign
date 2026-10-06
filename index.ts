declare module "bun" {
    interface Env {
        EXPIRES_IN: number;
    }
}
import { S3Client } from "bun";

const requiredEnvVars = [
    "S3_ACCESS_KEY_ID",
    "S3_SECRET_ACCESS_KEY",
    "S3_ENDPOINT",
    "PORT",
    "EXPIRES_IN",
];
const missingEnvVars = requiredEnvVars.filter((varName) =>
    !process.env[varName]
);

if (missingEnvVars.length > 0) {
    console.error(
        `${
            new Date().toLocaleString()
        }, Service stop, Because missing environment variables: ${missingEnvVars}`,
    );
    process.exit(1);
}

const s3 = new S3Client({ virtualHostedStyle: true });

const server = Bun.serve({
    routes: {
        "/version": () => new Response("S3 Presigned URL Service v2"),
        "/upload": () => {
            const uploadUrl = s3.presign(crypto.randomUUID(), {
                expiresIn: process.env.EXPIRES_IN,
                method: "PUT",
            });
            return new Response(uploadUrl);
        },
        "/download/:key": (req) => {
            const downloadUrl = s3.presign(req.params.key, {
                expiresIn: process.env.EXPIRES_IN,
            });
            return new Response(downloadUrl);
        },
        "/delete/:key": (req) => {
            s3.file(req.params.key).delete().catch();
            return new Response(null, { status: 202 });
        },
    },
    fetch: () => new Response(null, { status: 403 }),
});
console.info(
    `${new Date().toLocaleString()}, Service start, Listening on ${server.url}`,
);
