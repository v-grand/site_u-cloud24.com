# U-Cloud 24 - Гайд Разработчика

## 🎯 Обзор

Этот проект - это **modern React SPA** для веб-сайта облачных услуг с поддержкой **3 языков** и **SEO оптимизацией**.

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite (молниеносная сборка)
- **Styling:** Tailwind CSS (utility-first)
- **Routing:** Client-side (App.tsx)
- **i18n:** Custom Context API (context/I18nContext.tsx)
- **Analytics:** Google Analytics (встроенный)

---

## 📁 Архитектура Проекта

### Главные директории:

```
src/
├── components/              # Переиспользуемые React компоненты
│   ├── layout/
│   │   ├── Header.tsx      # Навигация + меню услуг
│   │   ├── Footer.tsx      # Подвал сайта
│   │   └── Layout.tsx      # Главный обертка
│   ├── ui/
│   │   ├── Button.tsx      # Переиспользуемая кнопка
│   │   ├── ServiceCard.tsx # Карточка услуги в сетке
│   │   ├── AnimatedElement.tsx # Scroll-triggered анимация
│   │   ├── Icons.tsx       # SVG иконки всех услуг
│   │   └── LanguageSwitcher.tsx # Выбор языка
│   └── ...
│
├── pages/                   # Страницы (full-page компоненты)
│   ├── HomePage.tsx        # Главная: hero + сетка услуг
│   ├── ServicePage.tsx     # Динамическая: детали услуги
│   └── ContactsPage.tsx    # Контакты
│
├── context/                # React Context (глобальное состояние)
│   └── I18nContext.tsx     # Управление языком
│
├── hooks/                  # Custom React Hooks
│   └── useIntersectionObserver.ts # Для scroll анимаций
│
├── App.tsx                 # Главный компонент (маршрутизация)
├── index.tsx               # React DOM entry point
├── constants.ts            # ⭐ ВСЕ ДАННЫЕ И ПЕРЕВОДЫ
├── types.ts                # TypeScript интерфейсы
├── style.css               # Глобальные стили + Tailwind
└── index.html              # HTML template (+ SEO)

public/
├── robots.txt              # SEO: инструкция для поисковиков
├── sitemap.xml             # SEO: карта сайта
└── images/                 # Статические изображения
    ├── services/           # 800x600px изображения услуг
    ├── team/               # Фото команды
    └── ...
```

---

## 🔑 Ключевые Файлы

### constants.ts - Центр управления контентом

**Этот файл содержит:**
1. `SERVICES[]` - массив всех услуг
2. `I18N_STRINGS` - ВСЕ переводы приложения (EN, RU, PL)

**Структура SERVICES:**
```typescript
export const SERVICES: Service[] = [
  {
    id: 'web',                                    // unique ID (используется в URL)
    titleKey: 'service_web_title',               // ключ для перевода
    descriptionKey: 'service_web_desc',          // ключ для перевода
    icon: WebIcon,                               // React компонент иконки
  },
  // ... остальные услуги ...
];
```

**Структура переводов:**
```typescript
export const I18N_STRINGS: Translations = {
  // Общие
  home: { en: 'Home', ru: 'Главная', pl: 'Strona główna' },

  // Для каждой услуги:
  service_web_title: { en: '...', ru: '...', pl: '...' },
  service_web_desc: { en: '...', ru: '...', pl: '...' },
  service_web_detailed: { en: '...', ru: '...', pl: '...' },
  service_web_features: { en: 'Feature 1 | Feature 2 | ...', ... },
  service_web_usecase: { en: '...', ru: '...', pl: '...' },
};
```

### types.ts - TypeScript интерфейсы

```typescript
export interface Service {
  id: string;                                    // 'web', 'server', etc.
  titleKey: string;                              // ключ переводов
  descriptionKey: string;                        // ключ переводов
  icon: React.FC<{ className?: string }>;       // React компонент
}

export type Language = 'en' | 'ru' | 'pl';       // Поддерживаемые языки

export type Translations = {                     // Структура переводов
  [key: string]: {
    [lang in Language]: string;
  };
};
```

---

## 🔄 Data Flow

