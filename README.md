# S3 Presigned URL Generation Service

## 1. Build as a single-file executable:

```bash
bun build --compile ./index.ts --outfile ./bundle/windows-x64/s3presign

# To support CPUs from before 2013, use the baseline version (nehalem)
bun build --compile --target=bun-linux-x64-baseline --minify --sourcemap ./index.ts --outfile ./bundle/linux-x64-baseline/s3/s3presign

# To explicitly only support CPUs from 2013 and later, use the modern version (haswell)
# modern is faster, but baseline is more compatible.
bun build --compile --target=bun-linux-x64-modern --minify --sourcemap ./index.ts --outfile ./bundle/linux-x64-modern/s3/s3presign
```

## 2. Set environment variables:

Set the following environment variables in the .env file:
```bash
S3_ACCESS_KEY_ID="<accessKeyId>"
S3_SECRET_ACCESS_KEY="<secretAccessKey>"
S3_ENDPOINT="https://<bucket-name>.oss-cn-hangzhou.aliyuncs.com"
PORT=<which port the server will listen on>
EXPIRES_IN=<expiration time for a presigned URL>
ALLOWED_ORIGINS="<allowed sources, separated by comma>"
```

## 3. Create a Systemd service to allow your application to start/restart on its own.

Usually created in /lib/systemd/system/s3presign.service
```bash
[Unit]
Description = s3presign

[Service]
Type             = simple
User             = root
Group            = root
LimitNOFILE      = 4096
Restart          = always
RestartSec       = 5s
StandardOutput   = append:/root/s3/std.log
StandardError    = append:/root/s3/std.log
WorkingDirectory = /root/s3
ExecStart        = /root/s3/s3presign

[Install]
WantedBy = multi-user.target
```

## 4. Check status:

```bash
curl 'url'
```

## 5. Get a presigned URL:

```bash
curl 'url' -X POST
```

## 6. Note: Common commands
```bash
systemctl status s3presign
systemctl start s3presign
systemctl stop s3presign
systemctl restart s3presign
```