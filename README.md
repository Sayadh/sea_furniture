# sea_furniture

Փափուկ կահույքի վաճառքի և վերանորոգման կայք՝ հանրային մաս (SSR, SEO), զամբյուղ և պատվերներ, վերանորոգման հարցումներ նկարներով, պաշտպանված ադմինկա։

| Շերտ | Տեխնոլոգիա |
|---|---|
| Frontend | Nuxt 3, Vue 3 (`<script setup lang="ts">`), TypeScript, Tailwind CSS, Pinia |
| Backend | NestJS 11, TypeScript, Swagger |
| Database | MySQL / MariaDB + Prisma 6 |
| Նկարներ | Սերվերի դիսկում (`UPLOAD_DIR`), sharp → WebP |
| Auth | JWT httpOnly cookies, refresh token rotation + reuse detection, bcrypt |
| Deploy | cPanel hosting (Node.js App) — հիմնական; VPS (Nginx + PM2) — այլընտրանք |

---

## Կառուցվածք

```
sea_furniture/
├── backend/                 NestJS API  (http://127.0.0.1:4000/api)
│   ├── prisma/              schema.prisma, migrations/, seed.ts
│   └── src/
│       ├── auth/            login / refresh (rotation) / logout / me
│       ├── common/          guards, filters (հայերեն սխալներ), DTO-ներ, utils (slug, phone, sanitize)
│       ├── storage/         նկարների պահում դիսկում, ստուգում և WebP փոխակերպում
│       ├── categories/ products/ services/ portfolio/ faqs/
│       ├── orders/          պատվերներ (գների snapshot, soft delete / archive)
│       ├── repair-requests/ վերանորոգման, կապի և խորհրդատվության հարցումներ
│       ├── settings/        կայքի կարգավորումներ (singleton)
│       ├── dashboard/       ադմինկայի վիճակագրություն
│       └── seo/             sitemap-ի տվյալներ
├── frontend/                Nuxt 3  (http://127.0.0.1:3000)
│   ├── pages/               հանրային էջեր + admin/** (SPA, ssr: false)
│   ├── components/          ui/, layout/, product/, forms/, admin/
│   ├── composables/         useApi, useAdminApi, useSeo, useJsonLd, useToast, useConfirm …
│   ├── stores/              cart (localStorage), auth
│   └── server/routes/       sitemap.xml, robots.txt
├── deploy/                  deploy-hosting.sh, build-zips.sh, DEPLOY.md, hosting/ (app.cjs), VPS՝ nginx.conf, deploy.sh, backup-db.sh
└── ecosystem.config.cjs     PM2
```

---

## Տեղական գործարկում (development)

**Պահանջներ՝** Node.js ≥ 20.11, MySQL 8 կամ MariaDB ≥ 10.5 (Mac-ում՝ `brew install mysql` կամ `brew install mariadb`)։

```bash
# 1. Կախվածություններ (monorepo, npm workspaces)
npm install

# 2. Database
mysql -u root -e "CREATE DATABASE sea_furniture CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -e "CREATE USER 'sea'@'localhost' IDENTIFIED BY 'sea_dev_pass'; GRANT ALL ON sea_furniture.* TO 'sea'@'localhost'; GRANT CREATE, DROP, ALTER, REFERENCES ON *.* TO 'sea'@'localhost';"

# 3. Environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

`backend/.env`-ում development-ի համար փոխեք․

```dotenv
NODE_ENV=development
HOST=127.0.0.1
TRUST_PROXY=1
CORS_ORIGINS=http://localhost:3000
SWAGGER_ENABLED=true
DATABASE_URL="mysql://sea:sea_dev_pass@localhost:3306/sea_furniture"
JWT_ACCESS_SECRET=...      # openssl rand -base64 48
JWT_REFRESH_SECRET=...     # openssl rand -base64 48 (տարբեր)
COOKIE_SECURE=false        # localhost-ը http է
SEED_ADMIN_EMAIL=admin@example.am
SEED_ADMIN_PASSWORD=...    # առնվազն 10 նիշ
```

`frontend/.env`-ում՝ `NUXT_PUBLIC_SITE_URL=http://localhost:3000`, `VITE_API_URL=http://127.0.0.1:4000`։

```bash
# 4. Migration + օրինակային տվյալներ
npm run prisma:migrate:deploy -w backend
npm run prisma:seed -w backend

# 5. Գործարկում (երկու տերմինալում)
npm run dev:backend      # http://localhost:4000/api,  Swagger՝ http://localhost:4000/api/docs
npm run dev:frontend     # http://localhost:3000,       ադմինկա՝ http://localhost:3000/admin
```

Nuxt-ը `/api/**` և `/uploads/**` հարցումները proxy է անում backend-ին, ուստի cookie-ները աշխատում են նույն դոմենում։

