# DigitalOcean Spaces Setup

This project stores all uploaded images in **DigitalOcean Spaces** (S3-compatible object storage). The API no longer writes to a local `/app/uploads` directory in production.

---

## 1. Create a Space

1. Log in to [DigitalOcean](https://cloud.digitalocean.com/).
2. Go to **Spaces Object Storage** → **Create Space**.
3. Choose a region close to your Droplet (e.g. `NYC3`).
4. Enable **CDN** when prompted (recommended).
5. Set **File Listing** to **Restricted** (public access via CDN only).
6. Note the Space name (e.g. `foodapp-assets`).

---

## 2. Create Access Keys

1. Go to **API** → **Spaces access keys** → **Generate New Key**.
2. Save the **Access Key** and **Secret** securely.
3. Grant only the minimum scope needed (read/write on your Space).

---

## 3. CDN configuration

After creating the Space:

1. Open the Space → **Settings** → **CDN**.
2. Enable the CDN endpoint if not already enabled.
3. Your CDN URL looks like:
   `https://foodapp-assets.nyc3.cdn.digitaloceanspaces.com`
4. Set `SPACES_CDN_URL` to this URL (no trailing slash).

Optional: attach a custom domain (e.g. `cdn.yourdomain.com`) via DO CDN settings and CNAME.

---

## 4. Environment variables

Add to `.env` (repo root for Docker Compose) and `backend/.env` for local dev:

| Variable | Example | Description |
|----------|---------|-------------|
| `SPACES_ENDPOINT` | `https://nyc3.digitaloceanspaces.com` | Regional endpoint |
| `SPACES_REGION` | `nyc3` | Same as Space region |
| `SPACES_BUCKET` | `foodapp-assets` | Space name |
| `SPACES_ACCESS_KEY` | `DO00...` | Spaces access key |
| `SPACES_SECRET_KEY` | `...` | Spaces secret key |
| `SPACES_CDN_URL` | `https://foodapp-assets.nyc3.cdn.digitaloceanspaces.com` | Public CDN base URL |

**Production:** The API refuses to start if any `SPACES_*` variable is missing when `NODE_ENV=production`.

**Local development:** Spaces vars are optional for boot, but `POST /upload/image` requires them to be set.

---

## 5. Upload flow

```
Admin UI → POST /api/v1/upload/image (multipart file)
         → UploadService → StorageService.upload()
         → DigitalOcean Spaces (public-read)
         → Response { url, key, filename }
```

- **Max size:** 10 MB  
- **Types:** JPEG, PNG, WebP only  
- **Keys:** `products/{uuid}.webp`, `restaurants/{uuid}.webp`, or `banners/{uuid}.webp`  
  (folder inferred from admin page `Referer` header — no frontend changes)

### Health check

```bash
curl https://your-domain/api/v1/health/storage
# { "status": "ok" }
```

---

## 6. Migration procedure (existing local images)

Use when you already have images under `./uploads` and DB URLs like `/uploads/...`.

### Prerequisites

- Spaces configured and env vars set
- `DATABASE_URL` pointing at your database
- Local files present in `UPLOAD_DIR` (default `./uploads`)

### Run

```bash
cd backend
npm run migrate:images
```

The script:

1. Scans `ProductImage`, `Restaurant.logoUrl`, `Restaurant.coverUrl`, `Banner.imageUrl`
2. Finds rows whose URL contains `/uploads/`
3. Reads the file from `UPLOAD_DIR`
4. Uploads to Spaces (`products/`, `restaurants/`, or `banners/`)
5. Updates the database with the CDN URL

### Verify

- Open admin pages and confirm images load from CDN URLs
- `curl /api/v1/health/storage` → `{ "status": "ok" }`

---

## 7. Rollback procedure

If you must revert to local uploads temporarily:

1. **Redeploy** a previous git commit that used filesystem storage (before Spaces cutover).
2. Restore `.env`: set `UPLOAD_DIR` and `UPLOAD_BASE_URL=/uploads`.
3. Re-enable Nginx `/uploads/` location and Docker `uploads` volume (see git history).
4. **Database:** URLs already migrated to CDN will not work locally unless you:
   - Re-run a reverse migration from CDN URLs back to `/uploads/...` (manual), or
   - Restore a database backup from before migration.

**Recommended:** Keep Spaces as source of truth; rollback is for emergencies only.

---

## 8. Docker / Nginx changes

- API container: no `uploads` volume mount
- Nginx: `/uploads/` static location removed — images served from CDN only
- `client_max_body_size 10M` on Nginx for upload size

---

## 9. CORS (optional)

If the admin UI loads images directly from the CDN domain and you see CORS errors, add a CORS rule on the Space allowing your app origin. Usually not required when using `<img src="cdn-url">`.

---

## 10. Troubleshooting

| Issue | Fix |
|-------|-----|
| `Missing DigitalOcean Spaces configuration` on start | Set all `SPACES_*` vars in production `.env` |
| `health/storage` → `error` | Check keys, bucket name, endpoint region, firewall |
| 403 on image URL | Enable CDN or set object ACL; verify `public-read` on upload |
| Upload 413 | Increase Nginx `client_max_body_size` (already 10M) |
| Wrong folder (`products` vs `banners`) | Upload from the correct admin page so `Referer` matches |
