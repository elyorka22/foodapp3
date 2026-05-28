# Deployment Guide — DigitalOcean VPS

## Server requirements (MVP)

- **Droplet**: 2 vCPU / 4 GB RAM (Ubuntu 22.04+)
- **Domains**: `app.yourdomain.com` (optional for MVP: use IP)

## 1. Initial server setup

```bash
ssh root@YOUR_DROPLET_IP

apt update && apt upgrade -y
apt install -y docker.io docker-compose-plugin git ufw certbot

ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable

adduser deploy
usermod -aG docker deploy
```

## 2. Deploy application

```bash
su - deploy
git clone <your-repo> /opt/foodapp
cd /opt/foodapp
cp .env.example .env
nano .env   # set JWT_SECRET, POSTGRES_PASSWORD, CORS_ORIGINS, domains
```

Generate JWT secret:

```bash
openssl rand -base64 48
```

Build and start:

```bash
docker compose up -d --build
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed
```

## 3. SSL with Certbot (recommended)

Use Certbot standalone or nginx plugin after pointing DNS A-record to droplet:

```bash
certbot certonly --standalone -d app.yourdomain.com
```

Mount certs in `nginx/conf.d/foodapp.conf`:

```nginx
listen 443 ssl;
ssl_certificate /etc/letsencrypt/live/app.yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/app.yourdomain.com/privkey.pem;
```

Add HTTP → HTTPS redirect on port 80.

## 4. Environment variables (production)

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Long random string (required) |
| `POSTGRES_PASSWORD` | Strong DB password |
| `CORS_ORIGINS` | `https://app.yourdomain.com` |
| `NEXT_PUBLIC_API_URL` | `https://app.yourdomain.com/api/v1` |
| `NEXT_PUBLIC_WS_URL` | `https://app.yourdomain.com` |

## 5. Health checks

```bash
curl http://localhost/api/v1/health
```

Expected: `{ "status": "healthy", "services": { "database": "ok", "redis": "ok" } }`

## 6. Backups

```bash
chmod +x scripts/backup-db.sh
# Cron daily at 3 AM
0 3 * * * /opt/foodapp/scripts/backup-db.sh
```

Also snapshot the DigitalOcean volume weekly.

## 7. Updates

```bash
cd /opt/foodapp
git pull
docker compose up -d --build
docker compose exec api npx prisma migrate deploy
```

## 8. Scaling path (post-MVP)

1. **Managed PostgreSQL** — move `DATABASE_URL` off droplet  
2. **Managed Redis** — update `REDIS_URL`  
3. **S3** — set `STORAGE_PROVIDER=s3` + AWS vars (upload module ready to extend)  
4. **Separate API droplet** — point Nginx upstream to new IP  
5. **CDN** — Cloudflare in front of static + images  
6. **Kubernetes** — reuse same Docker images  

## 9. PM2 (optional)

If not using Docker for Node processes:

```bash
npm i -g pm2
cd backend && pm2 start dist/main.js --name foodapp-api
cd frontend && pm2 start npm --name foodapp-web -- start
pm2 save && pm2 startup
```

Docker Compose is recommended for MVP consistency.

## 10. Monitoring

- Uptime: UptimeRobot → `/api/v1/health`
- Logs: `docker compose logs -f api web`
- Disk: watch `uploads` volume size