**Օգտակար հրամաններ**

```bash
npm run build                          # backend + frontend production build
npm run typecheck -w backend
npm run typecheck -w frontend
npm run prisma:migrate -w backend      # նոր migration schema-ի փոփոխությունից հետո (dev)
npm run prisma:studio -w backend
```

---

## Նկարներ

Նկարները պահվում են սերվերի դիսկում՝ `UPLOAD_DIR` թղթապանակում (`products/2026/10/<uuid>.webp`)։ Ամեն նկար ստուգվում է ըստ իրական բովանդակության (ոչ միայն MIME), առավելագույնը 5 ՄԲ է, փոխակերպվում է WebP (max 1920px, metadata-ն հեռացվում է)։ Ադմինկայից ջնջված նկարը ջնջվում է նաև դիսկից։ API-ն դրանք մատուցում է `/uploads/...` հասցեով, իսկ կայքը՝ իր դոմենով (proxy)։

> `UPLOAD_DIR`-ը դրեք **հավելվածի թղթապանակից դուրս** (օր․ `/home/<user>/sea_uploads`), որպեսզի թարմացումների ժամանակ նկարները չջնջվեն, և ներառեք այն backup-ում։

---

## Hosting (HayHost cPanel) — հիմնական տարբերակ

Production-ը աշխատում է երկու Node.js հավելվածով (API՝ `api.seafurniture.am`, կայք՝ `seafurniture.am`)։

```bash
cp frontend/.env.example frontend/.env.production   # մեկ անգամ (NUXT_PUBLIC_SITE_URL, VITE_API_URL)
bash deploy/deploy-hosting.sh                        # SSH (port 2686): build → upload → npm/migrate (եթե պետք է) → restart → ստուգում
bash deploy/build-zips.sh                            # միայն zip-եր ձեռքով վերբեռնելու համար
```

Մանրամասն քայլերը (ինչ վերբեռնել և որտեղ, environment variables, migration, restart, թարմացում, backup)՝ **[deploy/DEPLOY.md](deploy/DEPLOY.md)**։

Backend-ը բազայի հետ կապը ստանում է `DB_HOST/DB_PORT/DB_DATABASE/DB_USERNAME/DB_PASSWORD` փոփոխականներից (`DATABASE_URL`-ը կառուցվում է ավտոմատ) կամ ուղղակի `DATABASE_URL`-ից։ Օրինակ՝ `backend/.env.production.example`։

---

## VPS (Nginx + PM2) — այլընտրանք

Եթե հետագայում տեղափոխվեք VPS։ Ենթադրվում է Ubuntu 22.04+, Node.js 20/22, MySQL/MariaDB, Nginx, PM2 (`npm i -g pm2`), certbot։

```bash
# 1. Database
sudo mysql -e "CREATE DATABASE sea_furniture CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER 'sea_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD'; GRANT ALL ON sea_furniture.* TO 'sea_user'@'localhost';"

# 2. Կոդ
sudo mkdir -p /var/www/sea_furniture && sudo chown $USER /var/www/sea_furniture
git clone <repo-url> /var/www/sea_furniture
cd /var/www/sea_furniture

# 3. Environment
cp backend/.env.example backend/.env     # լրացրեք (տե՛ս ստորև)
cp frontend/.env.example frontend/.env   # NUXT_PUBLIC_SITE_URL=https://ձեր-դոմեն

# 4. Build
npm ci
npm run prisma:migrate:deploy -w backend
npm run prisma:seed -w backend            # առաջին անգամ՝ ստեղծում է ադմինին և օրինակային տվյալները
npm run build

# 5. PM2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup                               # կատարեք տպված հրամանը

# 6. Nginx + HTTPS
sudo cp deploy/nginx.conf /etc/nginx/sites-available/sea_furniture
sudo sed -i 's/example.am/ձեր-դոմեն.am/g' /etc/nginx/sites-available/sea_furniture
sudo ln -s /etc/nginx/sites-available/sea_furniture /etc/nginx/sites-enabled/
sudo certbot certonly --nginx -d ձեր-դոմեն.am -d www.ձեր-դոմեն.am
sudo nginx -t && sudo systemctl reload nginx
```

VPS-ում `backend/.env`-ում․ `HOST=127.0.0.1`, `TRUST_PROXY=1`, `COOKIE_SECURE=true`, `UPLOAD_DIR=/var/www/sea_uploads`, ուժեղ `JWT_*` գաղտնիքներ։ `frontend/.env`-ում՝ `VITE_API_URL=http://127.0.0.1:4000` (build-ից առաջ), իսկ PM2-ում `HOST=127.0.0.1`, `PORT=3000`։

