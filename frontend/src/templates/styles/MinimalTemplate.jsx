import React from 'react';
import {
  ArrowRight,
  ChevronRight,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Star,
  Calendar,
} from 'lucide-react';
import { getSection, getSectionData, isSectionVisible, getStarRating, getContrastText } from '../sectionHelpers';

/**
 * MinimalTemplate - Clean / minimal style with simple borders, light fonts, and lots of whitespace.
 * Extracted from the original AI Builder v1 bundle (fy component).
 * Adapted to universal section schema (sections array + site object).
 */
const MinimalTemplate = ({ sections = [], site = {}, isMobile = false, onNavigate = null }) => {
  const siteName = site.name || site.siteName || 'Cabinet';
  const tagline = site.tagline || '';
  const colors = site.colors || { primary: '#2563eb', secondary: '#111827' };
  const { primary, secondary } = colors;

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
      className="w-full h-full overflow-y-auto bg-white"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Navbar — hidden on one-page booking sites (just a floating CTA) */}
      {site.isOnePage && isBookingPage ? (
        <a
          href="#booking"
          className="fixed top-4 right-4 z-50 px-4 py-2 text-sm font-medium text-white rounded-md no-underline"
          style={{ backgroundColor: primary }}
        >
          Prendre rendez-vous
        </a>
      ) : (
        <nav id="navbar" className="border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <a
              href={isBookingPage ? '#hero-practitioner' : '#hero'}
              className="font-semibold text-lg cursor-pointer no-underline"
              style={{ color: secondary }}
            >
              {siteName}
            </a>
            {!isMobile && (
              <div className="flex items-center gap-8">
                <a
                  href={isBookingPage ? '#hero-practitioner' : '#hero'}
                  className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition-colors no-underline"
                >
                  Accueil
                </a>
                {isBookingPage ? (
                  <>
                    {showServicesBooking && bookingServices.length > 0 && (
                      <a
                        href="#services-booking"
                        className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition-colors no-underline"
                      >
                        Prestations
                      </a>
                    )}
                    {isSectionVisible(sections, 'about') && aboutData.body && (
                      <a
                        href="#about"
                        className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition-colors no-underline"
                      >
                        À propos
                      </a>
                    )}
                    {showBookingWidget && (
                      <a
                        href="#booking"
                        className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition-colors no-underline"
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
                        className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition-colors no-underline"
                      >
                        Services
                      </a>
                    )}
                    {isSectionVisible(sections, 'about') && aboutData.body && (
                      <a
                        href="#about"
                        className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition-colors no-underline"
                      >
                        À propos
                      </a>
                    )}
                    <a
                      href="#contact"
                      className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition-colors no-underline"
                    >
                      Contact
                    </a>
                  </>
                )}
                <a
                  href={isBookingPage ? '#booking' : '#contact'}
                  className="px-4 py-2 text-sm font-medium text-white rounded-md no-underline"
                  style={{ backgroundColor: primary }}
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
          className={`${isMobile ? 'py-16 px-6' : 'py-24 px-6'}`}
        >
          <div className="max-w-3xl mx-auto">
            <span
              className="inline-block px-3 py-1 text-xs font-medium rounded-full mb-6"
              style={{ backgroundColor: `${primary}10`, color: primary }}
            >
              {siteName}
            </span>
            <h1
              className={`font-semibold leading-tight mb-6 ${isMobile ? 'text-3xl' : 'text-4xl lg:text-5xl'}`}
              style={{ color: secondary }}
              data-editable="headline"
            >
              {heroData.headline || heroData.title || siteName}
            </h1>
            <p
              className={`text-gray-500 mb-8 leading-relaxed ${isMobile ? 'text-base' : 'text-lg'}`}
              data-editable="subtitle"
            >
              {heroData.subheadline || tagline}
            </p>
            <div className={`flex gap-3 ${isMobile ? 'flex-col' : ''}`}>
              <a
                href={isBookingPage ? '#booking' : '#contact'}
                className="inline-block no-underline px-6 py-3 text-sm font-medium text-white rounded-md flex items-center justify-center gap-2"
                style={{ backgroundColor: primary }}
                data-editable="cta"
              >
                {heroData.ctaText || 'Commencer'}{' '}
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#about"
                className="inline-block no-underline px-6 py-3 text-sm font-medium rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                style={{ color: secondary }}
              >
                En savoir plus
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      {isSectionVisible(sections, 'services') && servicesData.services.length > 0 && (
        <section
          id="services"
          data-section="services"
          className={`${isMobile ? 'py-16 px-6' : 'py-20 px-6'} bg-white`}
        >
          <div className="max-w-3xl mx-auto">
            <h2
              className={`font-semibold mb-8 ${isMobile ? 'text-2xl' : 'text-3xl'}`}
              style={{ color: secondary }}
              data-editable="title"
            >
              {servicesData.title || 'Nos services'}
            </h2>
            <div className="space-y-4">
              {servicesData.services.slice(0, 4).map((service, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3
                        className="font-medium mb-1"
                        style={{ color: secondary }}
                        data-editable={`services[${idx}].title`}
                      >
                        {service.name}
                      </h3>
                      <p className="text-gray-500 text-sm" data-editable={`services[${idx}].description`}>
                        {service.shortDescription}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                  </div>
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
          className={`${isMobile ? 'py-16 px-6' : 'py-20 px-6'} bg-gray-50`}
        >
          <div className="max-w-5xl mx-auto">
            <div className={isMobile ? '' : 'grid grid-cols-2 gap-16 items-start'}>
              <div>
                <span className="text-sm font-medium mb-4 block" style={{ color: primary }}>
                  À propos
                </span>
                <h2
                  className={`font-semibold mb-6 ${isMobile ? 'text-2xl' : 'text-3xl'}`}
                  style={{ color: secondary }}
                  data-editable="title"
                >
                  {aboutData.title || 'Notre cabinet'}
                </h2>
                <div className="text-gray-500 leading-relaxed" data-editable="content" dangerouslySetInnerHTML={{ __html: aboutData.body }} />
                {aboutData.stats && aboutData.stats.length > 0 && (
                  <div className="mt-8 grid grid-cols-2 gap-6">
                    {aboutData.stats.map((stat, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-6 rounded-lg border border-gray-100"
                      >
                        <div className="text-3xl font-semibold mb-1" style={{ color: primary }}>
                          {stat.value}
                        </div>
                        <div className="text-gray-500 text-sm">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Image column */}
              {!isMobile && (
                <div className="flex items-center justify-center">
                  {aboutData.imageMediaId ? (
                    <img
                      src={typeof aboutData.imageMediaId === 'string' && aboutData.imageMediaId.startsWith('http') ? aboutData.imageMediaId : `/api/media/${aboutData.imageMediaId}/file`}
                      alt={aboutData.title || 'À propos'}
                      className="rounded-lg w-full max-h-[400px] object-cover"
                    />
                  ) : (
                    <div
                      data-editable="imageMediaId"
                      className="w-full h-64 rounded-lg border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-300 cursor-pointer hover:border-gray-300 transition-colors"
                    >
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                      <span className="text-xs">Ajouter une image</span>
                    </div>
                  )}
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
          className={`${isMobile ? 'py-16 px-6' : 'py-20 px-6'} bg-white`}
        >
          <div className="max-w-2xl mx-auto text-center">
            <p
              className={`leading-relaxed mb-6 ${isMobile ? 'text-lg' : 'text-xl'}`}
              style={{ color: secondary }}
              data-editable="items[0].quote"
            >
              "{testimonialsData.items[0].quote}"
            </p>
            <div>
              <div className="font-medium" style={{ color: secondary }} data-editable="items[0].author">
                {testimonialsData.items[0].author}
              </div>
              <div className="text-gray-400 text-sm" data-editable="items[0].role">
                {testimonialsData.items[0].role}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Google Reviews */}
      {isSectionVisible(sections, 'google-reviews') && googleReviewsData.testimonials.length > 0 && (
        <section
          id="google-reviews"
          data-section="google-reviews"
          className={`${isMobile ? 'py-16 px-6' : 'py-20 px-6'} bg-gray-50`}
        >
          <div className="max-w-5xl mx-auto">
            <h2
              className={`font-semibold mb-8 ${isMobile ? 'text-2xl' : 'text-3xl'}`}
              style={{ color: secondary }}
              data-editable="title"
            >
              {googleReviewsData.title || 'Avis clients'}
            </h2>
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
              {googleReviewsData.testimonials.slice(0, 6).map((review, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-lg border border-gray-100"
                >
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 mb-3">
                    {getStarRating(review.rating || 5).map((star, sIdx) => (
                      <Star
                        key={sIdx}
                        className="w-4 h-4"
                        style={{
                          color: star === 'empty' ? '#e5e7eb' : primary,
                          fill: star === 'full' ? primary : star === 'half' ? primary : 'none',
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {review.quote || review.text}
                  </p>
                  <div>
                    <div className="font-medium text-sm" style={{ color: secondary }}>
                      {review.author || review.name}
                    </div>
                    {review.date && (
                      <div className="text-gray-400 text-xs mt-0.5">{review.date}</div>
                    )}
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
          className={`${isMobile ? 'py-16 px-6' : 'py-20 px-6'} bg-white`}
        >
          <div className="max-w-3xl mx-auto">
            <h2
              className={`font-semibold mb-8 ${isMobile ? 'text-2xl' : 'text-3xl'}`}
              style={{ color: secondary }}
              data-editable="title"
            >
              {faqData.title || 'Questions fréquentes'}
            </h2>
            <div className="space-y-0">
              {faqData.items.map((item, idx) => (
                <div
                  key={idx}
                  className="py-6 border-b border-gray-100"
                >
                  <h3
                    className="font-medium mb-2"
                    style={{ color: secondary }}
                    data-editable={`items[${idx}].question`}
                  >
                    {item.question}
                  </h3>
                  <p
                    className="text-gray-500 text-sm leading-relaxed"
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
          className={`${isMobile ? 'py-16 px-6' : 'py-20 px-6'} bg-gray-50`}
        >
          <div className="max-w-5xl mx-auto">
            <h2
              className={`font-semibold mb-8 ${isMobile ? 'text-2xl' : 'text-3xl'}`}
              style={{ color: secondary }}
              data-editable="title"
            >
              {teamData.title || 'Notre équipe'}
            </h2>
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
              {teamData.members.map((member, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-lg border border-gray-100"
                >
                  <h3
                    className="font-medium mb-1"
                    style={{ color: secondary }}
                    data-editable={`members[${idx}].name`}
                  >
                    {member.name}
                  </h3>
                  <p className="text-sm mb-2" style={{ color: primary }} data-editable={`members[${idx}].role`}>
                    {member.role}
                  </p>
                  {member.bio && (
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {member.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hero Practitioner */}
      {showHeroPractitioner && (
        <section
          id="hero-practitioner"
          data-section="hero-practitioner"
          className={`${isMobile ? 'py-16 px-6' : 'py-24 px-6'} bg-white`}
        >
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-8 flex justify-center">
              {heroPractitionerData.photoMediaId ? (
                <img
                  src={`/api/media/${heroPractitionerData.photoMediaId}/file`}
                  alt={heroPractitionerData.name || 'Praticien'}
                  className="w-28 h-28 rounded-full object-cover"
                />
              ) : (
                <div
                  data-editable="photoMediaId"
                  className="w-28 h-28 rounded-full border border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-gray-400 transition-colors"
                  style={{ backgroundColor: `${primary}10` }}
                >
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                  <span className="text-[8px] text-gray-300">Photo</span>
                </div>
              )}
            </div>
            <h1
              data-editable="name"
              className={`font-semibold leading-tight mb-3 ${isMobile ? 'text-3xl' : 'text-4xl'}`}
              style={{ color: secondary }}
            >
              {heroPractitionerData.name || 'Votre praticien'}
            </h1>
            {heroPractitionerData.specialty && (
              <p className="text-sm font-medium mb-4" style={{ color: 'rgba(255,255,255,0.85)' }}>
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
              <p className={`text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed ${isMobile ? 'text-base' : 'text-lg'}`}>
                {heroPractitionerData.tagline}
              </p>
            )}
            {heroPractitionerData.ctaText && (
              <a
                href={heroPractitionerData.ctaUrl || '#booking'}
                className="inline-block no-underline px-6 py-3 text-sm font-medium text-white rounded-md"
                style={{ backgroundColor: primary }}
              >
                {heroPractitionerData.ctaText}
              </a>
            )}
          </div>
        </section>
      )}

      {/* Services Booking */}
      {showServicesBooking && bookingServices.length > 0 && (
        <section
          id="services-booking"
          data-section="services-booking"
          className={`${isMobile ? 'py-16 px-6' : 'py-20 px-6'} bg-white`}
        >
          <div className="max-w-3xl mx-auto">
            <h2
              data-editable="title"
              className={`font-semibold mb-2 ${isMobile ? 'text-2xl' : 'text-3xl'}`}
              style={{ color: secondary }}
            >
              {servicesBookingData.title || 'Nos prestations'}
            </h2>
            {servicesBookingData.subtitle && (
              <p className="text-gray-500 mb-8">{servicesBookingData.subtitle}</p>
            )}
            <div className="space-y-3">
              {bookingServices.map((svc, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium" style={{ color: secondary }}>{svc.name}</h3>
                    {svc.description && (
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{svc.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {svc.duration && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3.5 h-3.5" /> {svc.duration}
                        </span>
                      )}
                      {svc.price && (
                        <span className="text-sm font-medium" style={{ color: primary }}>{svc.price}</span>
                      )}
                    </div>
                  </div>
                  <a
                    href="#booking"
                    className="inline-block no-underline px-4 py-2 text-sm font-medium rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                    style={{ color: secondary }}
                  >
                    Réserver
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Booking Widget */}
      {showBookingWidget && (
        <section
          id="booking"
          data-section="booking-widget"
          className={`${isMobile ? 'py-16 px-6' : 'py-24 px-6'} bg-gray-50`}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium mb-4"
                style={{ backgroundColor: `${primary}10`, color: primary }}
              >
                <Calendar className="w-3.5 h-3.5" />
                Réservation en ligne
              </div>
              {bookingWidgetData.title && (
                <h2
                  data-editable="title"
                  className={`font-semibold mb-3 ${isMobile ? 'text-2xl' : 'text-3xl'}`}
                  style={{ color: secondary }}
                >
                  {bookingWidgetData.title}
                </h2>
              )}
              <p className={`text-gray-500 max-w-xl mx-auto ${isMobile ? 'text-sm' : 'text-base'}`}>
                Choisissez votre prestation et le créneau qui vous convient. Confirmation instantanée.
              </p>
            </div>
            {bookingWidgetData.calendarSlug ? (
              <div className="bg-white overflow-hidden border border-gray-200">
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
                className="bg-white border border-dashed border-gray-200 flex items-center justify-center"
                style={{ height: '300px' }}
              >
                <p className="text-gray-400 text-sm text-center">
                  Widget de réservation<br />
                  <span className="text-xs">Configurez le slug Calendar dans l'éditeur</span>
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA */}
      {isSectionVisible(sections, 'cta') && (
        <section
          id="cta"
          data-section="cta"
          className={`${isMobile ? 'py-16 px-6' : 'py-20 px-6'}`}
          style={{ backgroundColor: secondary }}
        >
          <div className="max-w-2xl mx-auto text-center">
            <h2
              className={`font-semibold text-white mb-4 ${isMobile ? 'text-2xl' : 'text-3xl'}`}
              data-editable="headline"
            >
              {ctaData.headline || 'Prêt à commencer ?'}
            </h2>
            <p className="text-white/60 mb-8" data-editable="subtitle">
              {ctaData.subtitle || 'Contactez-nous pour discuter de vos besoins'}
            </p>
            <button
              className="px-8 py-3 text-sm font-medium rounded-md"
              style={{ backgroundColor: primary, color: 'white' }}
              data-editable="buttonText"
            >
              {ctaData.buttonText || 'Prendre rendez-vous'}
            </button>
          </div>
        </section>
      )}

      {/* Contact / Footer */}
      {isSectionVisible(sections, 'contact') && (
        <footer
          id="contact"
          data-section="contact"
          className={`${isMobile ? 'py-12 px-6' : 'py-16 px-6'} bg-gray-50 border-t border-gray-100`}
        >
          <div className="max-w-5xl mx-auto">
            <div className={isMobile ? 'space-y-8' : 'flex justify-between items-start'}>
              <div>
                <span
                  className="font-semibold text-lg block mb-3"
                  style={{ color: secondary }}
                >
                  {siteName}
                </span>
                <p className="text-gray-400 text-sm max-w-xs">{tagline}</p>
              </div>
              <div className="space-y-3">
                {contactData.email && (
                  <div className="flex items-center gap-3 text-gray-500 text-sm">
                    <Mail className="w-4 h-4" style={{ color: primary }} />
                    <span data-editable="email">{contactData.email}</span>
                  </div>
                )}
                {contactData.phone && (
                  <div className="flex items-center gap-3 text-gray-500 text-sm">
                    <Phone className="w-4 h-4" style={{ color: primary }} />
                    <span data-editable="phone">{contactData.phone}</span>
                  </div>
                )}
                {contactData.address && (
                  <div className="flex items-center gap-3 text-gray-500 text-sm">
                    <MapPin className="w-4 h-4" style={{ color: primary }} />
                    <span data-editable="address">{contactData.address}</span>
                  </div>
                )}
              </div>
            </div>
            {(contactData.address || siteName) && (
              <div className="mt-10 overflow-hidden border border-gray-200">
                <iframe
                  src={`https://www.google.com/maps?q=${encodeURIComponent([siteName, site.city || contactData.address || ''].filter(Boolean).join(' '))}&output=embed`}
                  width="100%"
                  height="320"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localisation"
                />
              </div>
            )}
            <div className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-400 text-sm">
              © {new Date().getFullYear()} {siteName}. Tous droits réservés.
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default MinimalTemplate;
