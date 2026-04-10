import React from 'react';
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Diamond,
  Mail,
  Phone,
  MapPin,
  MessageSquareQuote,
  Star,
  Users,
} from 'lucide-react';
import { getSection, getSectionData, isSectionVisible, getStarRating, getContrastText } from '../sectionHelpers';

/**
 * ElegantTemplate - Refined / luxury style with serif fonts, thin lines, and minimal ornamentation.
 * Extracted from the original AI Builder v1 bundle (dy component).
 * Adapted to universal section schema (sections array + site object).
 */
const ElegantTemplate = ({ sections = [], site = {}, isMobile = false, onNavigate = null }) => {
  const siteName = site.name || site.siteName || 'Maison';
  const tagline = site.tagline || '';
  const colors = site.colors || { primary: '#b8860b', secondary: '#1a1a1a', accent: '#d4af37' };
  const { primary, secondary, accent } = colors;

  const heroData = getSectionData(sections, 'hero', {});
  const servicesData = getSectionData(sections, 'services', { services: [] });
  const aboutData = getSectionData(sections, 'about', {});
  const testimonialsData = getSectionData(sections, 'testimonials', { items: [] });
  const faqData = getSectionData(sections, 'faq', { items: [] });
  const googleReviewsData = getSectionData(sections, 'google-reviews', { testimonials: [] });
  const contactData = getSectionData(sections, 'contact', {});
  const ctaData = getSectionData(sections, 'cta', {});
  const teamData = getSectionData(sections, 'team', { members: [] });

  const heroPractitionerData = getSectionData(sections, 'hero-practitioner', {});
  const servicesBookingData = getSectionData(sections, 'services-booking', { services: [] });
  const bookingWidgetData = getSectionData(sections, 'booking-widget', {});

  const showHeroPractitioner = isSectionVisible(sections, 'hero-practitioner');
  const showServicesBooking = isSectionVisible(sections, 'services-booking');
  const showBookingWidget = isSectionVisible(sections, 'booking-widget');
  const isBookingPage = showHeroPractitioner || showBookingWidget;

  const bookingServices = servicesBookingData.services || [];

  const handleNavigate = (target) => {
    if (onNavigate) {
      onNavigate(target);
    } else {
      const el = document.getElementById(target);
      el && el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      className="w-full h-full overflow-y-auto bg-white relative"
      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
    >
      {/* Navbar — hidden on one-page booking sites (just a floating CTA) */}
      {site.isOnePage && isBookingPage ? (
        <a
          href="#booking"
          className="fixed top-4 right-4 z-50 px-6 py-2.5 text-sm tracking-[0.15em] uppercase text-white transition-opacity hover:opacity-90 no-underline shadow-lg"
          style={{ backgroundColor: primary, fontFamily: 'system-ui' }}
        >
          Prendre rendez-vous
        </a>
      ) : (
        <nav id="navbar" className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
            <a
              href={isBookingPage ? '#hero-practitioner' : '#hero'}
              className="flex items-center gap-3 no-underline"
            >
              <div className="w-px h-8" style={{ backgroundColor: primary }} />
              <span
                className="text-xl tracking-[0.2em] uppercase"
                style={{ color: secondary, fontFamily: 'system-ui' }}
              >
                {siteName}
              </span>
            </a>
            {!isMobile && (
              <div className="flex items-center gap-10">
                <a
                  href={isBookingPage ? '#hero-practitioner' : '#hero'}
                  className="text-sm tracking-[0.15em] uppercase text-gray-500 hover:text-gray-900 cursor-pointer transition-colors no-underline"
                  style={{ fontFamily: 'system-ui' }}
                >
                  Accueil
                </a>
                {isBookingPage ? (
                  <>
                    {showServicesBooking && bookingServices.length > 0 && (
                      <a
                        href="#services-booking"
                        className="text-sm tracking-[0.15em] uppercase text-gray-500 hover:text-gray-900 cursor-pointer transition-colors no-underline"
                        style={{ fontFamily: 'system-ui' }}
                      >
                        Prestations
                      </a>
                    )}
                    {isSectionVisible(sections, 'about') && aboutData.body && (
                      <a
                        href="#about"
                        className="text-sm tracking-[0.15em] uppercase text-gray-500 hover:text-gray-900 cursor-pointer transition-colors no-underline"
                        style={{ fontFamily: 'system-ui' }}
                      >
                        À propos
                      </a>
                    )}
                    {showBookingWidget && (
                      <a
                        href="#booking"
                        className="text-sm tracking-[0.15em] uppercase text-gray-500 hover:text-gray-900 cursor-pointer transition-colors no-underline"
                        style={{ fontFamily: 'system-ui' }}
                      >
                        Réserver
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    {isSectionVisible(sections, 'services') && servicesData.services.length > 0 && (
                      <a
                        href="#services"
                        className="text-sm tracking-[0.15em] uppercase text-gray-500 hover:text-gray-900 cursor-pointer transition-colors no-underline"
                        style={{ fontFamily: 'system-ui' }}
                      >
                        Services
                      </a>
                    )}
                    {isSectionVisible(sections, 'about') && aboutData.body && (
                      <a
                        href="#about"
                        className="text-sm tracking-[0.15em] uppercase text-gray-500 hover:text-gray-900 cursor-pointer transition-colors no-underline"
                        style={{ fontFamily: 'system-ui' }}
                      >
                        Maison
                      </a>
                    )}
                    <a
                      href="#contact"
                      className="text-sm tracking-[0.15em] uppercase text-gray-500 hover:text-gray-900 cursor-pointer transition-colors no-underline"
                      style={{ fontFamily: 'system-ui' }}
                    >
                      Contact
                    </a>
                  </>
                )}
                <a
                  href={isBookingPage ? '#booking' : '#contact'}
                  className="px-6 py-2.5 text-sm tracking-[0.15em] uppercase border transition-colors hover:bg-gray-900 hover:text-white no-underline"
                  style={{ borderColor: secondary, color: secondary, fontFamily: 'system-ui' }}
                >
                  {isBookingPage ? 'Prendre rendez-vous' : 'Nous contacter'}
                </a>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Hero */}
      {isSectionVisible(sections, 'hero') && (
        <section
          id="hero"
          data-section="hero"
          className={`min-h-screen flex items-center justify-center relative ${isMobile ? 'px-6 pt-24' : 'px-12'}`}
        >
          <div
            className="absolute top-24 left-8 w-24 h-24 border-l border-t opacity-20"
            style={{ borderColor: primary }}
          />
          <div
            className="absolute bottom-8 right-8 w-24 h-24 border-r border-b opacity-20"
            style={{ borderColor: primary }}
          />
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-px" style={{ backgroundColor: primary }} />
              <Diamond className="w-4 h-4" style={{ color: primary }} />
              <div className="w-16 h-px" style={{ backgroundColor: primary }} />
            </div>
            <p
              className="text-sm tracking-[0.3em] uppercase mb-6"
              style={{ color: primary, fontFamily: 'system-ui' }}
              data-editable="siteName"
            >
              {siteName}
            </p>
            <h1
              className={`font-light mb-8 leading-tight ${isMobile ? 'text-4xl' : 'text-6xl lg:text-7xl'}`}
              style={{ color: secondary }}
              data-editable="headline"
            >
              {heroData.headline || heroData.title || siteName}
            </h1>
            <p
              className={`text-gray-500 mb-12 max-w-xl mx-auto leading-relaxed ${isMobile ? 'text-lg' : 'text-xl'}`}
              data-editable="subtitle"
            >
              {heroData.subheadline || tagline}
            </p>
            <a
              href="#contact"
              className="group inline-block px-10 py-4 border text-sm tracking-[0.2em] uppercase transition-all hover:bg-gray-900 hover:text-white hover:border-gray-900 no-underline"
              style={{ borderColor: secondary, color: secondary, fontFamily: 'system-ui' }}
              data-editable="cta"
            >
              {heroData.ctaText || 'Découvrir'}
              <ArrowRight className="inline w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </section>
      )}

      {/* Hero Practitioner */}
      {showHeroPractitioner && (
        <section
          id="hero-practitioner"
          data-section="hero-practitioner"
          className={`min-h-screen flex items-center justify-center relative ${isMobile ? 'px-6 pt-24' : 'px-12'}`}
          style={{ background: `linear-gradient(180deg, #faf9f7 0%, #f3f0eb 100%)` }}
        >
          <div
            className="absolute top-24 left-8 w-24 h-24 border-l border-t opacity-15"
            style={{ borderColor: primary }}
          />
          <div
            className="absolute bottom-8 right-8 w-24 h-24 border-r border-b opacity-15"
            style={{ borderColor: primary }}
          />
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-8 flex justify-center">
              {heroPractitionerData.photoMediaId ? (
                <img
                  src={`/api/media/${heroPractitionerData.photoMediaId}/file`}
                  alt={heroPractitionerData.name || 'Praticien'}
                  className="w-36 h-36 rounded-full object-cover shadow-lg"
                  style={{ border: `1px solid ${primary}40` }}
                />
              ) : (
                <div
                  data-editable="photoMediaId"
                  className="photo-editor w-36 h-36 rounded-full border border-dashed shadow-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-opacity-60 transition-colors"
                  style={{ borderColor: `${primary}60`, backgroundColor: `${primary}15` }}
                >
                  <svg className="w-10 h-10" style={{ color: `${primary}50` }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                  <span className="text-[8px] tracking-[0.15em] uppercase" style={{ color: `${primary}50`, fontFamily: 'system-ui' }}>Photo</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-px" style={{ backgroundColor: primary }} />
              <Diamond className="w-4 h-4" style={{ color: primary }} />
              <div className="w-16 h-px" style={{ backgroundColor: primary }} />
            </div>
            <h1
              data-editable="name"
              className={`font-light mb-4 leading-tight ${isMobile ? 'text-4xl' : 'text-6xl lg:text-7xl'}`}
              style={{ color: secondary }}
            >
              {heroPractitionerData.name || 'Votre praticien'}
            </h1>
            {heroPractitionerData.specialty && (
              <p
                className={`italic mb-6 ${isMobile ? 'text-lg' : 'text-xl'}`}
                style={{ color: 'rgba(255,255,255,0.85)' }}
              >
                {heroPractitionerData.specialty}
              </p>
            )}
            {site.googleReviewRating && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      className="w-4 h-4"
                      style={{
                        color: i <= Math.round(site.googleReviewRating) ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                        fill: i <= Math.round(site.googleReviewRating) ? '#fbbf24' : 'none',
                      }}
                    />
                  ))}
                </div>
                <span className="text-white/80 text-sm font-medium">{site.googleReviewRating}</span>
                {site.googleReviewCount && (
                  <span className="text-white/50 text-sm">— {site.googleReviewCount} avis</span>
                )}
              </div>
            )}
            {heroPractitionerData.tagline && (
              <p
                className={`text-gray-500 mb-12 max-w-xl mx-auto leading-relaxed ${isMobile ? 'text-lg' : 'text-xl'}`}
              >
                {heroPractitionerData.tagline}
              </p>
            )}
            {heroPractitionerData.ctaText && (
              <a
                href={heroPractitionerData.ctaUrl || '#booking'}
                className="group inline-block px-10 py-4 border text-sm tracking-[0.2em] uppercase transition-all hover:bg-gray-900 hover:text-white hover:border-gray-900 no-underline"
                style={{ borderColor: secondary, color: secondary, fontFamily: 'system-ui' }}
              >
                {heroPractitionerData.ctaText}
                <ArrowRight className="inline w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
              </a>
            )}
          </div>
        </section>
      )}

      {/* Services */}
      {isSectionVisible(sections, 'services') && servicesData.services.length > 0 && (
        <section
          id="services"
          data-section="services"
          className={`${isMobile ? 'py-20 px-6' : 'py-32 px-12'} bg-white`}
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p
                className="text-sm tracking-[0.3em] uppercase mb-4"
                style={{ color: primary, fontFamily: 'system-ui' }}
              >
                Services
              </p>
              <h2
                className={`font-light ${isMobile ? 'text-3xl' : 'text-4xl'}`}
                style={{ color: secondary }}
                data-editable="title"
              >
                {servicesData.title || 'Notre Savoir-Faire'}
              </h2>
            </div>
            <div className="space-y-0">
              {servicesData.services.slice(0, 4).map((service, idx) => (
                <div
                  key={idx}
                  className="group py-8 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:pl-4 transition-all"
                >
                  <div>
                    <h3
                      className="text-2xl mb-2 group-hover:text-primary transition-colors"
                      style={{ color: secondary }}
                      data-editable={`services[${idx}].title`}
                    >
                      {service.name}
                    </h3>
                    <p className="text-gray-400" style={{ fontFamily: 'system-ui' }} data-editable={`services[${idx}].description`}>
                      {service.shortDescription}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Booking */}
      {showServicesBooking && bookingServices.length > 0 && (
        <section
          id="services-booking"
          data-section="services-booking"
          className={`${isMobile ? 'py-20 px-6' : 'py-32 px-12'} bg-white`}
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-12 h-px bg-gray-300" />
                <span
                  className="text-xs tracking-[0.3em] uppercase text-gray-400"
                  style={{ fontFamily: 'system-ui' }}
                >
                  Prestations
                </span>
                <div className="w-12 h-px bg-gray-300" />
              </div>
              <h2
                data-editable="title"
                className={`font-light ${isMobile ? 'text-3xl' : 'text-4xl'}`}
                style={{ color: secondary }}
              >
                {servicesBookingData.title || 'Nos Prestations'}
              </h2>
              {servicesBookingData.subtitle && (
                <p className="text-gray-400 mt-4 max-w-xl mx-auto italic">
                  {servicesBookingData.subtitle}
                </p>
              )}
            </div>
            <div className="space-y-0">
              {bookingServices.map((svc, idx) => (
                <div
                  key={idx}
                  className="group py-8 flex items-center justify-between hover:pl-4 transition-all"
                  style={{ borderBottom: `1px solid ${primary}20` }}
                >
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-2xl mb-2 group-hover:text-primary transition-colors"
                      style={{ color: secondary }}
                    >
                      {svc.name}
                    </h3>
                    {svc.description && (
                      <p className="text-gray-400 mb-3 line-clamp-2" style={{ fontFamily: 'system-ui' }}>
                        {svc.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4">
                      {svc.duration && (
                        <span className="flex items-center gap-1.5 text-xs text-gray-400" style={{ fontFamily: 'system-ui' }}>
                          <Clock className="w-3.5 h-3.5" /> {svc.duration}
                        </span>
                      )}
                      {svc.price && (
                        <span
                          className="text-sm tracking-wide"
                          style={{ color: primary, fontFamily: 'system-ui' }}
                        >
                          {svc.price}
                        </span>
                      )}
                    </div>
                  </div>
                  <a
                    href="#booking"
                    className="px-6 py-2.5 text-sm tracking-[0.15em] uppercase border transition-colors hover:bg-gray-900 hover:text-white flex-shrink-0 no-underline"
                    style={{ borderColor: secondary, color: secondary, fontFamily: 'system-ui' }}
                  >
                    Réserver
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About */}
      {isSectionVisible(sections, 'about') && aboutData.body && (
        <section
          id="about"
          data-section="about"
          className={`${isMobile ? 'py-20 px-6' : 'py-32 px-12'}`}
          style={{ backgroundColor: secondary }}
        >
          <div className="max-w-5xl mx-auto">
            <div className={isMobile ? '' : 'grid grid-cols-2 gap-20 items-center'}>
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-px" style={{ backgroundColor: primary }} />
                  <span
                    className="text-xs tracking-[0.3em] uppercase"
                    style={{ color: primary, fontFamily: 'system-ui' }}
                  >
                    Notre histoire
                  </span>
                </div>
                <h2
                  className={`font-light text-white mb-8 ${isMobile ? 'text-3xl' : 'text-4xl'}`}
                  data-editable="title"
                >
                  {aboutData.title || 'La Maison'}
                </h2>
                <div
                  className="text-white/60 text-lg leading-relaxed"
                  style={{ fontFamily: 'system-ui' }}
                  data-editable="content"
                  dangerouslySetInnerHTML={{ __html: aboutData.body }}
                />
              </div>
              {/* Image column */}
              {!isMobile && (
                <div className="flex items-center justify-center">
                  {aboutData.imageMediaId ? (
                    <img
                      src={typeof aboutData.imageMediaId === 'string' && aboutData.imageMediaId.startsWith('http') ? aboutData.imageMediaId : `/api/media/${aboutData.imageMediaId}/file`}
                      alt={aboutData.title || 'À propos'}
                      className="rounded-lg shadow-lg w-full max-h-[400px] object-cover"
                      style={{ border: `1px solid ${primary}30` }}
                    />
                  ) : (
                    <div
                      data-editable="imageMediaId"
                      className="image-placeholder w-full h-64 rounded-lg border border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-opacity-60 transition-colors"
                      style={{ borderColor: `${primary}50`, color: `${primary}60` }}
                    >
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                      <span className="text-xs tracking-[0.2em] uppercase" style={{ fontFamily: 'system-ui' }}>Ajouter une image</span>
                    </div>
                  )}
                </div>
              )}
              {isMobile && aboutData.stats && aboutData.stats.length > 0 && (
                <div className="mt-12 grid grid-cols-2 gap-8">
                  {aboutData.stats.map((stat, idx) => (
                    <div key={idx}>
                      <div className="text-5xl font-light mb-2" style={{ color: primary }}>
                        {stat.value}
                      </div>
                      <div
                        className="text-white/40 text-sm tracking-[0.2em] uppercase"
                        style={{ fontFamily: 'system-ui' }}
                      >
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {isSectionVisible(sections, 'testimonials') && testimonialsData.items.length > 0 && (
        <section
          id="testimonials"
          data-section="testimonials"
          className={`${isMobile ? 'py-20 px-6' : 'py-32 px-12'} bg-gray-50`}
        >
          <div className="max-w-3xl mx-auto text-center">
            <MessageSquareQuote
              className="w-12 h-12 mx-auto mb-8 opacity-10"
              style={{ color: primary }}
            />
            <p
              className={`font-light italic leading-relaxed mb-8 ${isMobile ? 'text-2xl' : 'text-3xl'}`}
              style={{ color: secondary }}
              data-editable="items[0].quote"
            >
              "{testimonialsData.items[0].quote}"
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-px bg-gray-300" />
              <div>
                <div
                  className="tracking-[0.15em] uppercase text-sm"
                  style={{ color: secondary, fontFamily: 'system-ui' }}
                  data-editable="items[0].author"
                >
                  {testimonialsData.items[0].author}
                </div>
                <div className="text-gray-400 text-sm" style={{ fontFamily: 'system-ui' }} data-editable="items[0].role">
                  {testimonialsData.items[0].role}
                </div>
              </div>
              <div className="w-12 h-px bg-gray-300" />
            </div>
          </div>
        </section>
      )}

      {/* Google Reviews */}
      {isSectionVisible(sections, 'google-reviews') && googleReviewsData.testimonials.length > 0 && (
        <section
          id="google-reviews"
          data-section="google-reviews"
          className={`${isMobile ? 'py-20 px-6' : 'py-32 px-12'} bg-white`}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-12 h-px bg-gray-300" />
                <span
                  className="text-xs tracking-[0.3em] uppercase text-gray-400"
                  style={{ fontFamily: 'system-ui' }}
                >
                  Avis clients
                </span>
                <div className="w-12 h-px bg-gray-300" />
              </div>
              <h2
                className={`font-light ${isMobile ? 'text-3xl' : 'text-4xl'}`}
                style={{ color: secondary }}
                data-editable="title"
              >
                {googleReviewsData.title || 'Ce que disent nos clients'}
              </h2>
            </div>
            <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
              {googleReviewsData.testimonials.slice(0, 6).map((review, idx) => (
                <div
                  key={idx}
                  className="p-8 border border-gray-100"
                >
                  {/* Gold stars */}
                  <div className="flex items-center gap-1 mb-4">
                    {getStarRating(review.rating || 5).map((star, sIdx) => (
                      <Star
                        key={sIdx}
                        className="w-4 h-4"
                        style={{
                          color: star === 'empty' ? '#e5e7eb' : accent || primary,
                          fill: star === 'full' ? (accent || primary) : star === 'half' ? (accent || primary) : 'none',
                        }}
                      />
                    ))}
                  </div>
                  <p
                    className="italic text-gray-600 leading-relaxed mb-6"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    "{review.quote || review.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-px" style={{ backgroundColor: primary }} />
                    <div>
                      <div
                        className="text-sm tracking-[0.1em] uppercase"
                        style={{ color: secondary, fontFamily: 'system-ui' }}
                      >
                        {review.author || review.name}
                      </div>
                      {review.date && (
                        <div className="text-gray-400 text-xs" style={{ fontFamily: 'system-ui' }}>
                          {review.date}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {isSectionVisible(sections, 'faq') && faqData.items.length > 0 && (
        <section
          id="faq"
          data-section="faq"
          className={`${isMobile ? 'py-20 px-6' : 'py-32 px-12'} bg-gray-50`}
        >
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-12 h-px bg-gray-300" />
                <span
                  className="text-xs tracking-[0.3em] uppercase text-gray-400"
                  style={{ fontFamily: 'system-ui' }}
                >
                  Questions
                </span>
                <div className="w-12 h-px bg-gray-300" />
              </div>
              <h2
                className={`font-light ${isMobile ? 'text-3xl' : 'text-4xl'}`}
                style={{ color: secondary }}
                data-editable="title"
              >
                {faqData.title || 'Questions Fréquentes'}
              </h2>
            </div>
            <div className="space-y-0">
              {faqData.items.map((item, idx) => (
                <div
                  key={idx}
                  className="py-8"
                  style={{ borderBottom: `1px solid ${primary}20` }}
                >
                  <h3
                    className="text-xl mb-4 tracking-wide"
                    style={{ color: secondary }}
                    data-editable={`items[${idx}].question`}
                  >
                    {item.question}
                  </h3>
                  <p
                    className="text-gray-500 italic leading-relaxed"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    data-editable={`items[${idx}].answer`}
                  >
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team */}
      {isSectionVisible(sections, 'team') && teamData.members.length > 0 && (
        <section
          id="team"
          data-section="team"
          className={`${isMobile ? 'py-20 px-6' : 'py-32 px-12'} bg-white`}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p
                className="text-sm tracking-[0.3em] uppercase mb-4"
                style={{ color: primary, fontFamily: 'system-ui' }}
              >
                L'Équipe
              </p>
              <h2
                className={`font-light ${isMobile ? 'text-3xl' : 'text-4xl'}`}
                style={{ color: secondary }}
                data-editable="title"
              >
                {teamData.title || 'Notre Équipe'}
              </h2>
            </div>
            <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
              {teamData.members.map((member, idx) => (
                <div
                  key={idx}
                  className="p-8 text-center"
                  style={{ border: `1px solid ${primary}30` }}
                >
                  <div
                    className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${primary}10` }}
                  >
                    <Users className="w-8 h-8" style={{ color: primary }} />
                  </div>
                  <h3
                    className="text-xl mb-2 tracking-wide"
                    style={{ color: secondary, fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    data-editable={`members[${idx}].name`}
                  >
                    {member.name}
                  </h3>
                  <p
                    className="text-gray-400 italic text-sm tracking-wide"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    data-editable={`members[${idx}].role`}
                  >
                    {member.role}
                  </p>
                  {member.bio && (
                    <p
                      className="text-gray-500 mt-4 text-sm leading-relaxed"
                      style={{ fontFamily: 'system-ui' }}
                    >
                      {member.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {isSectionVisible(sections, 'cta') && (
        <section
          id="cta"
          data-section="cta"
          className={`${isMobile ? 'py-20 px-6' : 'py-32 px-12'} bg-white`}
        >
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-px" style={{ backgroundColor: primary }} />
              <Diamond className="w-4 h-4" style={{ color: primary }} />
              <div className="w-16 h-px" style={{ backgroundColor: primary }} />
            </div>
            <h2
              className={`font-light mb-6 ${isMobile ? 'text-3xl' : 'text-4xl'}`}
              style={{ color: secondary }}
              data-editable="headline"
            >
              {ctaData.headline || 'Une Expérience Unique'}
            </h2>
            <p className="text-gray-500 mb-10 text-lg" style={{ fontFamily: 'system-ui' }} data-editable="subtitle">
              {ctaData.subtitle || 'Laissez-nous vous accompagner'}
            </p>
            <button
              className="px-12 py-4 text-sm tracking-[0.2em] uppercase transition-opacity hover:opacity-90"
              style={{ backgroundColor: secondary, color: getContrastText(secondary), fontFamily: 'system-ui' }}
              data-editable="buttonText"
            >
              {ctaData.buttonText || 'Prendre rendez-vous'}
            </button>
          </div>
        </section>
      )}

      {/* Booking Widget */}
      {showBookingWidget && (
        <section
          id="booking"
          data-section="booking-widget"
          className={`${isMobile ? 'py-20 px-6' : 'py-32 px-12'} relative overflow-hidden`}
          style={{ background: `linear-gradient(180deg, #faf9f7 0%, ${primary}0a 100%)` }}
        >
          {/* Subtle decorative dot pattern */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, ${primary}25 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }}
          />
          {/* Corner ornaments */}
          <div
            className="absolute top-12 left-8 w-20 h-20 border-l border-t opacity-20 pointer-events-none"
            style={{ borderColor: primary }}
          />
          <div
            className="absolute bottom-12 right-8 w-20 h-20 border-r border-b opacity-20 pointer-events-none"
            style={{ borderColor: primary }}
          />
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <div
                className="inline-flex items-center gap-3 px-5 py-2 mb-6"
                style={{
                  border: `1px solid ${primary}40`,
                  backgroundColor: `${primary}08`,
                  color: primary,
                  fontFamily: 'system-ui',
                }}
              >
                <Calendar className="w-4 h-4" />
                <span className="text-xs tracking-[0.25em] uppercase">Réservation en ligne</span>
              </div>
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-12 h-px bg-gray-300" />
                <Diamond className="w-4 h-4" style={{ color: primary }} />
                <div className="w-12 h-px bg-gray-300" />
              </div>
              <h2
                data-editable="title"
                className={`font-light mb-4 ${isMobile ? 'text-3xl' : 'text-5xl'}`}
                style={{ color: secondary }}
              >
                {bookingWidgetData.title || 'Prendre rendez-vous'}
              </h2>
              <p
                className={`italic text-gray-500 max-w-xl mx-auto ${isMobile ? 'text-base' : 'text-lg'}`}
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Choisissez votre prestation et le créneau qui vous convient. Confirmation instantanée.
              </p>
            </div>
            {bookingWidgetData.calendarSlug ? (
              <div
                className="bg-white overflow-hidden"
                style={{
                  border: `1px solid ${primary}30`,
                  boxShadow: `0 25px 70px -20px ${primary}30, 0 15px 40px -15px rgba(0,0,0,0.12)`,
                }}
              >
                <iframe
                  src={`https://calendar.swigs.online/book/${bookingWidgetData.calendarSlug}?embed=1&primary=${encodeURIComponent(primary)}`}
                  title="Réservation en ligne"
                  className="w-full border-0 block"
                  style={{ height: isMobile ? '600px' : '720px', backgroundColor: 'transparent' }}
                  allow="payment"
                  loading="lazy"
                />
              </div>
            ) : (
              <div
                className="bg-white flex items-center justify-center"
                style={{
                  height: '300px',
                  border: `1px dashed ${primary}40`,
                }}
              >
                <p className="text-gray-400 text-center italic">
                  Widget de réservation<br />
                  <span className="text-sm" style={{ fontFamily: 'system-ui' }}>
                    Configurez le slug Calendar dans l'éditeur
                  </span>
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Contact */}
      {isSectionVisible(sections, 'contact') && (
        <section
          id="contact"
          data-section="contact"
          className={isMobile ? 'py-16 px-6' : 'py-20 px-12'}
          style={{ backgroundColor: secondary }}
        >
          <div className="max-w-5xl mx-auto">
            <div className={isMobile ? 'space-y-10' : 'flex justify-between items-start'}>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-px h-6" style={{ backgroundColor: primary }} />
                  <span
                    className="text-lg tracking-[0.2em] uppercase text-white"
                    style={{ fontFamily: 'system-ui' }}
                  >
                    {siteName}
                  </span>
                </div>
                <p className="text-white/40 max-w-xs" style={{ fontFamily: 'system-ui' }}>
                  {tagline}
                </p>
              </div>
              <div className="space-y-4">
                {contactData.email && (
                  <div
                    className="flex items-center gap-4 text-white/50"
                    style={{ fontFamily: 'system-ui' }}
                  >
                    <Mail className="w-4 h-4" style={{ color: primary }} />
                    <span className="text-sm" data-editable="email">{contactData.email}</span>
                  </div>
                )}
                {contactData.phone && (
                  <div
                    className="flex items-center gap-4 text-white/50"
                    style={{ fontFamily: 'system-ui' }}
                  >
                    <Phone className="w-4 h-4" style={{ color: primary }} />
                    <span className="text-sm" data-editable="phone">{contactData.phone}</span>
                  </div>
                )}
                {contactData.address && (
                  <div
                    className="flex items-center gap-4 text-white/50"
                    style={{ fontFamily: 'system-ui' }}
                  >
                    <MapPin className="w-4 h-4" style={{ color: primary }} />
                    <span className="text-sm" data-editable="address">{contactData.address}</span>
                  </div>
                )}
              </div>
            </div>
            {(contactData.address || siteName) && (
              <div
                className="mt-12 overflow-hidden"
                style={{ border: `1px solid ${primary}30` }}
              >
                <iframe
                  src={`https://www.google.com/maps?q=${encodeURIComponent([siteName, site.city || contactData.address || ''].filter(Boolean).join(' '))}&output=embed`}
                  width="100%"
                  height="380"
                  style={{ border: 0, filter: 'grayscale(30%) contrast(1.05)' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localisation"
                />
              </div>
            )}
            <div className="mt-16 pt-8 border-t border-white/10 text-center">
              <p
                className="text-white/30 text-xs tracking-[0.2em] uppercase"
                style={{ fontFamily: 'system-ui' }}
              >
                © {new Date().getFullYear()} {siteName}. Tous droits réservés.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ElegantTemplate;