**Թարմացում**՝ `bash deploy/deploy.sh` (git pull → npm ci → migrate → build → pm2 reload)։

**Backup**՝ `deploy/backup-db.sh` (mysqldump, 14 օր պահպանում)՝ cron-ով, օրինակը ֆայլի մեջ է։ Պահեք նաև `UPLOAD_DIR`-ը։

**Մոնիտորինգ**՝ PM2 լոգերը `logs/`-ում են (`pm2 logs`), համակարգային ռեսուրսները՝ Netdata-ում։ API health՝ `GET /api/health`։

---

## Ադմինկա

`/admin` — մուտքը email + password-ով (առաջին ադմինը ստեղծվում է seed-ով `SEED_ADMIN_*` փոփոխականներից)։

- **Վահանակ** — նոր պատվերներ և հարցումներ, ապրանքների քանակ, վերջին պատվերներ, ամենադիտված ապրանքներ, վաճառքն ըստ կարգավիճակի
- **Պատվերներ** — որոնում (հեռախոս / համար / անուն), ֆիլտր ըստ կարգավիճակի և ամսաթվի, կարգավիճակի փոփոխում, ներքին նշում, արխիվ (soft delete) և վերականգնում
- **Հարցումներ** — վերանորոգում (վերբեռնված նկարներով), խորհրդատվություն, հետադարձ կապ
- **Ապրանքներ / Բաժիններ / Ծառայություններ / Աշխատանքներ / FAQ** — CRUD, ակտիվացում, հերթականություն, նկարների վերբեռնում, գլխավոր նկարի ընտրություն
- **Կարգավորումներ** — անվանում, լոգո, կոնտակտներ, սոց. ցանցեր, քարտեզ, banner, առաքման տեղեկատվություն, SEO

Ադմինի գաղտնաբառը փոխելու համար՝ `SEED_ADMIN_PASSWORD=նոր SEED_ADMIN_RESET_PASSWORD=true npm run prisma:seed -w backend`։

---

## Անվտանգություն (ամփոփ)

- Access token (15 րոպե) և refresh token (30 օր) — `httpOnly`, `Secure`, `SameSite` cookie-ներ; refresh token-ը պահվում է DB-ում միայն hash-ով, յուրաքանչյուր refresh-ի ժամանակ փոխվում է, իսկ հին token-ի կրկին օգտագործումը չեղարկում է ամբողջ սեսիաների ընտանիքը
- `bcrypt` (cost 12), timing-safe login, login-ի rate limit (5/րոպե)
- Գլոբալ `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`), HTML-ի մաքրում բոլոր տեքստային դաշտերում, հեռախոսի նորմալացում
- Պատվերի գները հաշվարկվում են միայն սերվերում և snapshot են արվում `OrderItem`-ում
- Rate limiting (NestJS Throttler + Nginx), Helmet, CORS whitelist, honeypot դաշտեր ձևերում
- Ֆայլեր՝ MIME + իրական բովանդակության ստուգում (sharp), չափի սահմանափակում, WebP վերակոդավորում (metadata-ն հեռացվում է)
- Նկարների ջնջումը թույլատրվում է միայն `UPLOAD_DIR`-ի ներսում (path traversal-ից պաշտպանություն)
- Prisma (parameterized queries) — SQL injection-ից պաշտպանություն; frontend-ում `v-html` չի օգտագործվում օգտատիրոջ տվյալների համար, JSON-LD-ն escape է արվում

---

## API

Swagger՝ `/api/docs`։ Հիմնական endpoint-ներ․

| Հանրային | Ադմին (cookie auth) |
|---|---|
| `GET /api/categories`, `/categories/:slug` | `GET/POST/PATCH/DELETE /api/admin/categories`, `PUT …/reorder` |
| `GET /api/products?category&search&minPrice&maxPrice&sort&inStock&page&limit` | `…/admin/products` |
| `GET /api/products/:slug`, `POST /products/:slug/view`, `POST /products/lookup` | `…/admin/services`, `…/admin/portfolio`, `…/admin/faqs` |
| `GET /api/services`, `/services/:slug`, `/portfolio`, `/faqs`, `/settings` | `GET /admin/orders`, `PATCH /admin/orders/:id/status`, `…/note`, `DELETE` (archive), `POST …/restore` |
| `POST /api/orders` | `GET /admin/requests`, `PATCH …/status`, `…/note`, `DELETE`, `POST …/restore` |
| `POST /api/requests/repair` (multipart, ≤5 նկար), `POST /api/requests/contact` | `POST /admin/uploads?folder=…`, `GET/PUT /admin/settings`, `GET /admin/dashboard` |
| `POST /api/auth/login`, `/auth/refresh`, `/auth/logout`, `GET /auth/me` | |
