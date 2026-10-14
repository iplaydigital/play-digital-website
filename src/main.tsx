import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter, MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider, RouteEffects } from './lib';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import { AboutPage, ArticlePage, BlogPage, ClientsPage, ContactPage, HomePage, NotFoundPage, PrivacyPage, ServicesPage, WorkPage } from './pages/Pages';
import './styles.css';
function App() {
  const { pathname } = useLocation();
  return <LanguageProvider><RouteEffects /><SiteHeader /><main id="main" tabIndex={-1} className="page-main"><Routes><Route path="/" element={<HomePage />} /><Route path="/services" element={<ServicesPage />} /><Route path="/work" element={<WorkPage />} /><Route path="/clients" element={<ClientsPage />} /><Route path="/about" element={<AboutPage />} /><Route path="/blog" element={<BlogPage />} /><Route path="/blog/:id" element={<ArticlePage />} /><Route path="/contact" element={<ContactPage />} /><Route path="/privacy" element={<PrivacyPage />} /><Route path="*" element={<NotFoundPage />} /></Routes></main><SiteFooter compact={pathname === '/contact' || pathname === '/privacy'} /></LanguageProvider>;
}
const standalone = document.documentElement.dataset.standalone === 'true' || window.location.protocol === 'file:';
const embedded = window.self !== window.top;
// Opaque sandboxed file viewers cannot construct history URLs. Keep their
// navigation in memory; direct file downloads retain shareable hash routes.
const Router = standalone ? (embedded ? MemoryRouter : HashRouter) : BrowserRouter;
ReactDOM.createRoot(document.getElementById('root')!).render(<Router><App /></Router>);
