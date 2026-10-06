# S3 Presigned URL Generation Service

## Important: 不能直接发布到公网，应该部署在你的业务应用之后，且主应用对客户端进行必要的权限校验

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
```

## 3. Create a Systemd service to allow your application to start/restart on its own.

Usually created in /lib/systemd/system/s3presign.service
```bash
[Unit]
Description = s3presign

[Service]
Restart          = always
RestartSec       = 5s
StandardOutput   = append:/opt/s3/std.log
StandardError    = append:/opt/s3/std.log
WorkingDirectory = /opt/s3
ExecStart        = /opt/s3/s3presign

[Install]
WantedBy = multi-user.target
```

## 4. Check version:

```bash
curl 'baseurl/version'
return: 'S3 Presigned URL Service v2'
```

## 5. Get a upload presigned URL:

```bash
curl 'baseurl/upload'
return: 'https://<bucket-name>.oss-cn-hangzhou.aliyuncs.com/<ObjectKey>?<queryString>'
```
## 6. Get a download presigned URL:

```bash
curl 'baseurl/download/<ObjectKey>'
return: 'https://<bucket-name>.oss-cn-hangzhou.aliyuncs.com/<ObjectKey>?<queryString>'
```
## 7. Delete a object:

```bash
curl 'baseurl/delete/<ObjectKey>'
return: null
```
## 8. Note: Common commands
```bash
systemctl status s3presign
systemctl start s3presign
systemctl stop s3presign
systemctl restart s3presign
```