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

### Failed migration (P3009, API crash loop)

If `migrate deploy` succeeded once but API still fails with **P3009** and an old `started_at`, Prisma left a **duplicate failed row** in `_prisma_migrations`. Remove it:

```bash
docker compose stop api

docker compose exec postgres psql -U foodapp -d foodapp -c \
  "SELECT migration_name, started_at, finished_at, rolled_back_at FROM _prisma_migrations WHERE migration_name = '20250607180000_guest_device_push' ORDER BY started_at;"

docker compose exec postgres psql -U foodapp -d foodapp -c \
  "DELETE FROM _prisma_migrations WHERE migration_name = '20250607180000_guest_device_push' AND finished_at IS NULL;"

docker compose up -d api
curl -sS http://127.0.0.1:4000/api/v1/health
```

Or run `./scripts/db-fix-failed-migration.sh` (optional migration name as first arg).

Manual re-apply without entrypoint migrations:

```bash
docker compose run --rm -e SKIP_MIGRATIONS=true api npx prisma migrate resolve --rolled-back MIGRATION_NAME
docker compose run --rm -e SKIP_MIGRATIONS=true api npx prisma migrate deploy
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
