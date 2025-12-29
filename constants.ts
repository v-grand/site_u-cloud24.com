
import { Service, Translations } from './types.ts';
import { WebIcon, ServerIcon, DataScienceIcon, ScrapingIcon, PipelinesIcon, IntegrationIcon, Web3Icon } from './components/ui/Icons.tsx';

export const SERVICES: Service[] = [
  { id: 'web', titleKey: 'service_web_title', descriptionKey: 'service_web_desc', icon: WebIcon },
  { id: 'server', titleKey: 'service_server_title', descriptionKey: 'service_server_desc', icon: ServerIcon },
  { id: 'datascience', titleKey: 'service_ds_title', descriptionKey: 'service_ds_desc', icon: DataScienceIcon },
  { id: 'scraping', titleKey: 'service_scraping_title', descriptionKey: 'service_scraping_desc', icon: ScrapingIcon },
  { id: 'pipelines', titleKey: 'service_pipelines_title', descriptionKey: 'service_pipelines_desc', icon: PipelinesIcon },
  { id: 'integration', titleKey: 'service_integration_title', descriptionKey: 'service_integration_desc', icon: IntegrationIcon },
  { id: 'web3', titleKey: 'service_web3_title', descriptionKey: 'service_web3_desc', icon: Web3Icon },
];

export const I18N_STRINGS: Translations = {
  // General
  logo_alt: { en: 'u-cloud24 Logo', ru: 'Логотип u-cloud24', pl: 'Logo u-cloud24' },
  register_cta: { en: 'Start Registration', ru: 'Начать регистрацию', pl: 'Rozpocznij rejestrację' },
  all_rights_reserved: { en: 'All rights reserved.', ru: 'Все права защищены.', pl: 'Wszelkie prawa zastrzeżone.' },
  home: { en: 'Home', ru: 'Главная', pl: 'Strona główna' },
  services: { en: 'Services', ru: 'Услуги', pl: 'Usługi' },
  
  // Hero Section
  hero_title: { en: 'Unified Cloud Ecosystem', ru: 'Единая облачная экосистема', pl: 'Zunifikowany Ekosystem Chmurowy' },
  hero_subtitle: { en: 'From scalable servers to powerful solutions, build your future with a platform designed for innovation and performance.', ru: 'От масштабируемых серверов до мощных решений — стройте свое будущее на платформе, созданной для инноваций и производительности.', pl: 'Od skalowalnych serwerów po potężne rozwiązania, buduj swoją przyszłość z platformą zaprojektowaną dla innowacji i wydajności.' },
  
  // Services Grid
  bento_title: { en: 'Our Services', ru: 'Наши Услуги', pl: 'Nasze Usługi' },
  bento_subtitle: { en: 'A comprehensive suite of tools to power your projects.', ru: 'Полный набор инструментов для ваших проектов.', pl: 'Kompleksowy zestaw narzędzi do zasilania Twoich projektów.' },
  
  // Service Titles & Descriptions (for cards)
  service_web_title: { en: 'Web Apps', ru: 'Веб-приложения', pl: 'Aplikacje Webowe' },
  service_web_desc: { en: 'Modern, fast, and scalable web applications.', ru: 'Современные, быстрые и масштабируемые веб-приложения.', pl: 'Nowoczesne, szybkie i skalowalne aplikacje webowe.' },
  service_server_title: { en: 'Cloud Servers', ru: 'Облачные серверы', pl: 'Serwery Chmurowe' },
  service_server_desc: { en: 'Reliable and powerful virtual server infrastructure.', ru: 'Надежная и мощная инфраструктура виртуальных серверов.', pl: 'Niezawodna i wydajna infrastruktura serwerów wirtualnych.' },
  service_ds_title: { en: 'Data Science', ru: 'Data Science', pl: 'Data Science' },
  service_ds_desc: { en: 'Unlock insights from your data with advanced analytics.', ru: 'Извлекайте ценные сведения из данных с помощью передовой аналитики.', pl: 'Odkryj spostrzeżenia z Twoich danych dzięki zaawansowanej analityce.' },
  service_scraping_title: { en: 'Web Scraping', ru: 'Веб-скрапинг', pl: 'Web Scraping' },
  service_scraping_desc: { en: 'Efficient and ethical data extraction from the web.', ru: 'Эффективное и этичное извлечение данных из веба.', pl: 'Efektywne i etyczne pozyskiwanie danych z sieci.' },
  service_pipelines_title: { en: 'Data Pipelines', ru: 'Data Pipelines', pl: 'Potoki Danych' },
  service_pipelines_desc: { en: 'Robust ETL/ELT pipelines for your data workflows.', ru: 'Надежные ETL/ELT-пайплайны для ваших потоков данных.', pl: 'Solidne potoki ETL/ELT dla Twoich przepływów danych.' },
  service_integration_title: { en: 'API Integration', ru: 'API Интеграции', pl: 'Integracja API' },
  service_integration_desc: { en: 'Seamlessly connect your applications and services.', ru: 'Бесшовно соединяйте ваши приложения и сервисы.', pl: 'Bezproblemowo łącz swoje aplikacje i usługi.' },
  service_web3_title: { en: 'Web3 & DApps', ru: 'Web3 и DApps', pl: 'Web3 i DApps' },
  service_web3_desc: { en: 'Build decentralized applications on the blockchain.', ru: 'Создавайте децентрализованные приложения на блокчейне.', pl: 'Buduj zdecentralizowane aplikacje na blockchainie.' },

  // Service Page
  loading_content: { en: 'Generating service details...', ru: 'Генерируем детали услуги...', pl: 'Generowanie szczegółów usługi...' },
  error_content: { en: 'Failed to load content. Please try again later.', ru: 'Не удалось загрузить контент. Пожалуйста, попробуйте позже.', pl: 'Nie udało się załadować treści. Spróbuj ponownie później.' },
  key_features: { en: 'Key Features', ru: 'Ключевые особенности', pl: 'Kluczowe Funkcje' },
  real_world_use_case: { en: 'Real-World Use Case', ru: 'Пример использования', pl: 'Przykład Użycia w Rzeczywistym Świecie' },
  back_to_services: { en: 'Back to all services', ru: 'Назад ко всем услугам', pl: 'Wróć do wszystkich usług' },
};
