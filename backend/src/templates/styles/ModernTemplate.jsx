import React, { useState } from 'react';
import {
  Star,
  Zap,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Shield,
  Clock,
  Users,
  Mail,
  Phone,
  MapPin,
  MessageSquareQuote,
  Calendar,
} from 'lucide-react';
import { getSectionData, isSectionVisible, getVisibleSections, getStarRating, getContrastText } from '../sectionHelpers';

/**
 * ModernTemplate - Modern / clean style with rounded cards, gradients, and a polished look.
 * Adapted to the universal 9-block section schema.
 */
const ModernTemplate = ({ sections = [], site = {}, isMobile = false, onNavigate = null }) => {
  const [openFaq, setOpenFaq] = useState(null);

  const handleNavigate = (target) => {
    if (onNavigate) {
      onNavigate(target);
    } else {
      const el = document.getElementById(target);
      el && el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const siteName = site.name || site.siteName || 'Entreprise';
  const tagline = site.tagline || '';
  const colors = site.colors || { primary: '#0ea5e9', secondary: '#1e293b', accent: '#f59e0b' };
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

  const showHero = isSectionVisible(sections, 'hero');
  const showServices = isSectionVisible(sections, 'services');
  const showAbout = isSectionVisible(sections, 'about');
  const showTestimonials = isSectionVisible(sections, 'testimonials');
  const showFaq = isSectionVisible(sections, 'faq');
  const showGoogleReviews = isSectionVisible(sections, 'google-reviews');
  const showContact = isSectionVisible(sections, 'contact');
  const showCta = isSectionVisible(sections, 'cta');
  const showTeam = isSectionVisible(sections, 'team');

  const showHeroPractitioner = isSectionVisible(sections, 'hero-practitioner');
  const showServicesBooking = isSectionVisible(sections, 'services-booking');
  const showBookingWidget = isSectionVisible(sections, 'booking-widget');

  const isBookingPage = showHeroPractitioner || showBookingWidget;

  const services = servicesData.services || [];
  const testimonialItems = testimonialsData.items || [];
  const faqItems = faqData.items || [];
  const googleTestimonials = googleReviewsData.testimonials || [];
  const teamMembers = teamData.members || [];
  const bulletPoints = heroData.bulletPoints || [];
  const bookingServices = servicesBookingData.services || [];

  const iconMap = { shield: Shield, zap: Zap, clock: Clock, users: Users, star: Star };
  const getIcon = (name) => iconMap[name?.toLowerCase()] || Star;

  // Section renderers keyed by type
  const sectionRenderers = {
    hero: () =>
      showHero && (
        <section
          key="hero"
          id="hero"
          data-section="hero"
          className={`${isMobile ? 'py-16 px-6' : 'py-24 px-6'} relative overflow-hidden`}
          style={{ background: `linear-gradient(135deg, ${secondary} 0%, ${primary}90 100%)` }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}
            >
              <Star className="w-4 h-4" style={{ color: accent }} />
              Bienvenue chez {siteName}
            </div>
            <h1
              data-editable="headline"
              className={`font-bold text-white leading-tight mb-6 ${isMobile ? 'text-3xl' : 'text-4xl lg:text-5xl'}`}
            >
              {heroData.headline || siteName}
            </h1>
            <p
              data-editable="subheadline"
              className={`text-white/80 mb-8 max-w-2xl mx-auto ${isMobile ? 'text-base' : 'text-lg'}`}
            >
              {heroData.subheadline || tagline}
            </p>
            <div className={`flex gap-4 justify-center ${isMobile ? 'flex-col' : ''}`}>
              <button
                className="px-8 py-3.5 font-medium text-white rounded-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                style={{ backgroundColor: accent }}
              >
                {heroData.ctaText || 'Découvrir'}{' '}
                <ArrowRight className="inline w-4 h-4 ml-2" />
              </button>
              <button className="px-8 py-3.5 font-medium rounded-lg border-2 border-white/30 text-white hover:bg-white/10 transition-colors">
                En savoir plus
              </button>
            </div>
          </div>
        </section>
      ),

    services: () =>
      showServices && services.length > 0 && (
        <section
          key="services"
          id="services"
          data-section="services"
          className={`${isMobile ? 'py-16 px-6' : 'py-20 px-6'} bg-white`}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}
                style={{ color: secondary }}
              >
                Nos services
              </h2>
            </div>
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {services.slice(0, 4).map((service, idx) => (
                <div
                  key={idx}
                  className="group p-6 rounded-2xl border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${primary}15` }}
                    >
                      <Zap className="w-5 h-5" style={{ color: primary }} />
                    </div>
                    <div className="flex-1">
                      <h3
                        data-editable="name"
                        className="font-semibold mb-2 group-hover:text-primary transition-colors"
                        style={{ color: secondary }}
                      >
                        {service.name}
                      </h3>
                      <p className="text-gray-500 text-sm">{service.shortDescription}</p>
                      {service.price && (
                        <p className="text-sm font-medium mt-2" style={{ color: primary }}>
                          {service.price}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ),

    about: () =>
      showAbout && aboutData.body && (
        <section
          key="about"
          id="about"
          data-section="about"
          className={`${isMobile ? 'py-16 px-6' : 'py-20 px-6'}`}
          style={{ backgroundColor: `${primary}08` }}
        >
          <div className="max-w-6xl mx-auto">
            <div className={isMobile ? '' : 'grid grid-cols-2 gap-16 items-center'}>
              <div>
                <span
                  className="inline-block px-3 py-1 text-xs font-medium rounded-full mb-4"
                  style={{ backgroundColor: `${primary}15`, color: primary }}
                >
                  À propos
                </span>
                <h2
                  data-editable="title"
                  className={`font-bold mb-6 ${isMobile ? 'text-2xl' : 'text-3xl'}`}
                  style={{ color: secondary }}
                >
                  {aboutData.title || 'Notre entreprise'}
                </h2>
                <div data-editable="body" className="text-gray-600 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: aboutData.body }} />
                {aboutData.bulletPoints && aboutData.bulletPoints.length > 0 && (
                  <ul className="mt-6 space-y-3">
                    {aboutData.bulletPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: `${primary}15` }}
                        >
                          <ChevronRight className="w-3 h-3" style={{ color: primary }} />
                        </div>
                        <span className="text-gray-600">{typeof point === 'string' ? point : (point.value || point.text)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {aboutData.ctaText && (
                  <button
                    className="mt-6 px-6 py-3 font-medium text-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                    style={{ backgroundColor: primary }}
                  >
                    {aboutData.ctaText}
                  </button>
                )}
              </div>
              {/* Image column */}
              {!isMobile && (
                <div className="flex items-center justify-center">
                  {aboutData.imageMediaId ? (
                    <img
                      src={typeof aboutData.imageMediaId === 'string' && aboutData.imageMediaId.startsWith('http') ? aboutData.imageMediaId : `/api/media/${aboutData.imageMediaId}/file`}
                      alt={aboutData.title || 'À propos'}
                      className="rounded-2xl shadow-lg w-full max-h-[400px] object-cover"
                    />
                  ) : (
                    <div
                      data-image-field="imageMediaId"
                      className="w-full h-64 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 cursor-pointer hover:border-gray-400 transition-colors"
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
      ),

    testimonials: () =>
      showTestimonials && testimonialItems.length > 0 && (
        <section
          key="testimonials"
          id="testimonials"
          data-section="testimonials"
          className={`${isMobile ? 'py-16 px-6' : 'py-20 px-6'} bg-white`}
        >
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}
                style={{ color: secondary }}
              >
                Témoignages
              </h2>
            </div>
            {testimonialItems.map((item, idx) => (
              <div key={idx} className={`bg-gray-50 p-8 rounded-3xl text-center ${idx > 0 ? 'mt-6' : ''}`}>
                <MessageSquareQuote
                  className="w-12 h-12 mx-auto mb-6 opacity-20"
                  style={{ color: primary }}
                />
                <p
                  data-editable="quote"
                  className={`leading-relaxed mb-6 ${isMobile ? 'text-lg' : 'text-xl'}`}
                  style={{ color: secondary }}
                >
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: primary }}
                  >
                    {item.author?.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold" style={{ color: secondary }}>
                      {item.author}
                    </div>
                    <div className="text-gray-500 text-sm">{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ),

    'google-reviews': () =>
      showGoogleReviews && (
        <section
          key="google-reviews"
          id="google-reviews"
          data-section="google-reviews"
          className={`${isMobile ? 'py-16 px-6' : 'py-20 px-6'} bg-gray-50`}
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2
                data-editable="title"
                className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}
                style={{ color: secondary }}
              >
                {googleReviewsData.title || 'Avis Google'}
              </h2>
              {googleReviewsData.rating && (
                <div className="flex items-center justify-center gap-3 mt-4">
                  <div className="flex gap-1">
                    {getStarRating(googleReviewsData.rating).map((state, idx) => (
                      <Star
                        key={idx}
                        className={`w-6 h-6 ${state === 'full' ? 'fill-current' : state === 'half' ? 'fill-current opacity-50' : 'opacity-20'}`}
                        style={{ color: accent }}
                      />
                    ))}
                  </div>
                  <span className="text-2xl font-bold" style={{ color: secondary }}>
                    {googleReviewsData.rating}
                  </span>
                  {googleReviewsData.reviewCount && (
                    <span className="text-gray-500 text-sm">
                      ({googleReviewsData.reviewCount} avis)
                    </span>
                  )}
                </div>
              )}
              {/* Google badge */}
              <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100 text-sm text-gray-500">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </div>
            </div>
            {googleTestimonials.length > 0 && (
              <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {googleTestimonials.map((review, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                  >
                    <div className="flex gap-1 mb-3">
                      {getStarRating(review.rating || 5).map((state, sIdx) => (
                        <Star
                          key={sIdx}
                          className={`w-4 h-4 ${state === 'full' ? 'fill-current' : 'opacity-20'}`}
                          style={{ color: accent }}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      &ldquo;{review.quote || review.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: primary }}
                      >
                        {(review.author || review.name)?.charAt(0)}
                      </div>
                      <span className="text-sm font-medium" style={{ color: secondary }}>
                        {review.author || review.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {googleReviewsData.ctaText && (
              <div className="text-center mt-8">
                <a
                  href={googleReviewsData.ctaUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 font-medium text-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                  style={{ backgroundColor: primary }}
                >
                  {googleReviewsData.ctaText}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </section>
      ),

    faq: () =>
      showFaq && faqItems.length > 0 && (
        <section
          key="faq"
          id="faq"
          data-section="faq"
          className={`${isMobile ? 'py-16 px-6' : 'py-20 px-6'} bg-white`}
        >
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span
                className="inline-block px-3 py-1 text-xs font-medium rounded-full mb-4"
                style={{ backgroundColor: `${primary}15`, color: primary }}
              >
                FAQ
              </span>
              <h2
                className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}
                style={{ color: secondary }}
              >
                Questions fréquentes
              </h2>
            </div>
            <div className="space-y-4">
              {faqItems.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden"
                >
                  <button
                    className="w-full flex items-center justify-between p-6 text-left"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  >
                    <span className="font-semibold" style={{ color: secondary }}>
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 ml-4 transition-transform duration-200 ${openFaq === idx ? 'rotate-180' : ''}`}
                      style={{ color: primary }}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${openFaq === idx ? 'max-h-96' : 'max-h-0'}`}
                  >
                    <p className="px-6 pb-6 text-gray-500 leading-relaxed">{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ),

    team: () =>
      showTeam && teamMembers.length > 0 && (
        <section
          key="team"
          id="team"
          data-section="team"
          className={`${isMobile ? 'py-16 px-6' : 'py-20 px-6'} bg-gray-50`}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span
                className="inline-block px-3 py-1 text-xs font-medium rounded-full mb-4"
                style={{ backgroundColor: `${primary}15`, color: primary }}
              >
                Équipe
              </span>
              <h2
                className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}
                style={{ color: secondary }}
              >
                Notre équipe
              </h2>
            </div>
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
              {teamMembers.map((member, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-lg transition-shadow"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
                    style={{ backgroundColor: primary }}
                  >
                    {member.name?.charAt(0)}
                  </div>
                  <h3
                    data-editable="name"
                    className="font-semibold text-lg"
                    style={{ color: secondary }}
                  >
                    {member.name}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">{member.role}</p>
                  {member.bio && (
                    <p className="text-gray-500 text-sm mt-3 leading-relaxed">{member.bio}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      ),

    cta: () =>
      showCta && (
        <section
          key="cta"
          id="cta"
          data-section="cta"
          className={`${isMobile ? 'py-16 px-6' : 'py-20 px-6'}`}
          style={{ backgroundColor: primary }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2
              data-editable="headline"
              className={`font-bold text-white mb-4 ${isMobile ? 'text-2xl' : 'text-3xl'}`}
            >
              {ctaData.headline || 'Prêt à commencer ?'}
            </h2>
            <div data-editable="body" className="text-white/80 mb-8" dangerouslySetInnerHTML={{ __html: ctaData.body || 'Contactez-nous dès aujourd\'hui pour discuter de votre projet' }} />
            <button
              className="px-8 py-3.5 font-medium rounded-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              style={{ backgroundColor: 'white', color: primary }}
            >
              {ctaData.ctaText || 'Nous contacter'} <ChevronRight className="inline w-4 h-4 ml-1" />
            </button>
          </div>
        </section>
      ),

    contact: () =>
      showContact && (
        <section
          key="contact"
          id="contact"
          data-section="contact"
          className={`${isMobile ? 'py-16 px-6' : 'py-20 px-6'} bg-gray-50`}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2
              data-editable="title"
              className={`font-bold mb-6 ${isMobile ? 'text-2xl' : 'text-3xl'}`}
              style={{ color: secondary }}
            >
              {contactData.title || 'Contactez-nous'}
            </h2>
            {contactData.body && (
              <div data-editable="body" className="text-gray-500 mb-8 max-w-xl mx-auto" dangerouslySetInnerHTML={{ __html: contactData.body }} />
            )}
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
              {contactData.email && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <Mail className="w-8 h-8 mx-auto mb-3" style={{ color: primary }} />
                  <p className="text-gray-600">{contactData.email}</p>
                </div>
              )}
              {contactData.phone && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <Phone className="w-8 h-8 mx-auto mb-3" style={{ color: primary }} />
                  <p className="text-gray-600">{contactData.phone}</p>
                </div>
              )}
              {contactData.address && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <MapPin className="w-8 h-8 mx-auto mb-3" style={{ color: primary }} />
                  <p className="text-gray-600">{contactData.address}</p>
                </div>
              )}
            </div>
            {contactData.hours && (
              <p className="text-gray-400 text-sm mt-6">{contactData.hours}</p>
            )}
            {(contactData.address || siteName) && (
              <div className="mt-8 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <iframe
                  src={`https://www.google.com/maps?q=${encodeURIComponent([siteName, site.city || contactData.address || ''].filter(Boolean).join(' '))}&output=embed`}
                  width="100%"
                  height="380"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localisation"
                />
              </div>
            )}
          </div>
        </section>
      ),

    'hero-practitioner': () =>
      showHeroPractitioner && (
        <section
          key="hero-practitioner"
          id="hero-practitioner"
          data-section="hero-practitioner"
          className={`${isMobile ? 'py-16 px-6' : 'py-24 px-6'} relative overflow-hidden`}
          style={{ background: `linear-gradient(135deg, ${secondary} 0%, ${primary}90 100%)` }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 flex justify-center">
              {heroPractitionerData.photoMediaId ? (
                <img
                  src={`/api/media/${heroPractitionerData.photoMediaId}/file`}
                  alt={heroPractitionerData.name || 'Praticien'}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-xl"
                />
              ) : (
                <div
                  data-image-field="photoMediaId"
                  className="w-32 h-32 rounded-full border-2 border-dashed border-white/40 shadow-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-white/60 transition-colors"
                  style={{ backgroundColor: `${primary}30` }}
                >
                  <svg className="w-10 h-10 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                  <span className="text-[8px] text-white/40">Photo</span>
                </div>
              )}
            </div>
            <h1
              data-editable="name"
              className={`font-bold text-white ${isMobile ? 'text-3xl' : 'text-5xl'} mb-3`}
            >
              {heroPractitionerData.name || 'Votre praticien'}
            </h1>
            {heroPractitionerData.specialty && (
              <p
                className={`font-medium mb-4 ${isMobile ? 'text-lg' : 'text-xl'}`}
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
              <p className={`text-white/70 max-w-2xl mx-auto mb-8 ${isMobile ? 'text-base' : 'text-lg'}`}>
                {heroPractitionerData.tagline}
              </p>
            )}
            {heroPractitionerData.ctaText && (
              <a
                href={heroPractitionerData.ctaUrl || '#booking'}
                className={`inline-block px-8 py-3.5 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all no-underline ${isMobile ? 'text-base' : 'text-lg'}`}
                style={{ backgroundColor: accent }}
              >
                {heroPractitionerData.ctaText}
              </a>
            )}
          </div>
        </section>
      ),

    'services-booking': () =>
      showServicesBooking && bookingServices.length > 0 && (
        <section
          key="services-booking"
          id="services-booking"
          data-section="services-booking"
          className={`${isMobile ? 'py-16 px-6' : 'py-20 px-6'}`}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2
                data-editable="title"
                className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}
                style={{ color: secondary }}
              >
                {servicesBookingData.title || 'Nos prestations'}
              </h2>
              {servicesBookingData.subtitle && (
                <p className="text-gray-500 mt-3 max-w-xl mx-auto">{servicesBookingData.subtitle}</p>
              )}
            </div>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {bookingServices.map((svc, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold" style={{ color: secondary }}>{svc.name}</h3>
                    {svc.description && <p className="text-gray-500 text-sm mt-1 line-clamp-2">{svc.description}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      {svc.duration && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3.5 h-3.5" /> {svc.duration}
                        </span>
                      )}
                      {svc.price && (
                        <span className="text-sm font-semibold" style={{ color: primary }}>{svc.price}</span>
                      )}
                    </div>
                  </div>
                  <a
                    href="#booking"
                    className="px-4 py-2 text-sm font-medium rounded-lg text-white flex-shrink-0 no-underline"
                    style={{ backgroundColor: primary }}
                  >
                    Réserver
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      ),

    'booking-widget': () =>
      showBookingWidget && (
        <section
          key="booking-widget"
          id="booking"
          data-section="booking-widget"
          className={`${isMobile ? 'py-16 px-6' : 'py-24 px-6'} relative overflow-hidden`}
          style={{ background: `linear-gradient(180deg, ${primary}05 0%, ${primary}12 100%)` }}
        >
          {/* Decorative dots pattern */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, ${primary}20 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center mb-10">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
                style={{ backgroundColor: `${primary}15`, color: primary }}
              >
                <Calendar className="w-4 h-4" />
                Réservation en ligne
              </div>
              {bookingWidgetData.title && (
                <h2
                  data-editable="title"
                  className={`font-bold mb-3 ${isMobile ? 'text-2xl' : 'text-4xl'}`}
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
              <div
                className="bg-white rounded-3xl overflow-hidden border border-gray-100"
                style={{ boxShadow: `0 20px 60px -15px ${primary}25, 0 10px 30px -10px rgba(0,0,0,0.1)` }}
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
                className="bg-white rounded-3xl border-2 border-dashed border-gray-300 flex items-center justify-center"
                style={{ height: '300px' }}
              >
                <p className="text-gray-400 text-center">
                  Widget de réservation<br />
                  <span className="text-sm">Configurez le slug Calendar dans l'éditeur</span>
                </p>
              </div>
            )}
          </div>
        </section>
      ),
  };

  // Default section order
  const defaultOrder = ['hero', 'hero-practitioner', 'services', 'services-booking', 'about', 'testimonials', 'google-reviews', 'faq', 'team', 'cta', 'booking-widget', 'contact'];

  // Render sections in order from the sections array, falling back to default order
  const visibleSections = getVisibleSections(sections);
  const orderedTypes = visibleSections.length > 0
    ? visibleSections.map(s => s.type)
    : defaultOrder;

  return (
    <div
      className="w-full h-full overflow-y-auto bg-white"
      data-preview-container
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Navbar — hidden on one-page booking sites (just a floating CTA) */}
      {site.isOnePage && isBookingPage ? (
        <a
          href="#booking"
          className="fixed top-4 right-4 z-50 px-5 py-2.5 text-sm font-medium text-white rounded-lg shadow-lg hover:shadow-xl transition-shadow no-underline"
          style={{ backgroundColor: primary }}
        >
          Prendre rendez-vous
        </a>
      ) : (
        <nav
          id="navbar"
          className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm"
        >
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <a
              href={isBookingPage ? '#hero-practitioner' : '#hero'}
              className="flex items-center gap-3 cursor-pointer no-underline"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg"
                style={{ backgroundColor: primary }}
              >
                {siteName?.charAt(0)}
              </div>
              <span className="font-semibold" style={{ color: secondary }}>
                {siteName}
              </span>
            </a>
            {!isMobile && (
              <div className="flex items-center gap-6">
                <a href={isBookingPage ? '#hero-practitioner' : '#hero'} className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition-colors no-underline">
                  Accueil
                </a>
                {isBookingPage ? (
                  <>
                    {showServicesBooking && bookingServices.length > 0 && (
                      <a href="#services-booking" className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition-colors no-underline">
                        Prestations
                      </a>
                    )}
                    {showAbout && aboutData.body && (
                      <a href="#about" className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition-colors no-underline">
                        À propos
                      </a>
                    )}
                    {showBookingWidget && (
                      <a href="#booking" className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition-colors no-underline">
                        Réserver
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    {showServices && services.length > 0 && (
                      <a href="#services" className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition-colors no-underline">
                        Services
                      </a>
                    )}
                    {showAbout && aboutData.body && (
                      <a href="#about" className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition-colors no-underline">
                        À propos
                      </a>
                    )}
                    <a href="#contact" className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition-colors no-underline">
                      Contact
                    </a>
                  </>
                )}
                <a
                  href={isBookingPage ? '#booking' : '#contact'}
                  className="px-5 py-2.5 text-sm font-medium text-white rounded-lg shadow-lg hover:shadow-xl transition-shadow no-underline"
                  style={{ backgroundColor: primary }}
                >
                  {isBookingPage ? 'Prendre rendez-vous' : 'Nous contacter'}
                </a>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Render sections in order */}
      {orderedTypes.map(type => {
        const renderer = sectionRenderers[type];
        return renderer ? renderer() : null;
      })}

      {/* Footer */}
      <footer
        id="footer"
        data-section="footer"
        className={isMobile ? 'py-12 px-6' : 'py-16 px-6'}
        style={{ backgroundColor: secondary }}
      >
        <div className="max-w-6xl mx-auto">
          <div className={isMobile ? 'space-y-8' : 'flex justify-between items-start'}>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: primary }}
                >
                  {siteName?.charAt(0)}
                </div>
                <span className="text-white font-semibold">{siteName}</span>
              </div>
              <p className="text-white/50 max-w-xs text-sm">{tagline}</p>
            </div>
            <div className="space-y-3">
              {contactData.email && (
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <Mail className="w-4 h-4" style={{ color: primary }} />
                  <span>{contactData.email}</span>
                </div>
              )}
              {contactData.phone && (
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <Phone className="w-4 h-4" style={{ color: primary }} />
                  <span>{contactData.phone}</span>
                </div>
              )}
              {contactData.address && (
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <MapPin className="w-4 h-4" style={{ color: primary }} />
                  <span>{contactData.address}</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
            © {new Date().getFullYear()} {siteName}. Tous droits réservés. | Hébergé par SWIGS
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernTemplate;