```
App.tsx (маршрутизация)
  ↓
  ├─→ Header (навигация)
  │   ├─→ LanguageSwitcher (смена языка → I18nContext)
  │   └─→ Services Dropdown (меню услуг)
  │
  ├─→ HomePage
  │   └─→ ServiceCard[] (карточки из SERVICES)
  │       └─→ onClick: navigate к ServicePage
  │
  ├─→ ServicePage
  │   └─→ Читает serviceId из URL
  │       └─→ Ищет услугу в SERVICES
  │           └─→ Читает переводы из I18N_STRINGS
  │
  └─→ ContactsPage
      └─→ Контактная информация

I18nContext (глобальное состояние)
  ├─→ language: 'en' | 'ru' | 'pl'
  └─→ t(key): string (функция переводов)
```

---

## 🎨 Компоненты

### Header.tsx (Главная навигация)

```typescript
// Features:
// - Sticky header с backdrop blur
// - Desktop: горизонтальное меню + dropdown услуг
// - Mobile: hamburger меню + collapsible услуги
// - Language switcher
// - CTA button

<Header onNavigate={(page, serviceId?) => {...}} />
```

### ServiceCard.tsx (Карточка услуги)

```typescript
// Features:
// - Отображает icon, title, description
// - Hover анимация
// - Responsive grid layout
// - Gradient borders

<ServiceCard service={service} onClick={() => {...}} className="..." />
```

### AnimatedElement.tsx (Scroll анимация)

```typescript
// Features:
// - Использует Intersection Observer API
// - fade-in + slide-up анимация
// - delay поддержка для stagger effect

<AnimatedElement delay={100}>
  <h1>Появляется при скролле!</h1>
</AnimatedElement>
```

### LanguageSwitcher.tsx (Выбор языка)

```typescript
// Features:
// - Dropdown с флагами языков
// - Сохранение выбора в localStorage
// - Мгновенное переключение контента

<LanguageSwitcher />
```

---

## 🔗 Маршрутизация

**App.tsx** реализует simple client-side маршрутизацию:

```typescript
const [currentPage, setCurrentPage] = useState<Page>('home');
const [currentServiceId, setCurrentServiceId] = useState<string | null>(null);

const navigateTo = (page: Page, serviceId?: string | null) => {
  setCurrentPage(page);
  if (serviceId) setCurrentServiceId(serviceId);
  window.scrollTo(0, 0); // Scroll to top
};

// Рендеринг по типу страницы:
{currentPage === 'home' && <HomePage onNavigate={navigateTo} />}
{currentPage === 'service' && <ServicePage serviceId={currentServiceId} />}
{currentPage === 'contacts' && <ContactsPage />}
```

**Routes:**
- `/` → HomePage
- `/?service=web` → ServicePage (web)
- `/contacts` (внутренняя навигация, не реальный URL)

---

## 🌍 i18n (Интернационализация)

### I18nContext.tsx

```typescript
// Глобальное состояние языка
interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string; // функция для перевода
}

// Использование:
const { t, language, setLanguage } = useI18n();

// Примеры:
{t('home')}                           // 'Home' / 'Главная' / 'Strona główna'
{t('service_web_title')}              // 'Web Apps' / 'Веб-приложения' / ...
```

### Добавление нового языка

1. Обновите `types.ts`:
   ```typescript
   export type Language = 'en' | 'ru' | 'pl' | 'fr'; // добавлено 'fr'
   ```

2. Обновите `I18nContext.tsx`:
   ```typescript
   const LANGUAGE_LABELS: Record<Language, string> = {
     en: 'English',
     ru: 'Русский',
     pl: 'Polski',
     fr: 'Français',  // добавлено
   };
   ```

3. Добавьте переводы во ВСЕ строки в `constants.ts`:
   ```typescript
   title: { en: '...', ru: '...', pl: '...', fr: '...' }
   ```

---

## 🎨 Стилизация (Tailwind CSS)

### Tailwind config (tailwind.config.js)

```javascript
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // Customize colors, fonts, etc.
    },
  },
};
```

### Примеры использования:

