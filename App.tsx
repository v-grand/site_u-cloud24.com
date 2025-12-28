
import React, { useState, useEffect, useMemo } from 'react';
import { I18nProvider, useI18n } from './context/I18nContext.tsx';
import Layout from './components/layout/Layout.tsx';
import HomePage from './pages/HomePage.tsx';
import ServicePage from './pages/ServicePage.tsx';
import { SERVICES } from './constants.ts';

type Page = 'home' | 'service';

const AppContent: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [currentServiceId, setCurrentServiceId] = useState<string | null>(null);
    const [animationClass, setAnimationClass] = useState('opacity-100');
    const { t } = useI18n();

    const navigateTo = (page: Page, serviceId: string | null = null) => {
        setAnimationClass('opacity-0');
        setTimeout(() => {
            setCurrentPage(page);
            setCurrentServiceId(serviceId);
            window.scrollTo(0, 0);
            setAnimationClass('opacity-100');
        }, 300); // Match transition duration
    };

    const currentService = useMemo(() => {
        return SERVICES.find(s => s.id === currentServiceId) || null;
    }, [currentServiceId]);

    useEffect(() => {
        const serviceName = currentService ? t(currentService.titleKey) : 'Services';
        document.title = `U-Cloud 24 | ${serviceName}`;
    }, [currentPage, currentService, t]);

    return (
        <Layout onNavigate={navigateTo}>
            <main className={`transition-opacity duration-300 ${animationClass}`}>
                {currentPage === 'home' && <HomePage onNavigate={navigateTo} />}
                {currentPage === 'service' && currentServiceId && (
                    <ServicePage serviceId={currentServiceId} />
                )}
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
