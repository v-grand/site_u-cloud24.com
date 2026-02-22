
import React, { useState, useEffect, useMemo } from 'react';
import { I18nProvider, useI18n } from './context/I18nContext.tsx';
import Layout from './components/layout/Layout.tsx';
import HomePage from './pages/HomePage.tsx';
import ServicePage from './pages/ServicePage.tsx';
import ContactsPage from './pages/ContactsPage.tsx';
import BlogPage from './pages/BlogPage.tsx';
import BlogArticlePage from './pages/BlogArticlePage.tsx';
import { SERVICES } from './constants.ts';

type Page = 'home' | 'service' | 'contacts' | 'blog' | 'article';

const AppContent: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [currentServiceId, setCurrentServiceId] = useState<string | null>(null);
    const [currentArticleSlug, setCurrentArticleSlug] = useState<string | null>(null);
    const [animationClass, setAnimationClass] = useState('opacity-100');
    const { t } = useI18n();

    const navigateTo = (page: Page, id: string | null = null) => {
        setAnimationClass('opacity-0');
        setTimeout(() => {
            setCurrentPage(page);
            if (page === 'service') {
                setCurrentServiceId(id);
            } else if (page === 'article') {
                setCurrentArticleSlug(id);
            }
            window.scrollTo(0, 0);
            setAnimationClass('opacity-100');
        }, 300); // Match transition duration
    };

    const currentService = useMemo(() => {
        return SERVICES.find(s => s.id === currentServiceId) || null;
    }, [currentServiceId]);

    useEffect(() => {
        let pageTitle = 'U-Cloud 24';
        if (currentPage === 'service' && currentService) {
            pageTitle = `U-Cloud 24 | ${t(currentService.titleKey)}`;
        } else if (currentPage === 'blog') {
            pageTitle = `U-Cloud 24 | ${t('blog_title')}`;
        } else if (currentPage === 'contacts') {
            pageTitle = `U-Cloud 24 | ${t('contacts_title')}`;
        } else if (currentPage === 'home') {
            pageTitle = `U-Cloud 24 | ${t('home')}`;
        }
        document.title = pageTitle;
    }, [currentPage, currentService, t]);

    return (
        <Layout onNavigate={navigateTo}>
            <main className={`transition-opacity duration-300 ${animationClass}`}>
                {currentPage === 'home' && <HomePage onNavigate={navigateTo} />}
                {currentPage === 'service' && currentServiceId && (
                    <ServicePage serviceId={currentServiceId} onNavigate={navigateTo} />
                )}
                {currentPage === 'blog' && <BlogPage onNavigate={navigateTo} />}
                {currentPage === 'article' && currentArticleSlug && (
                    <BlogArticlePage articleSlug={currentArticleSlug} onNavigate={navigateTo} />
                )}
                {currentPage === 'contacts' && <ContactsPage />}
            </main>
        </Layout>
    );
};

const App: React.FC = () => {
    return (
        <I18nProvider>
            <AppContent />
        </I18nProvider>
    );
};

export default App;
