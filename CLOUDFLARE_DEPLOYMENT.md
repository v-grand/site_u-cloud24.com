# U-Cloud 24 - Развертывание на Cloudflare Pages

## 📋 Содержание
1. [Подготовка к развертыванию](#подготовка-к-развертыванию)
2. [Развертывание на Cloudflare Pages](#развертывание-на-cloudflare-pages)
3. [Настройка DNS](#настройка-dns)
4. [Оптимизация Cloudflare](#оптимизация-cloudflare)
5. [Email через Cloudflare](#email-через-cloudflare)
6. [Мониторинг и проверка](#мониторинг-и-проверка)

---

## 🚀 Подготовка к развертыванию

### Шаг 1: Убедитесь что всё готово

```bash
# Проверьте что локально всё работает
npm run build
npm run preview

# Проверьте что нет ошибок
npm run lint
```

### Шаг 2: Структура для Cloudflare Pages

```
dist/                           # Результат npm run build
├── index.html                  # Главный HTML
├── robots.txt                  # SEO (из public/)
├── sitemap.xml                 # SEO (из public/)
├── _redirects                  # Маршрутизация (из public/)
├── _headers                    # Кэширование (из public/)
├── favicon.ico                 # (опционально)
├── assets/                     # CSS, JS бандлы (от Vite)
└── images/                     # Изображения (из public/)
```

**Проверьте что файлы из `public/` копируются в `dist/` при build:**

```bash
npm run build
ls dist/  # должны быть robots.txt, sitemap.xml, _redirects, _headers
```

---

## 🌐 Развертывание на Cloudflare Pages

### Вариант 1: Через GitHub (рекомендуется)

**1. Создайте GitHub репозиторий:**
```bash
git remote -v  # Проверьте что уже есть
# Если нет:
git remote add origin https://github.com/your-username/site_u-cloud24.com.git
git push -u origin main
```

**2. Подключите Cloudflare Pages:**
1. Откройте [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Pages → Create a project → Connect to Git
3. Выберите репозиторий `site_u-cloud24.com`
4. Build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** 18 (или выше)

**3. Environment переменные (если нужны):**
```
VITE_GA_ID=G-CC1PGN25LM
```

**4. Нажмите Deploy!** 🚀

Cloudflare автоматически будет деплоить при каждом push в main.

### Вариант 2: Через Wrangler CLI

```bash
# Установите Wrangler
npm install -g wrangler

# Авторизуйтесь
wrangler login

# Создайте файл wrangler.toml
cat > wrangler.toml << 'EOF'
name = "u-cloud24"
type = "javascript"
account_id = "YOUR_ACCOUNT_ID"  # Найдите в Cloudflare Dashboard
workers_dev = true
route = ""
zone_id = ""

[env.production]
name = "u-cloud24-prod"
route = "u-cloud24.com/*"
zone_id = "YOUR_ZONE_ID"

[build]
command = "npm run build"
cwd = "./"
EOF

# Деплой
wrangler publish
```

### Вариант 3: Прямой upload

```bash
# 1. Соберите проект
npm run build

# 2. Создайте ZIP архив содержимого dist/
zip -r site.zip dist/*

# 3. Загрузите в Cloudflare Pages через Dashboard
# Pages → Upload assets
```

---

## 🔗 Настройка DNS

### Если вы используете Cloudflare для DNS:

**1. Добавьте CNAME запись:**
```
Type:   CNAME
Name:   u-cloud24.com (или www)
Target: u-cloud24.pages.dev
TTL:    Auto
Proxy:  Proxied (оранжевое облако)
```

**2. Если используете apex domain (u-cloud24.com):**
```
Type:   CNAME
Name:   @
Target: u-cloud24.pages.dev
TTL:    Auto
Proxy:  Proxied
```

**3. Редирект www → без www:**
```
Type:   CNAME
Name:   www
Target: u-cloud24.pages.dev
TTL:    Auto
Proxy:  Proxied
```

**4. Проверьте DNS:**
```bash
# После 5-10 минут
nslookup u-cloud24.com
# Должен вернуть: u-cloud24.pages.dev
```

---

## ⚙️ Оптимизация Cloudflare

### 1. Включите Caching

**Speed → Caching:**
- ✅ Caching Level: Cache Everything
- ✅ Browser Cache TTL: 4 hours
- ✅ Edge Cache TTL: 1 month

### 2. Включите Compression

**Speed → Optimization:**
- ✅ Brotli: On
- ✅ Minify CSS: On
- ✅ Minify JavaScript: On
- ✅ Minify HTML: On

### 3. Включите Security Features

**Security → Security Level:** High
**Security → DDoS Protection:** On

### 4. Добавьте HTTP/2 Server Push

**Speed → HTTP/2 Server Push:**
- ✅ On (автоматическая оптимизация)

### 5. Оптимизируйте Изображения

**Speed → Polish:**
- ✅ On (Lossy compression)
- ✅ WebP: On (автоматический формат)

---

## 📧 Email через Cloudflare

### Если используете Cloudflare для Email:

**1. Настройте MX записи:**
```
Type:   MX
Name:   @
Server: route1.mx.cloudflare.net
TTL:    Auto
Priority: 10

Type:   MX
Name:   @
Server: route2.mx.cloudflare.net
TTL:    Auto
Priority: 20
```

**2. Добавьте email маршруты:**

Cloudflare Dashboard → Email Routing → Create address

```
Catch-all: @u-cloud24.com → your@email.com
support@u-cloud24.com → support@email.com
info@u-cloud24.com → info@email.com
```

**3. Добавьте SPF запись (если отправляете email):**

```
Type:   TXT
Name:   @
Value:  v=spf1 include:route1.mx.cloudflare.net include:route2.mx.cloudflare.net ~all
TTL:    Auto
```

**4. Добавьте DKIM запись:**

Следуйте инструкциям в Email Routing → Configure → Add DKIM

---

## 🔍 Мониторинг и проверка

### 1. Проверьте что сайт доступен:

```bash
# Основной URL
curl -I https://u-cloud24.com

# robots.txt
curl https://u-cloud24.com/robots.txt

# sitemap.xml
curl https://u-cloud24.com/sitemap.xml
```

### 2. Проверьте Lighthouse score:

https://pagespeed.web.dev/?url=https://u-cloud24.com

**Целевые значения:**
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### 3. Проверьте Security Headers:

https://securityheaders.com/?q=u-cloud24.com

**Должны быть:**
- ✅ X-Content-Type-Options
- ✅ X-Frame-Options
- ✅ Referrer-Policy

### 4. Проверьте Analytics:

Google Analytics Dashboard:
```
https://analytics.google.com
Property: U-Cloud 24
Tracking ID: G-CC1PGN25LM
```

### 5. Проверьте Google Search Console:

```
https://search.google.com/search-console
Property: https://u-cloud24.com
Verify: txt record (уже в DNS)
```

**Добавьте sitemap:**
- Crawl → Sitemaps → New sitemap
- URL: https://u-cloud24.com/sitemap.xml

### 6. Проверьте Core Web Vitals:

```bash
# Используйте PageSpeed Insights
https://pagespeed.web.dev/?url=https://u-cloud24.com

# Или Lighthouse в Chrome
F12 → Lighthouse → Analyze page load
```

---

## 🚨 Troubleshooting

### Проблема: 404 на странице услуги при обновлении

**Решение:** Убедитесь что `_redirects` файл в dist/:
```bash
npm run build
cat dist/_redirects  # должен содержать /* /index.html 200
```

Если не работает, обновите Cloudflare Pages:
- Purge cache (в Settings)
- Redeploy (в Deployments)

### Проблема: Изображения не загружаются

**Решение:**
```bash
# Проверьте что /public/images/ скопирован в dist/
npm run build
ls dist/images/

# Если нет, добавьте в vite.config.ts publicDir
```

### Проблема: Google Analytics не работает

**Проверьте:**
1. GA ID в index.html: `G-CC1PGN25LM` ✅
2. Скрипт не блокируется адблокером
3. В GA Dashboard видите events

```bash
# Проверьте в browser console (F12)
typeof gtag  # должно быть 'function'
window.dataLayer  # должен быть массив
```

### Проблема: CSS/JS не загружаются

**Решение:** Очистите Cloudflare кэш:
1. Dashboard → Caching → Purge Cache → Purge Everything
2. Дождитесь 5 минут
3. Обновите страницу (Ctrl+Shift+R - hard refresh)

---

## 📊 Performance Checklist

Перед использованием в production:

- [ ] `npm run build` - без ошибок
- [ ] `npm run lint` - без ошибок
- [ ] `dist/robots.txt` - существует
- [ ] `dist/sitemap.xml` - существует
- [ ] `dist/_redirects` - существует
- [ ] `dist/_headers` - существует
- [ ] Google Analytics работает
- [ ] robots.txt доступен на сайте
- [ ] sitemap.xml доступен на сайте
- [ ] Lighthouse score > 90
- [ ] Mobile version работает
- [ ] Все 3 языка переключаются
- [ ] SEO meta теги в место

---

## 🔄 Continuous Deployment

**Автоматический деплой при push:**

```bash
git add .
git commit -m "Update content"
git push origin main

# Cloudflare автоматически:
# 1. Запускает build
# 2. Проверяет ошибки
# 3. Деплоит на production
# 4. Показывает статус в Dashboard
```

**Просмотрите логи деплоя:**
- Cloudflare Dashboard → Pages → Deployments
- Кликните на deploy → View Build Log

---

## 📞 Полезные Links

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare DNS Docs](https://developers.cloudflare.com/dns/)
- [Cloudflare Email Routing](https://support.cloudflare.com/hc/en-us/articles/4417320519309)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#cloudflare-pages)

---

**Версия:** 1.0
**Последнее обновление:** 21 февраля 2026
