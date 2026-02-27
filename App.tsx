
import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { I18nProvider } from './context/I18nContext.tsx';
import Layout from './components/layout/Layout.tsx';
import HomePage from './pages/HomePage.tsx';
import ServicePage from './pages/ServicePage.tsx';
import ContactsPage from './pages/ContactsPage.tsx';
import BlogPage from './pages/BlogPage.tsx';
import BlogArticlePage from './pages/BlogArticlePage.tsx';

type Page = 'home' | 'service' | 'contacts' | 'blog' | 'article';

const AppContent: React.FC = () => {
    const [animationClass, setAnimationClass] = useState('opacity-100');
    const navigate = useNavigate();

    const navigateTo = (page: Page, id: string | null = null) => {
        setAnimationClass('opacity-0');
        setTimeout(() => {
            if (page === 'home') {
                navigate('/');
            } else if (page === 'service' && id) {
                navigate(`/services/${id}`);
            } else if (page === 'article' && id) {
                navigate(`/blog/${id}`);
            } else if (page === 'blog') {
                navigate('/blog');
            } else if (page === 'contacts') {
                navigate('/contacts');
            }
            window.scrollTo(0, 0);
            setTimeout(() => {
                setAnimationClass('opacity-100');
            }, 50);
        }, 300);
    };

    return (
        <Layout onNavigate={navigateTo}>
            <main className={`transition-opacity duration-300 ${animationClass}`}>
                <Routes>
                    <Route path="/" element={<HomePage onNavigate={navigateTo} />} />
                    <Route path="/services/:serviceId" element={<ServicePage onNavigate={navigateTo} />} />
                    <Route path="/blog" element={<BlogPage onNavigate={navigateTo} />} />
                    <Route path="/blog/:slug" element={<BlogArticlePage onNavigate={navigateTo} />} />
                    <Route path="/contacts" element={<ContactsPage onNavigate={navigateTo} />} />
                </Routes>
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
