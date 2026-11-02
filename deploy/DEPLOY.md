# sea_furniture — տեղադրում HayHost cPanel-ում

Կայքը hosting-ում աշխատում է որպես **երկու Node.js հավելված**։

| | API (NestJS) | Կայք (Nuxt SSR) |
|---|---|---|
| ZIP | `deploy/backend.zip` | `deploy/frontend.zip` |
| Թղթապանակ (Application root) | `/home/etbgahjl/seafurniture_api` | `/home/etbgahjl/seafurniture_web` |
| Application URL | `api.seafurniture.am` | `seafurniture.am` |
| Startup file | `dist/main.js` | `app.cjs` |
| Node.js | 22.23.3 | 22.23.3 |
| Run NPM Install | **Այո** | **Ոչ** |

- `public_html`-ում և `api.seafurniture.am` թղթապանակում ոչինչ մի վերբեռնեք։ Դրանք մնում են որպես դոմենների document root, որտեղ cPanel-ը ինքն է գրում իր `.htaccess`-ը։ Կոդը դրանցից դուրս է, ուստի `.env`-ը և մյուս ֆայլերը բրաուզերից հասանելի չեն։
- Այցելուն աշխատում է միայն `https://seafurniture.am`-ով։ Կայքը `/api` և `/uploads` հարցումները ինքն է փոխանցում `https://api.seafurniture.am`-ին։
- Նկարները պահվում են `/home/etbgahjl/sea_uploads`-ում։ Այս թղթապանակը թարմացումների ժամանակ չի փոխվում։

---

## 0. Նախապատրաստում (մեկ անգամ)

1. **MySQL** — բազան (`etbgahjl_seafurniture`) և օգտատերը (`etbgahjl_seauser`) արդեն կան։ Համոզվեք, որ **MySQL Databases** բաժնում օգտատերը ավելացված է բազային **ALL PRIVILEGES**-ով։
2. **SSL** — **SSL/TLS Status** → `seafurniture.am`, `www.seafurniture.am`, `api.seafurniture.am` → **Run AutoSSL**։
3. **File Manager** → `/home/etbgahjl`-ում ստեղծեք երեք թղթապանակ․
   - `seafurniture_api`
   - `seafurniture_web`
   - `sea_uploads`
4. JWT գաղտնիքներ. ձեր Mac-ի Terminal-ում **երկու անգամ** գործարկեք `openssl rand -base64 48`։ Կստանաք երկու տարբեր արժեք։

---

## 1. API (backend)

### 1.1 Վերբեռնում
File Manager → `/home/etbgahjl/seafurniture_api` → **Upload** → `backend.zip` → աջ կլիկ → **Extract**։

Extract-ից հետո թղթապանակում պետք է լինեն `package.json`, `package-lock.json`, `dist/`, `dist-seed/`, `prisma/`, `scripts/`։ Zip-ը կարող եք ջնջել։

### 1.2 Հավելվածի ստեղծում
**Setup Node.js App → Create Application**
- Node.js version՝ **22.23.3**
- Application mode՝ **Production**
- Application root՝ `seafurniture_api`
- Application URL՝ **api.seafurniture.am**, կողքի դաշտը թողեք դատարկ
- Application startup file՝ `dist/main.js`

### 1.3 Environment variables
Նույն էջում **Environment variables → ADD VARIABLE**։ Ավելացրեք յուրաքանչյուրը առանձին (Name / Value)․

| Name | Value |
|---|---|
| `NODE_ENV` | `production` |
| `TRUST_PROXY` | `2` |
| `CORS_ORIGINS` | `https://seafurniture.am,https://www.seafurniture.am` |
| `SWAGGER_ENABLED` | `false` |
| `DB_HOST` | `localhost` |
| `DB_PORT` | `3306` |
| `DB_DATABASE` | `etbgahjl_seafurniture` |
| `DB_USERNAME` | `etbgahjl_seauser` |
| `DB_PASSWORD` | *բազայի իրական գաղտնաբառը* |
| `JWT_ACCESS_SECRET` | *առաջին `openssl` արժեքը* |
| `JWT_REFRESH_SECRET` | *երկրորդ `openssl` արժեքը* |
| `COOKIE_SECURE` | `true` |
| `UPLOAD_DIR` | `/home/etbgahjl/sea_uploads` |
| `SEED_ADMIN_EMAIL` | *ադմինի email-ը* |
| `SEED_ADMIN_PASSWORD` | *ադմինի գաղտնաբառը (առնվազն 10 նիշ)* |

- `PORT` և `HOST` մի ավելացրեք։ cPanel-ը `PORT`-ը տալիս է ինքը։
- Գաղտնաբառը կարող է պարունակել ցանկացած նշան (`@ # / : ? %`)։ Կոդը ինքն է դրանք ճիշտ փոխանցում բազային։