```typescript
// Responsive padding
<div className="px-4 sm:px-6 lg:px-8">

// Gradient text
<h1 className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-cyan-500">

// Hover effects
<button className="hover:text-cyan-400 transition-colors duration-300">

// Dark mode (если добавите)
<div className="bg-slate-900 dark:bg-slate-950">
```

**Цветовая схема:**
- Primary: Cyan-400 (для акцентов)
- Secondary: Orange-500 (градиенты)
- Background: Slate-900 (темный фон)
- Text: Slate-200/300 (светлый текст)

---

## 🚀 Development Workflow

### Запуск dev сервера:
```bash
npm run dev
# Открывает http://localhost:5173
```

### Развиячение горячего обновления:
- Изменяйте файлы → автоматический reload
- CSS изменения → мгновенное обновление
- React компоненты → fast refresh

### Проверка типов:
```bash
npx tsc --noEmit
```

### Лinting:
```bash
npm run lint
# ESLint + TypeScript checking
```

### Production build:
```bash
npm run build
# Выводит оптимизированный dist/
```

### Preview production build:
```bash
npm run preview
# Тестирует production версию локально
```

---

## 📱 Responsive Design

### Tailwind breakpoints:

```
Дефолт (mobile)   : 0-639px
sm (small)        : 640px+     (tablets)
md (medium)       : 768px+     (small desktops)
lg (large)        : 1024px+    (desktops)
xl (extra large)  : 1280px+    (large desktops)
```

### Примеры:

```typescript
// Mobile-first approach
<div className="
  grid grid-cols-1           // 1 column on mobile
  md:grid-cols-2             // 2 columns on tablets
  lg:grid-cols-4             // 4 columns on desktops
  gap-4 md:gap-6 lg:gap-8    // different gaps
">

// Conditional rendering
<div className="hidden md:block">   // показать только на desktop
<div className="md:hidden">         // показать только на мобайле
```

---

## 🔍 Performance Tips

### Code Splitting:

```typescript
// Ленивая загрузка страниц (если нужна)
const HomePage = React.lazy(() => import('./pages/HomePage'));
```

### Optimization:

```typescript
// Мемоизация компонентов
const MemoedServiceCard = React.memo(ServiceCard);

// useMemo для дорогих вычислений
const filteredServices = useMemo(() => {
  return SERVICES.filter(...);
}, [SERVICES, filter]);
```

### Image Optimization:

```typescript
// Ленивая загрузка изображений
<img src="..." loading="lazy" />

// WebP с fallback
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" />
</picture>
```

---

## 🐛 Debugging

### React DevTools:
```bash
# Установите расширение для Chrome/Firefox
# Откройте DevTools → Components tab
```

### Chrome DevTools:
- Inspect elements
- Simulate mobile devices
- Network tab (для проверки загрузок)
- Console (для логов)

### Логирование:
```typescript
console.log('Service:', service);
console.error('Error:', error);
console.time('operation');
// ... код ...
console.timeEnd('operation');
```

---

## 🔐 Security Best Practices

1. **Input Sanitization:** Не вставляйте пользовательские данные напрямую в DOM
2. **XSS Prevention:** Используйте React (автоматически экранирует)
3. **CSRF Protection:** Используйте CSRF tokens для POST запросов
4. **Secrets:** Никогда не коммитьте `.env` файлы
5. **Dependencies:** Регулярно обновляйте зависимости (`npm audit`)

---

## 📚 Полезные Ресурсы

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Docs](https://vitejs.dev/)
- [MDN Web Docs](https://developer.mozilla.org/)

---

## 🆘 Troubleshooting

| Проблема | Решение |
|----------|---------|
| "Cannot find module" | `npm install` и проверьте import пути |
| Стили не применяются | Проверьте class names в Tailwind config |
| Горячее обновление не работает | Перезагрузите dev сервер (`npm run dev`) |
| Перевод не отображается | Проверьте ключ в constants.ts |
| Мобильное меню не закрывается | Проверьте onClick handlers |
| Изображения не загружаются | Проверьте пути в public/ |

---

**Версия:** 1.0
**Последнее обновление:** 21 февраля 2026
**Автор:** U-Cloud 24 Dev Team
