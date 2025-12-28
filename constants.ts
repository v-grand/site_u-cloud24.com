
import React from 'react';
import { Service, Translations } from './types.ts';
import { WebIcon, ServerIcon, DataScienceIcon, AIAgentsIcon, ScrapingIcon, PipelinesIcon, IntegrationIcon, Web3Icon } from './components/ui/Icons.tsx';

export const SERVICES: Service[] = [
  { id: 'web', titleKey: 'service_web_title', descriptionKey: 'service_web_desc', icon: WebIcon },
  { id: 'server', titleKey: 'service_server_title', descriptionKey: 'service_server_desc', icon: ServerIcon },
  { id: 'datascience', titleKey: 'service_ds_title', descriptionKey: 'service_ds_desc', icon: DataScienceIcon },
  { id: 'ai-agents', titleKey: 'service_ai_title', descriptionKey: 'service_ai_desc', icon: AIAgentsIcon },
  { id: 'scraping', titleKey: 'service_scraping_title', descriptionKey: 'service_scraping_desc', icon: ScrapingIcon },
  { id: 'pipelines', titleKey: 'service_pipelines_title', descriptionKey: 'service_pipelines_desc', icon: PipelinesIcon },
  { id: 'integration', titleKey: 'service_integration_title', descriptionKey: 'service_integration_desc', icon: IntegrationIcon },
  { id: 'web3', titleKey: 'service_web3_title', descriptionKey: 'service_web3_desc', icon: Web3Icon },
];

export const I18N_STRINGS: Translations = {
  // General
  logo_alt: { en: 'U-Cloud 24 Logo', ru: 'Логотип U-Cloud 24' },
  register_cta: { en: 'Start Registration', ru: 'Начать регистрацию' },
  all_rights_reserved: { en: 'All rights reserved.', ru: 'Все права защищены.' },
  home: { en: 'Home', ru: 'Главная' },
  services: { en: 'Services', ru: 'Услуги' },
  
  // Hero Section
  hero_title: { en: 'Unified Cloud & AI Ecosystem', ru: 'Единая экосистема облака и ИИ' },
  hero_subtitle: { en: 'From scalable servers to autonomous AI agents, build your future with a platform designed for innovation and performance.', ru: 'От масштабируемых серверов до автономных ИИ-агентов — стройте свое будущее на платформе, созданной для инноваций и производительности.' },
  
  // Services Grid
  bento_title: { en: 'Our Services', ru: 'Наши Услуги' },
  bento_subtitle: { en: 'A comprehensive suite of tools to power your projects.', ru: 'Полный набор инструментов для ваших проектов.' },
  
  // Service Titles & Descriptions (for cards)
  service_web_title: { en: 'Web Apps', ru: 'Веб-приложения' },
  service_web_desc: { en: 'Modern, fast, and scalable web applications.', ru: 'Современные, быстрые и масштабируемые веб-приложения.' },
  service_server_title: { en: 'Cloud Servers', ru: 'Облачные серверы' },
  service_server_desc: { en: 'Reliable and powerful virtual server infrastructure.', ru: 'Надежная и мощная инфраструктура виртуальных серверов.' },
  service_ds_title: { en: 'Data Science', ru: 'Data Science' },
  service_ds_desc: { en: 'Unlock insights from your data with advanced analytics.', ru: 'Извлекайте ценные сведения из данных с помощью передовой аналитики.' },
  service_ai_title: { en: 'AI Agents', ru: 'ИИ Агенты' },
  service_ai_desc: { en: 'Automate complex tasks with intelligent agents.', ru: 'Автоматизируйте сложные задачи с помощью интеллектуальных агентов.' },
  service_scraping_title: { en: 'Web Scraping', ru: 'Веб-скрапинг' },
  service_scraping_desc: { en: 'Efficient and ethical data extraction from the web.', ru: 'Эффективное и этичное извлечение данных из веба.' },
  service_pipelines_title: { en: 'Data Pipelines', ru: 'Data Pipelines' },
  service_pipelines_desc: { en: 'Robust ETL/ELT pipelines for your data workflows.', ru: 'Надежные ETL/ELT-пайплайны для ваших потоков данных.' },
  service_integration_title: { en: 'API Integration', ru: 'API Интеграции' },
  service_integration_desc: { en: 'Seamlessly connect your applications and services.', ru: 'Бесшовно соединяйте ваши приложения и сервисы.' },
  service_web3_title: { en: 'Web3 & DApps', ru: 'Web3 и DApps' },
  service_web3_desc: { en: 'Build decentralized applications on the blockchain.', ru: 'Создавайте децентрализованные приложения на блокчейне.' },

  // Service Page
  loading_content: { en: 'Generating service details with AI...', ru: 'Генерируем детали услуги с помощью ИИ...' },
  error_content: { en: 'Failed to load content. Please try again later.', ru: 'Не удалось загрузить контент. Пожалуйста, попробуйте позже.' },
  key_features: { en: 'Key Features', ru: 'Ключевые особенности' },
  real_world_use_case: { en: 'Real-World Use Case', ru: 'Пример использования' },
  back_to_services: { en: 'Back to all services', ru: 'Назад ко всем услугам' },
};