Սեղմեք **CREATE** (կամ **SAVE**)։

### 1.4 NPM Install
Նույն էջում սեղմեք **Run NPM Install** և սպասեք ավարտին (1–3 րոպե)։ Production ռեժիմում տեղադրվում են միայն production փաթեթները։

### 1.5 Migration (բազայի աղյուսակներ) և առաջին ադմին
Հավելվածի էջի վերևում կա հրաման, որը սկսվում է `source /home/etbgahjl/nodevenv/seafurniture_api/22/bin/activate && cd /home/etbgahjl/seafurniture_api`-ով։ Պատճենեք այն։

cPanel → **Terminal** → տեղադրեք պատճենված հրամանը → Enter։

cPanel-ի Environment variables-ը Terminal-ում հասանելի **չեն**, ուստի նույն պատուհանում ժամանակավորապես տվեք դրանք․

```bash
export DB_HOST=localhost DB_PORT=3306 DB_DATABASE=etbgahjl_seafurniture DB_USERNAME=etbgahjl_seauser
read -s -p "DB password: " DB_PASSWORD && export DB_PASSWORD && echo

npm run migrate:deploy
```

`read -s`-ը թույլ է տալիս մուտքագրել գաղտնաբառը այնպես, որ այն չերևա էկրանին և չպահվի հրամանների պատմության մեջ։

Ապա ստեղծեք ադմինին և օրինակային տվյալները (**միայն առաջին տեղադրման ժամանակ**)․

```bash
export SEED_ADMIN_EMAIL='ձեր@email.com'
read -s -p "Admin password: " SEED_ADMIN_PASSWORD && export SEED_ADMIN_PASSWORD && echo

npm run seed:prod
```

Պետք է տեսնեք `✔ Admin created`, `✔ Categories: 6` և այլն։

### 1.6 Restart և ստուգում
**Setup Node.js App** → `api.seafurniture.am` տողում → **Restart** (↻ պատկերակը)։

Բրաուզերում բացեք `https://api.seafurniture.am/api/health` → պետք է տեսնեք `{"status":"ok",...}`։

---

## 2. Կայք (frontend)

### 2.1 Վերբեռնում
File Manager → `/home/etbgahjl/seafurniture_web` → **Upload** → `frontend.zip` → **Extract**։

Պետք է լինեն `app.cjs`, `package.json` և `.output/` թղթապանակը։ `.output`-ը երևում է միայն **Settings → Show Hidden Files** միացված լինելու դեպքում։

### 2.2 Հավելվածի ստեղծում
**Setup Node.js App → Create Application**
- Node.js version՝ **22.23.3**, Application mode՝ **Production**
- Application root՝ `seafurniture_web`
- Application URL՝ **seafurniture.am**, դաշտը թողեք դատարկ
- Application startup file՝ `app.cjs`
- Environment variables՝ **պետք չեն** (կայքի և API-ի հասցեները արդեն build-ի մեջ են)

**CREATE**։ **Run NPM Install-ը պետք չէ**, քանի որ բոլոր անհրաժեշտ ֆայլերը արդեն `.output`-ում են։

### 2.3 Ստուգում
- `https://seafurniture.am` — գլխավոր էջ
- `https://seafurniture.am/admin` — մուտք 1.5 քայլի ադմինի email-ով և գաղտնաբառով
- Ադմինկա → **Կարգավորումներ** → լրացրեք հեռախոսը, WhatsApp-ը, հասցեն և սոց. ցանցերը

Մուտքից հետո կարող եք cPanel-ում ջնջել `SEED_ADMIN_PASSWORD` փոփոխականը։

---

## 3. Restart

**Setup Node.js App** → հավելվածի տողում → **Restart**։

Restart պետք է անել․
- environment variable փոխելուց հետո (միայն API-ի համար),
- նոր zip վերբեռնելուց հետո,
- եթե կայքը չի բացվում։

Եթե երկար ժամանակ այցելուներ չեն եղել, cPanel-ը կարող է «քնեցնել» հավելվածները։ Առաջին այցելուի համար էջը կբացվի մի քանի վայրկյան ուշացումով։ Սա նորմալ է։

---

## 4. Թարմացում (կոդի նոր տարբերակ)

Ապրանքները, գները, նկարները և տեքստերը փոխվում են **ադմինկայից**՝ առանց թարմացման։ Կոդը թարմացվում է մեկ հրամանով։

### 4.1 Ավտոմատ deploy SSH-ով (խորհուրդ է տրվում)

**Մեկ անգամ (Mac-ում)․**
1. `ssh-keygen -t ed25519 -f ~/.ssh/seafurniture -C "seafurniture-deploy"` (passphrase-ը դատարկ)
2. `~/.ssh/config`-ում․
   ```
   Host seafurniture
     HostName server5.hayhost.am
     Port 2686
     User etbgahjl
     IdentityFile ~/.ssh/seafurniture
     IdentitiesOnly yes
   ```
