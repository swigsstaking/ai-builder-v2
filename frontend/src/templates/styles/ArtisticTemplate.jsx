import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Star,
  Palette,
  Wand2,
  Lightbulb,
  Mail,
  Phone,
  MapPin,
  MessageSquareQuote,
  Rocket,
  ChevronDown,
  Users,
  BadgeCheck,
  Clock,
  Calendar,
} from 'lucide-react';
import { getSection, getSectionData, isSectionVisible, getStarRating, getContrastText } from '../sectionHelpers';

/**
 * ArtisticTemplate - Creative / artistic style with gradients, rounded shapes, and playful layout.
 * Adapted to universal section schema (sections array + site object).
 */
const ArtisticTemplate = ({ sections = [], site = {}, isMobile = false, onNavigate = null }) => {
  const siteName = site.name || site.siteName || 'Studio';
  const tagline = site.tagline || '';
  const colors = site.colors || { primary: '#7c3aed', secondary: '#1e293b', accent: '#f59e0b' };
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

  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  return (
    <div
      className="w-full h-full overflow-y-auto bg-white relative"
      style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
    >
      {/* Navbar — hidden on one-page booking sites (just a floating CTA) */}
      {site.isOnePage && isBookingPage ? (
        <a
          href="#booking"
          className="fixed top-4 right-4 z-50 px-5 py-2.5 text-sm font-semibold rounded-full shadow-2xl hover:scale-105 transition-transform no-underline"
          style={{ background: `linear-gradient(135deg, ${primary}, ${accent})`, color: '#fff' }}
        >
          Prendre rendez-vous
        </a>
      ) : (
        <nav id="navbar" className="sticky top-0 z-50 p-4">
          <div
            className="backdrop-blur-lg rounded-2xl px-6 py-3 flex items-center justify-between shadow-lg"
            style={{ backgroundColor: `${secondary}ee` }}
          >
            <a
              href={isBookingPage ? '#hero-practitioner' : '#hero'}
              className="flex items-center gap-3 cursor-pointer no-underline"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold rotate-3 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
              >
                {siteName?.charAt(0)}
              </div>
              <span className="text-white font-semibold">{siteName}</span>
            </a>
            {!isMobile && (
              <div className="flex items-center gap-6">
                <a
                  href={isBookingPage ? '#hero-practitioner' : '#hero'}
                  className="text-white/70 text-sm hover:text-white cursor-pointer transition-colors no-underline"
                >
                  Accueil
                </a>
                {isBookingPage ? (
                  <>
                    {showServicesBooking && bookingServices.length > 0 && (
                      <a
                        href="#services-booking"
                        className="text-white/70 text-sm hover:text-white cursor-pointer transition-colors no-underline"
                      >
                        Prestations
                      </a>
                    )}
                    {isSectionVisible(sections, 'about') && aboutData.body && (
                      <a
                        href="#about"
                        className="text-white/70 text-sm hover:text-white cursor-pointer transition-colors no-underline"
                      >
                        À propos
                      </a>
                    )}
                    {showBookingWidget && (
                      <a
                        href="#booking"
                        className="text-white/70 text-sm hover:text-white cursor-pointer transition-colors no-underline"
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
                        className="text-white/70 text-sm hover:text-white cursor-pointer transition-colors no-underline"
                      >
                        Services
                      </a>
                    )}
                    {isSectionVisible(sections, 'about') && aboutData.body && (
                      <a
                        href="#about"
                        className="text-white/70 text-sm hover:text-white cursor-pointer transition-colors no-underline"
                      >
                        À propos
                      </a>
                    )}
                    <a
                      href="#contact"
                      className="text-white/70 text-sm hover:text-white cursor-pointer transition-colors no-underline"
                    >
                      Contact
                    </a>
                  </>
                )}
                <a
                  href={isBookingPage ? '#booking' : '#contact'}
                  className="px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:scale-105 transition-transform no-underline inline-block"
                  style={{ backgroundColor: accent, color: secondary }}
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
          className={`relative min-h-screen flex items-center overflow-hidden ${isMobile ? 'px-6 pt-24' : 'px-12'}`}
          style={{
            background: `linear-gradient(160deg, ${secondary} 0%, ${primary}90 60%, ${accent}70 100%)`,
          }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl"
              style={{ backgroundColor: accent, top: '10%', right: '-10%' }}
            />
            <div
              className="absolute w-64 h-64 rounded-full opacity-10 blur-2xl"
              style={{ backgroundColor: primary, bottom: '20%', left: '-5%' }}
            />
            <div
              className="absolute w-32 h-32 rounded-3xl rotate-45 opacity-20"
              style={{ backgroundColor: accent, top: '30%', left: '60%' }}
            />
            <div
              className="absolute w-20 h-20 rounded-2xl -rotate-12 opacity-15"
              style={{ backgroundColor: primary, bottom: '30%', right: '20%' }}
            />
          </div>

          <div
            className={`relative z-10 ${isMobile ? 'text-center' : 'flex items-center justify-between w-full max-w-7xl mx-auto'}`}
          >
            <div className={isMobile ? '' : 'max-w-2xl'}>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
                style={{ backgroundColor: `${accent}30`, color: accent }}
              >
                <Sparkles className="w-4 h-4" />
                {siteName}
              </div>
              <h1
                data-editable="headline"
                className={`font-bold text-white mb-6 leading-tight ${isMobile ? 'text-3xl' : 'text-5xl lg:text-6xl'}`}
              >
                {heroData.headline || heroData.title || siteName}
              </h1>
              <p data-editable="subtitle" className={`text-white/80 mb-8 ${isMobile ? 'text-base' : 'text-xl'}`}>
                {heroData.subheadline || tagline}
              </p>
              <div className={`flex gap-4 ${isMobile ? 'flex-col' : ''}`}>
                <a
                  href={isBookingPage ? '#booking' : '#contact'}
                  className="inline-block px-8 py-4 rounded-full font-semibold shadow-2xl hover:scale-105 transition-all no-underline"
                  style={{ backgroundColor: accent, color: secondary }}
                >
                  {heroData.ctaText || 'Découvrir'}{' '}
                  <ArrowRight className="inline w-5 h-5 ml-2" />
                </a>
              </div>
            </div>
            {!isMobile && (
              <div className="relative">
                <div
                  className="w-80 h-80 rounded-[3rem] rotate-6 shadow-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${primary}40, ${accent}40)`,
                    backdropFilter: 'blur(10px)',
                  }}
                />
                <div
                  className="absolute -bottom-8 -left-8 w-32 h-32 rounded-2xl -rotate-12 shadow-xl"
                  style={{ backgroundColor: accent }}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Services */}
      {isSectionVisible(sections, 'services') && servicesData.services.length > 0 && (
        <section
          id="services"
          data-section="services"
          className={`${isMobile ? 'py-16 px-6' : 'py-24 px-12'} bg-white`}
        >
          <div className="max-w-6xl mx-auto">
            <h2
              data-editable="title"
              className={`font-bold text-center mb-12 ${isMobile ? 'text-2xl' : 'text-4xl'}`}
              style={{ color: secondary }}
            >
              {servicesData.title || 'Nos créations'}
            </h2>
            <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {servicesData.services.slice(0, 4).map((service, idx) => (
                <div
                  key={idx}
                  className={`p-8 rounded-3xl border-2 hover:shadow-xl transition-all ${!isMobile && idx % 2 === 1 ? 'mt-12' : ''}`}
                  style={{ borderColor: `${primary}20` }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${accent}20` }}
                  >
                    <Star className="w-6 h-6" style={{ color: accent }} />
                  </div>
                  <h3 data-editable="title" className="font-bold text-xl mb-2" style={{ color: secondary }}>
                    {service.name}
                  </h3>
                  <p data-editable="description" className="text-gray-600">{service.shortDescription}</p>
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
          className={`${isMobile ? 'py-16 px-6' : 'py-24 px-12'} relative overflow-hidden`}
          style={{ backgroundColor: secondary }}
        >
          <div
            className="absolute -right-32 top-0 w-96 h-full opacity-20"
            style={{ background: `linear-gradient(180deg, ${primary}, ${accent})` }}
          />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className={isMobile ? '' : 'flex items-center gap-16'}>
              <div className={isMobile ? 'mb-8' : 'flex-1'}>
                <span
                  className="inline-block px-4 py-1 rounded-full text-sm font-medium mb-4"
                  style={{ backgroundColor: `${accent}30`, color: accent }}
                >
                  Notre histoire
                </span>
                <h2
                  data-editable="title"
                  className={`font-bold text-white mb-6 ${isMobile ? 'text-2xl' : 'text-4xl'}`}
                >
                  {aboutData.title || 'À propos'}
                </h2>
                <div data-editable="content" className="text-white/80 text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: aboutData.body }} />
                {aboutData.stats && aboutData.stats.length > 0 && (
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    {aboutData.stats.map((stat, idx) => (
                      <div
                        key={idx}
                        className="text-center p-6 rounded-2xl"
                        style={{ backgroundColor: `${primary}20` }}
                      >
                        <div className="text-4xl font-bold mb-1" style={{ color: accent }}>
                          {stat.value}
                        </div>
                        <div className="text-white/60 text-sm">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Image column */}
              {!isMobile && (
                <div className="flex items-center justify-center flex-1">
                  {aboutData.imageMediaId ? (
                    <div
                      className="p-1 rounded-3xl"
                      style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                    >
                      <img
                        src={typeof aboutData.imageMediaId === 'string' && aboutData.imageMediaId.startsWith('http') ? aboutData.imageMediaId : `/api/media/${aboutData.imageMediaId}/file`}
                        alt={aboutData.title || 'À propos'}
                        className="rounded-3xl w-full max-h-[400px] object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      data-editable="imageMediaId"
                      className="image-placeholder w-full h-64 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ borderColor: `${accent}60`, backgroundColor: `${primary}15` }}
                    >
                      <svg className="w-10 h-10" style={{ color: `${accent}80` }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                      <span className="text-xs" style={{ color: `${accent}80` }}>Ajouter une image</span>
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
          className={`${isMobile ? 'py-16 px-6' : 'py-24 px-12'} bg-gray-50`}
        >
          <div className="max-w-3xl mx-auto text-center">
            <MessageSquareQuote
              className="w-16 h-16 mx-auto mb-6 opacity-20"
              style={{ color: primary }}
            />
            {testimonialsData.items.slice(0, 1).map((testimonial, idx) => (
              <div key={idx}>
                <p data-editable="quote" className="text-2xl font-light italic mb-6" style={{ color: secondary }}>
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: primary }}
                  >
                    {testimonial.author?.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div data-editable="author" className="font-semibold" style={{ color: secondary }}>
                      {testimonial.author}
                    </div>
                    <div data-editable="role" className="text-gray-500 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Google Reviews */}
      {isSectionVisible(sections, 'google-reviews') && googleReviewsData.testimonials.length > 0 && (
        <section
          id="google-reviews"
          data-section="google-reviews"
          className={`${isMobile ? 'py-16 px-6' : 'py-24 px-12'} bg-white`}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
                style={{ backgroundColor: `${accent}20`, color: accent }}
              >
                <BadgeCheck className="w-4 h-4" />
                Avis vérifiés
              </span>
              <h2
                data-editable="title"
                className={`font-bold ${isMobile ? 'text-2xl' : 'text-4xl'}`}
                style={{ color: secondary }}
              >
                {googleReviewsData.title || 'Avis Google'}
              </h2>
              {googleReviewsData.averageRating && (
                <div className="mt-4 flex items-center justify-center gap-3">
                  <span
                    className="text-5xl font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${primary}, ${accent})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {googleReviewsData.averageRating}
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="w-5 h-5"
                        style={{
                          fill: star <= Math.round(googleReviewsData.averageRating) ? accent : 'transparent',
                          color: star <= Math.round(googleReviewsData.averageRating) ? accent : '#d1d5db',
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
              {googleReviewsData.testimonials.slice(0, 6).map((review, idx) => (
                <div
                  key={idx}
                  className="relative p-[2px] rounded-2xl overflow-hidden group hover:scale-[1.02] transition-transform"
                  style={{ background: `linear-gradient(135deg, ${primary}60, ${accent}60)` }}
                >
                  <div className="bg-white p-6 rounded-2xl h-full">
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-4 h-4"
                          style={{
                            fill: star <= (review.rating || 5) ? accent : 'transparent',
                            color: star <= (review.rating || 5) ? accent : '#d1d5db',
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      "{review.quote || review.text}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                      >
                        {(review.author || review.name || '?').charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: secondary }}>
                          {review.author || review.name}
                        </div>
                        {review.date && (
                          <div className="text-gray-400 text-xs">{review.date}</div>
                        )}
                      </div>
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
          className={`${isMobile ? 'py-16 px-6' : 'py-24 px-12'} bg-gray-50 relative overflow-hidden`}
        >
          {/* Decorative blob */}
          <div
            className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
            style={{ backgroundColor: primary }}
          />
          <div
            className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-10 blur-2xl pointer-events-none"
            style={{ backgroundColor: accent }}
          />

          <div className="max-w-3xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <span
                className="inline-block px-4 py-1 rounded-full text-sm font-medium mb-4"
                style={{ backgroundColor: `${primary}15`, color: primary }}
              >
                Questions fréquentes
              </span>
              <h2
                data-editable="title"
                className={`font-bold ${isMobile ? 'text-2xl' : 'text-4xl'}`}
                style={{ color: secondary }}
              >
                {faqData.title || 'FAQ'}
              </h2>
            </div>
            <div className="space-y-4">
              {faqData.items.map((item, idx) => (
                <div
                  key={idx}
                  className="relative p-[2px] rounded-2xl overflow-hidden"
                  style={{
                    background: openFaqIndex === idx
                      ? `linear-gradient(135deg, ${primary}, ${accent})`
                      : `linear-gradient(135deg, ${primary}30, ${accent}30)`,
                  }}
                >
                  <div className="bg-white rounded-2xl">
                    <button
                      className="w-full flex items-center justify-between p-6 text-left group"
                      onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    >
                      <span
                        className="font-semibold text-lg pr-4"
                        style={{
                          background: `linear-gradient(135deg, ${primary}, ${accent})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${openFaqIndex === idx ? 'rotate-180' : ''}`}
                        style={{ color: primary }}
                      />
                    </button>
                    <div
                      className="overflow-hidden transition-all duration-300"
                      style={{
                        maxHeight: openFaqIndex === idx ? '500px' : '0',
                        opacity: openFaqIndex === idx ? 1 : 0,
                      }}
                    >
                      <p className="px-6 pb-6 text-gray-600 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
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
          className={`${isMobile ? 'py-16 px-6' : 'py-24 px-12'} bg-white`}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span
                className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-medium mb-4"
                style={{ backgroundColor: `${primary}15`, color: primary }}
              >
                <Users className="w-4 h-4" />
                Notre équipe
              </span>
              <h2
                data-editable="title"
                className={`font-bold ${isMobile ? 'text-2xl' : 'text-4xl'}`}
                style={{ color: secondary }}
              >
                {teamData.title || 'L\'équipe'}
              </h2>
            </div>
            <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
              {teamData.members.map((member, idx) => (
                <div
                  key={idx}
                  className="group text-center p-8 rounded-3xl border-2 hover:shadow-xl hover:scale-[1.02] hover:-rotate-1 transition-all duration-300"
                  style={{ borderColor: `${primary}15` }}
                >
                  <div
                    className="w-24 h-24 mx-auto rounded-2xl rotate-3 group-hover:rotate-6 transition-transform duration-300 flex items-center justify-center text-white text-3xl font-bold mb-6 shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                  >
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      (member.name || '?').charAt(0)
                    )}
                  </div>
                  <h3
                    data-editable="name"
                    className="font-bold text-xl mb-1"
                    style={{
                      background: `linear-gradient(135deg, ${primary}, ${accent})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {member.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-3">{member.role}</p>
                  {member.bio && (
                    <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
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
          className={`relative ${isMobile ? 'py-16 px-6' : 'py-24 px-12'} overflow-hidden`}
          style={{
            background: `linear-gradient(160deg, ${secondary} 0%, ${primary}90 60%, ${accent}70 100%)`,
          }}
        >
          {/* Decorative shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute w-72 h-72 rounded-full opacity-10 blur-3xl"
              style={{ backgroundColor: accent, top: '-10%', right: '5%' }}
            />
            <div
              className="absolute w-40 h-40 rounded-3xl rotate-45 opacity-20"
              style={{ backgroundColor: primary, bottom: '10%', left: '10%' }}
            />
            <div
              className="absolute w-24 h-24 rounded-2xl -rotate-12 opacity-15"
              style={{ backgroundColor: accent, top: '20%', left: '5%' }}
            />
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="mb-8 flex justify-center">
              {heroPractitionerData.photoMediaId ? (
                <div
                  className="p-1.5 rounded-full rotate-3"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                >
                  <img
                    src={`/api/media/${heroPractitionerData.photoMediaId}/file`}
                    alt={heroPractitionerData.name || 'Praticien'}
                    className="w-36 h-36 rounded-full object-cover border-4 border-white/20 shadow-2xl"
                  />
                </div>
              ) : (
                <div
                  data-editable="photoMediaId"
                  className="photo-editor w-36 h-36 rounded-full rotate-3 border-2 border-dashed border-white/40 shadow-2xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-white/60 transition-colors"
                  style={{ background: `linear-gradient(135deg, ${primary}30, ${accent}30)` }}
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
              className={`font-bold text-white ${isMobile ? 'text-3xl' : 'text-5xl lg:text-6xl'} mb-4 leading-tight`}
            >
              {heroPractitionerData.name || 'Votre praticien'}
            </h1>
            {heroPractitionerData.specialty && (
              <p
                className={`font-semibold mb-4 ${isMobile ? 'text-lg' : 'text-2xl'}`}
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
              <p className={`text-white/70 max-w-2xl mx-auto mb-10 ${isMobile ? 'text-base' : 'text-lg'}`}>
                {heroPractitionerData.tagline}
              </p>
            )}
            {heroPractitionerData.ctaText && (
              <a
                href={heroPractitionerData.ctaUrl || '#booking'}
                className={`inline-block px-8 py-4 rounded-full font-semibold shadow-2xl hover:scale-105 transition-all no-underline ${isMobile ? 'text-base' : 'text-lg'}`}
                style={{ backgroundColor: accent, color: secondary }}
              >
                {heroPractitionerData.ctaText} <ArrowRight className="inline w-5 h-5 ml-2" />
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
          className={`${isMobile ? 'py-16 px-6' : 'py-24 px-12'} bg-white relative overflow-hidden`}
        >
          {/* Decorative blobs */}
          <div
            className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none"
            style={{ backgroundColor: primary }}
          />
          <div
            className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-10 blur-2xl pointer-events-none"
            style={{ backgroundColor: accent }}
          />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
                style={{ backgroundColor: `${primary}15`, color: primary }}
              >
                <Sparkles className="w-4 h-4" />
                Prestations
              </span>
              <h2
                data-editable="title"
                className={`font-bold ${isMobile ? 'text-2xl' : 'text-4xl'}`}
                style={{ color: secondary }}
              >
                {servicesBookingData.title || 'Nos prestations'}
              </h2>
              {servicesBookingData.subtitle && (
                <p className="text-gray-500 mt-3 max-w-xl mx-auto">{servicesBookingData.subtitle}</p>
              )}
            </div>
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {bookingServices.map((svc, idx) => (
                <div
                  key={idx}
                  className={`relative p-[2px] rounded-3xl overflow-hidden group hover:scale-[1.02] transition-all duration-300 ${!isMobile && idx % 2 === 1 ? 'mt-6' : ''}`}
                  style={{ background: `linear-gradient(135deg, ${primary}50, ${accent}50)` }}
                >
                  <div className="bg-white p-6 rounded-3xl h-full flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg mb-1" style={{ color: secondary }}>
                        {svc.name}
                      </h3>
                      {svc.description && (
                        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{svc.description}</p>
                      )}
                      <div className="flex items-center gap-4">
                        {svc.duration && (
                          <span className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Clock className="w-3.5 h-3.5" /> {svc.duration}
                          </span>
                        )}
                        {svc.price && (
                          <span
                            className="text-sm font-bold"
                            style={{
                              background: `linear-gradient(135deg, ${primary}, ${accent})`,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}
                          >
                            {svc.price}
                          </span>
                        )}
                      </div>
                    </div>
                    <a
                      href="#booking"
                      className="inline-block px-5 py-2.5 rounded-full text-sm font-semibold text-white flex-shrink-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all no-underline"
                      style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                    >
                      Réserver
                    </a>
                  </div>
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
          className={`${isMobile ? 'py-16 px-6' : 'py-24 px-12'} relative overflow-hidden`}
          style={{
            background: `linear-gradient(160deg, ${primary}18 0%, ${accent}18 50%, ${primary}10 100%)`,
          }}
        >
          {/* Decorative vibrant blobs */}
          <div
            className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-30 blur-3xl pointer-events-none"
            style={{ backgroundColor: primary }}
          />
          <div
            className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] rounded-full opacity-30 blur-3xl pointer-events-none"
            style={{ backgroundColor: accent }}
          />
          <div
            className="absolute w-40 h-40 rounded-3xl rotate-45 opacity-20 pointer-events-none"
            style={{ backgroundColor: accent, top: '15%', right: '8%' }}
          />
          <div
            className="absolute w-24 h-24 rounded-2xl -rotate-12 opacity-20 pointer-events-none"
            style={{ backgroundColor: primary, bottom: '18%', left: '10%' }}
          />

          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center mb-10">
              <div
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mb-5 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${primary}, ${accent})`,
                  color: '#fff',
                }}
              >
                <Calendar className="w-4 h-4" />
                Réservation en ligne
              </div>
              <h2
                data-editable="title"
                className={`font-bold mb-4 ${isMobile ? 'text-3xl' : 'text-5xl'}`}
                style={{
                  background: `linear-gradient(135deg, ${primary}, ${accent})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {bookingWidgetData.title || 'Prenez rendez-vous'}
              </h2>
              <p className={`text-gray-600 max-w-xl mx-auto ${isMobile ? 'text-sm' : 'text-base'}`}>
                Choisissez votre prestation et le créneau qui vous convient. Confirmation instantanée.
              </p>
            </div>
            {bookingWidgetData.calendarSlug ? (
              <div
                className="relative p-[3px] rounded-[2rem] overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${primary}, ${accent})`,
                  boxShadow: `0 30px 80px -20px ${primary}50, 0 20px 40px -15px ${accent}40`,
                }}
              >
                <div className="bg-white rounded-[1.85rem] overflow-hidden">
                  <iframe
                    src={`https://calendar.swigs.online/book/${bookingWidgetData.calendarSlug}?embed=1&primary=${encodeURIComponent(primary)}`}
                    title="Réservation en ligne"
                    className="w-full border-0 block"
                    style={{ height: isMobile ? '600px' : '720px', backgroundColor: 'transparent' }}
                    allow="payment"
                    loading="lazy"
                  />
                </div>
              </div>
            ) : (
              <div
                className="rounded-[2rem] border-2 border-dashed flex items-center justify-center bg-white/60 backdrop-blur-sm"
                style={{ borderColor: `${primary}40`, height: '300px' }}
              >
                <div className="text-center">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" style={{ color: primary }} />
                  <p className="text-gray-500">
                    Widget de réservation<br />
                    <span className="text-sm">Configurez le slug Calendar dans l'éditeur</span>
                  </p>
                </div>
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
          className={`${isMobile ? 'py-16 px-6' : 'py-24 px-12'} relative overflow-hidden`}
          style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute w-64 h-64 rounded-full opacity-20 blur-3xl bg-white top-0 left-1/4" />
          </div>
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2
              data-editable="headline"
              className={`font-bold text-white mb-4 ${isMobile ? 'text-2xl' : 'text-4xl'}`}
            >
              {ctaData.headline || 'Prêt à créer ensemble ?'}
            </h2>
            <p data-editable="subtext" className="text-white/80 mb-8 text-lg">
              {ctaData.subtext || 'Transformons vos idées en réalité'}
            </p>
            <button
              className="px-8 py-4 rounded-full font-semibold shadow-2xl hover:scale-105 transition-transform"
              style={{ backgroundColor: 'white', color: primary }}
            >
              {ctaData.buttonText || 'Démarrer un projet'} <Rocket className="inline w-5 h-5 ml-2" />
            </button>
          </div>
        </section>
      )}

      {/* Contact / Footer */}
      <footer
        id="contact"
        data-section="contact"
        className={isMobile ? 'py-12 px-6' : 'py-16 px-12'}
        style={{ backgroundColor: secondary }}
      >
        <div className="max-w-6xl mx-auto">
          <div className={isMobile ? 'space-y-8' : 'flex justify-between items-start'}>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold rotate-3"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                >
                  {siteName?.charAt(0)}
                </div>
                <span className="text-white font-semibold text-lg">{siteName}</span>
              </div>
              <p className="text-white/50 max-w-xs">{tagline}</p>
            </div>
            <div className="space-y-3">
              {contactData.email && (
                <div className="flex items-center gap-3 text-white/70">
                  <Mail className="w-5 h-5" style={{ color: accent }} />
                  <span data-editable="email">{contactData.email}</span>
                </div>
              )}
              {contactData.phone && (
                <div className="flex items-center gap-3 text-white/70">
                  <Phone className="w-5 h-5" style={{ color: accent }} />
                  <span data-editable="phone">{contactData.phone}</span>
                </div>
              )}
              {contactData.address && (
                <div className="flex items-center gap-3 text-white/70">
                  <MapPin className="w-5 h-5" style={{ color: accent }} />
                  <span data-editable="address">{contactData.address}</span>
                </div>
              )}
            </div>
          </div>
          {/* Map iframe — show business listing directly */}
          {(contactData.address || siteName) && (
            <div className="mt-8 rounded-2xl overflow-hidden border border-white/10">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent([siteName, site.city || contactData.address || ''].filter(Boolean).join(' '))}&output=embed`}
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localisation"
              />
            </div>
          )}
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
            © {new Date().getFullYear()} {siteName}. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ArtisticTemplate;
