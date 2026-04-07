import React, { useState } from 'react';
import { Home, ShoppingBag, Briefcase, User, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { styleConfig } from './styleConfig';
import ModernTemplate from './styles/ModernTemplate';
import BoldTemplate from './styles/BoldTemplate';
import ElegantTemplate from './styles/ElegantTemplate';
import MinimalTemplate from './styles/MinimalTemplate';
import ArtisticTemplate from './styles/ArtisticTemplate';
import ShopPage from './pages/ShopPage';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

const defaultVisibleSections = {
  navbar: true,
  hero: true,
  features: true,
  services: true,
  products: true,
  gallery: true,
  team: true,
  testimonials: true,
  pricing: true,
  faq: true,
  about: true,
  contact: true,
  cta: true,
  footer: true,
};

const pageTypeIcons = {
  home: Home,
  shop: ShoppingBag,
  services: Briefcase,
  about: User,
  contact: Phone,
};

const pageTypeAliases = {
  home: 'home',
  hero: 'home',
  products: 'shop',
  shop: 'shop',
  services: 'services',
  about: 'about',
  contact: 'contact',
};

/**
 * TemplatePreview - Multi-page preview component.
 * Handles page routing and navigation between pages with a bottom page bar.
 */
export function TemplatePreview({
  content,
  viewMode = 'desktop',
  visibleSections = {},
  onPageChange = null,
}) {
  const [currentPageId, setCurrentPageId] = useState('home');
  const isMobile = viewMode === 'mobile';
  const designStyle = content?.designStyle || 'modern';
  const config = styleConfig[designStyle] || styleConfig.modern;
  const colors = content?.colors || { primary: '#0ea5e9', secondary: '#1e293b', accent: '#f59e0b' };
  const siteName = content?.siteName || 'Site';
  const pages = content?.pages || [];
  const currentPage = pages.find((p) => p.id === currentPageId) || pages[0];
  const currentIndex = pages.findIndex((p) => p.id === currentPageId);

  const navigate = (target) => {
    let page = pages.find((p) => p.id === target || p.path === target);
    if (!page && pageTypeAliases[target]) {
      const alias = pageTypeAliases[target];
      page = pages.find((p) => p.id === alias);
    }
    if (page) {
      setCurrentPageId(page.id);
      onPageChange?.(page.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(target);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navigateDirection = (direction) => {
    const newIndex =
      direction === 'next'
        ? (currentIndex + 1) % pages.length
        : (currentIndex - 1 + pages.length) % pages.length;
    navigate(pages[newIndex].id);
  };

  const getPageIcon = (type) => pageTypeIcons[type] || Home;

  // Build merged content for the home page (style template)
  const renderHomePage = () => {
    const homePage = content.pages?.find((p) => p.id === 'home');
    const shopPage = content.pages?.find((p) => p.id === 'shop');
    const servicesPage = content.pages?.find((p) => p.id === 'services');
    const aboutPage = content.pages?.find((p) => p.id === 'about');
    const contactPage = content.pages?.find((p) => p.id === 'contact');

    const homeContent = homePage?.content || {};
    const shopContent = shopPage?.content || {};
    const servicesContent = servicesPage?.content || {};
    const aboutContent = aboutPage?.content || {};
    const contactContent = contactPage?.content || {};

    const mergedContent = {
      ...content,
      hero: homeContent.hero || content.hero || { title: siteName, subtitle: content.tagline },
      features: homeContent.features || content.features || [],
      services: servicesContent.services || content.services || [],
      products: shopContent.products || content.products || [],
      about: aboutContent.description
        ? { content: aboutContent.description, title: aboutContent.title }
        : content.about || {},
      team: aboutContent.team || content.team || [],
      testimonials: aboutContent.testimonials || content.testimonials || [],
      testimonial: content.testimonial || aboutContent.testimonials?.[0] || null,
      contact: {
        ...content.contact,
        email: contactContent.email || content.contact?.email,
        phone: contactContent.phone || content.contact?.phone,
        address: contactContent.address || content.contact?.address,
      },
    };

    const mergedSections = {
      navbar: true,
      hero: true,
      features: true,
      services: true,
      products: true,
      about: true,
      testimonials: true,
      contact: true,
      cta: true,
      footer: true,
      ...visibleSections,
    };

    const props = {
      content: mergedContent,
      isMobile,
      visibleSections: mergedSections,
      onNavigate: navigate,
    };

    switch (designStyle) {
      case 'bold':
        return <BoldTemplate {...props} />;
      case 'elegant':
        return <ElegantTemplate {...props} />;
      case 'minimal':
        return <MinimalTemplate {...props} />;
      case 'artistic':
        return <ArtisticTemplate {...props} />;
      case 'modern':
      default:
        return <ModernTemplate {...props} />;
    }
  };

  // Build nav bar for sub-pages (bold / elegant / default styles)
  const renderPageNav = () => {
    const navItems = [
      { id: 'home', label: 'ACCUEIL' },
      ...(pages.find((p) => p.id === 'shop') ? [{ id: 'shop', label: 'BOUTIQUE' }] : []),
      ...(pages.find((p) => p.id === 'services') ? [{ id: 'services', label: 'SERVICES' }] : []),
      ...(pages.find((p) => p.id === 'about') ? [{ id: 'about', label: 'A PROPOS' }] : []),
      { id: 'contact', label: 'CONTACT' },
    ];

    if (designStyle === 'bold') {
      return (
        <nav
          className="sticky top-0 z-50 px-6 py-4"
          style={{ backgroundColor: `${colors.secondary}f0`, backdropFilter: 'blur(10px)' }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('home')}
            >
              <div
                className="w-10 h-10 flex items-center justify-center font-black text-xl"
                style={{ color: colors.primary }}
              >
                {siteName?.charAt(0)}
              </div>
              <span className="text-white font-bold text-lg tracking-tight">{siteName}</span>
            </div>
            {!isMobile && (
              <div className="flex items-center gap-8">
                {navItems.map((item) => (
                  <span
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`text-sm font-medium cursor-pointer transition-colors uppercase tracking-wider ${
                      currentPageId === item.id ? 'text-white' : 'text-white/60 hover:text-white'
                    }`}
                    style={currentPageId === item.id ? { color: colors.primary } : {}}
                  >
                    {item.label}
                  </span>
                ))}
                <button
                  className="px-6 py-3 font-bold text-sm uppercase tracking-wider"
                  style={{ backgroundColor: colors.primary, color: 'white' }}
                  onClick={() => navigate(pages.find((p) => p.id === 'shop') ? 'shop' : 'contact')}
                >
                  {pages.find((p) => p.id === 'shop') ? 'BOUTIQUE' : 'CONTACT'}
                </button>
              </div>
            )}
          </div>
        </nav>
      );
    }

    if (designStyle === 'elegant') {
      return (
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('home')}
            >
              <div className="w-px h-8" style={{ backgroundColor: colors.primary }} />
              <span
                className="text-xl tracking-[0.2em] uppercase"
                style={{ color: colors.secondary, fontFamily: 'system-ui' }}
              >
                {siteName}
              </span>
            </div>
            {!isMobile && (
              <div className="flex items-center gap-10">
                {navItems.map((item) => (
                  <span
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`text-sm tracking-[0.15em] uppercase cursor-pointer transition-colors ${
                      currentPageId === item.id
                        ? 'text-gray-900'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                    style={{
                      fontFamily: 'system-ui',
                      ...(currentPageId === item.id ? { color: colors.primary } : {}),
                    }}
                  >
                    {item.label}
                  </span>
                ))}
                <button
                  className="px-6 py-2.5 text-sm tracking-[0.15em] uppercase border transition-colors hover:bg-gray-900 hover:text-white"
                  style={{
                    borderColor: colors.secondary,
                    color: colors.secondary,
                    fontFamily: 'system-ui',
                  }}
                  onClick={() => navigate('contact')}
                >
                  Reserver
                </button>
              </div>
            )}
          </div>
        </nav>
      );
    }

    // Default nav (modern / minimal / artistic)
    return (
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('home')}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg"
              style={{ backgroundColor: colors.primary }}
            >
              {siteName?.charAt(0)}
            </div>
            <span className="font-semibold" style={{ color: colors.secondary }}>
              {siteName}
            </span>
          </div>
          {!isMobile && (
            <div className="flex items-center gap-6">
              {navItems.map((item) => (
                <span
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`text-sm cursor-pointer transition-colors ${
                    currentPageId === item.id
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                  style={currentPageId === item.id ? { color: colors.primary } : {}}
                >
                  {item.label.charAt(0) + item.label.slice(1).toLowerCase()}
                </span>
              ))}
              <button
                className="px-5 py-2.5 text-sm font-medium text-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                style={{ backgroundColor: colors.primary }}
                onClick={() => navigate(pages.find((p) => p.id === 'shop') ? 'shop' : 'contact')}
              >
                {pages.find((p) => p.id === 'shop') ? 'Voir la boutique' : 'Nous contacter'}
              </button>
            </div>
          )}
        </div>
      </nav>
    );
  };

  const renderCurrentPage = () => {
    if (!currentPage) return null;

    if (currentPage.type === 'home') return renderHomePage();

    const pageProps = {
      content,
      pageContent: currentPage.content,
      colors,
      siteName,
      designStyle,
      styleConfig: config,
      onNavigate: navigate,
    };

    const PageComponent = {
      shop: ShopPage,
      services: ServicesPage,
      about: AboutPage,
      contact: ContactPage,
    }[currentPage.type] || ShopPage;

    return (
      <div className="min-h-screen">
        {renderPageNav()}
        <PageComponent {...pageProps} />
      </div>
    );
  };

  if (!content || pages.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white relative">
      <div className="flex-1 overflow-y-auto pb-12">{renderCurrentPage()}</div>

      {/* Bottom page navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 z-50">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-1 overflow-x-auto">
            {pages.map((page) => {
              const Icon = getPageIcon(page.type);
              const isActive = currentPageId === page.id;
              return (
                <button
                  key={page.id}
                  onClick={() => navigate(page.id)}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                    transition-all whitespace-nowrap
                    ${isActive ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-700'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {page.name}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <button
              onClick={() => navigateDirection('prev')}
              className="p-1 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="min-w-[50px] text-center">
              {currentIndex + 1} / {pages.length}
            </span>
            <button
              onClick={() => navigateDirection('next')}
              className="p-1 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * DesignPreview - Single-page preview that routes to the correct style template.
 * Used when there are no multi-page setups (legacy / simple mode).
 */
export function DesignPreview({
  content,
  domain,
  viewMode = 'desktop',
  visibleSections = defaultVisibleSections,
  onNavigate = null,
}) {
  if (!content) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Chargement de l&apos;apercu...</p>
      </div>
    );
  }

  const isMobile = viewMode === 'mobile';
  const designStyle = content.designStyle || 'modern';

  // If multi-page content, delegate to TemplatePreview
  if (content.pages && Array.isArray(content.pages) && content.pages.length > 0) {
    return (
      <TemplatePreview
        content={content}
        viewMode={viewMode}
        visibleSections={visibleSections}
        onPageChange={onNavigate}
      />
    );
  }

  const props = { content, isMobile, visibleSections, onNavigate };

  switch (designStyle) {
    case 'artistic':
      return <ArtisticTemplate {...props} />;
    case 'bold':
      return <BoldTemplate {...props} />;
    case 'elegant':
      return <ElegantTemplate {...props} />;
    case 'minimal':
      return <MinimalTemplate {...props} />;
    case 'modern':
    default:
      return <ModernTemplate {...props} />;
  }
}

export default DesignPreview;