3. `pbcopy < ~/.ssh/seafurniture.pub` → cPanel → **SSH Access** → **Manage SSH Keys** → **Import Key** (միայն Public Key դաշտը) → **Manage** → **Authorize**
4. `ssh seafurniture "echo OK"`

> SSH-ով գաղտնաբառով մի փորձեք մտնել. մի քանի սխալից հետո սերվերը ժամանակավորապես արգելափակում է ձեր IP-ն։

**Հրամաններ.**
```bash
bash deploy/deploy-hosting.sh check      # ստուգել SSH-ը
bash deploy/deploy-hosting.sh            # API + կայք
bash deploy/deploy-hosting.sh frontend   # միայն կայքը
bash deploy/deploy-hosting.sh backend    # միայն API-ն
bash deploy/deploy-hosting.sh rollback frontend   # (կամ backend) վերադարձ նախորդ տարբերակին
```

Ինչ է անում․ build → zip-ի upload → սերվերում բացում առանձին թղթապանակում → ընթացիկ տարբերակի տեղափոխում `.deploy_prev` → նորի միացում → **npm install** (միայն եթե փոխվել են կախվածությունները կամ `schema.prisma`-ն) → **migration** (միայն եթե կան նորերը, DB գաղտնաբառը կհարցնի թաքնված) → restart → ստուգում։ Ձախողման դեպքում կառաջարկի վերադարձնել նախորդ տարբերակը։

`node_modules`-ին, `sea_uploads`-ին և սերվերի `.env`-ին script-ը չի դիպչում։ Եթե չեք ուզում ամեն migration-ի ժամանակ մուտքագրել DB գաղտնաբառը, cPanel File Manager-ով `seafurniture_api/.env` ֆայլում ավելացրեք `DB_PASSWORD=...` (permissions՝ 600)։

### 4.2 Ձեռքով (պահեստային տարբերակ)

1. Ձեր համակարգչում․ `bash deploy/build-zips.sh` (կամ `... frontend` / `... backend`)
2. **API:** File Manager-ում `seafurniture_api`-ում ջնջեք `dist`, `dist-seed`, `prisma`, `scripts` թղթապանակները → վերբեռնեք և Extract արեք նոր `backend.zip`-ը → **Run NPM Install** → Terminal-ում (1.5 քայլի նման) `npm run migrate:deploy` → **Restart**։
3. **Կայք:** `seafurniture_web`-ում ջնջեք `.output`-ը → վերբեռնեք և Extract արեք նոր `frontend.zip`-ը → **Restart**։

`sea_uploads` թղթապանակին **մի դիպչեք**։

---

## 5. Backup

- **Բազա:** cPanel → **phpMyAdmin** → `etbgahjl_seafurniture` → **Export**։
- **Նկարներ:** File Manager → `sea_uploads` → **Compress** → ներբեռնեք։
- Հարմար է անել ամիսը մեկ կամ մեծ փոփոխություններից առաջ։

---

## 6. Խնդիրների լուծում

| Խնդիր | Ինչ անել |
|---|---|
| `api.seafurniture.am` → 503 կամ «Incomplete response» | Ստուգեք Environment variables-ը (հատկապես `DB_*` և `JWT_*`)։ Սեղմեք **Restart**։ Սխալի տեքստը կա `seafurniture_api/stderr.log` ֆայլում։ |
| `Missing required environment variables` | Ինչ-որ փոփոխական բացակայում է։ Ավելացրեք այն և սեղմեք Restart։ |
| `migrate:deploy` → `Access denied` | `DB_PASSWORD`-ը սխալ է, կամ օգտատերը ավելացված չէ բազային։ |
| Կայքը բացվում է, բայց ապրանքներ չկան | Ստուգեք `https://api.seafurniture.am/api/health`-ը։ Եթե `seed:prod` դեռ չեք գործարկել, գործարկեք։ |
| Ադմինկա մուտքը «թռցնում» է | SSL-ը պետք է ակտիվ լինի երկու դոմենի համար։ Ստուգեք, որ `COOKIE_SECURE=true` է։ |
| `deploy-hosting.sh` → `SSH failed` | `ssh seafurniture "echo OK"`։ Timeout → IP-ն ժամանակավոր արգելափակված է (սպասեք 15–30 րոպե կամ գրեք support-ին)։ `Permission denied` → key-ը Authorize արված չէ cPanel-ում։ |
| `deploy-hosting.sh` → `Release install failed` | Ընթացիկ տարբերակը չի փոխվել։ Ստուգեք disk quota-ն (cPanel → Disk Usage)։ |
| Նկարը չի վերբեռնվում | Համոզվեք, որ `UPLOAD_DIR`-ի թղթապանակը (`/home/etbgahjl/sea_uploads`) գոյություն ունի։ |
