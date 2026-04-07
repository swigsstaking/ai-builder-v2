import React from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Diamond,
  Mail,
  Phone,
  MapPin,
  MessageSquareQuote,
  Star,
  Users,
} from 'lucide-react';
import { getSection, getSectionData, isSectionVisible, getStarRating } from '../sectionHelpers';

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
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-px h-8" style={{ backgroundColor: primary }} />
            <span
              className="text-xl tracking-[0.2em] uppercase"
              style={{ color: secondary, fontFamily: 'system-ui' }}
            >
              {siteName}
            </span>
          </div>
          {!isMobile && (
            <div className="flex items-center gap-10">
              <span
                onClick={() => handleNavigate('hero')}
                className="text-sm tracking-[0.15em] uppercase text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"
                style={{ fontFamily: 'system-ui' }}
              >
                Accueil
              </span>
              {isSectionVisible(sections, 'services') && servicesData.services.length > 0 && (
                <span
                  onClick={() => handleNavigate('services')}
                  className="text-sm tracking-[0.15em] uppercase text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"
                  style={{ fontFamily: 'system-ui' }}
                >
                  Services
                </span>
              )}
              {isSectionVisible(sections, 'about') && aboutData.body && (
                <span
                  onClick={() => handleNavigate('about')}
                  className="text-sm tracking-[0.15em] uppercase text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"
                  style={{ fontFamily: 'system-ui' }}
                >
                  Maison
                </span>
              )}
              <span
                onClick={() => handleNavigate('contact')}
                className="text-sm tracking-[0.15em] uppercase text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"
                style={{ fontFamily: 'system-ui' }}
              >
                Contact
              </span>
              <button
                className="px-6 py-2.5 text-sm tracking-[0.15em] uppercase border transition-colors hover:bg-gray-900 hover:text-white"
                style={{ borderColor: secondary, color: secondary, fontFamily: 'system-ui' }}
                onClick={() => handleNavigate('contact')}
              >
                Réserver
              </button>
            </div>
          )}
        </div>
      </nav>

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
            <button
              className="group px-10 py-4 border text-sm tracking-[0.2em] uppercase transition-all hover:bg-gray-900 hover:text-white hover:border-gray-900"
              style={{ borderColor: secondary, color: secondary, fontFamily: 'system-ui' }}
              data-editable="cta"
            >
              {heroData.ctaText || 'Découvrir'}
              <ArrowRight className="inline w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
            </button>
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
                <p
                  className="text-white/60 text-lg leading-relaxed"
                  style={{ fontFamily: 'system-ui' }}
                  data-editable="content"
                >
                  {aboutData.body}
                </p>
              </div>
              {aboutData.stats && aboutData.stats.length > 0 && (
                <div className={isMobile ? 'mt-12 grid grid-cols-2 gap-8' : 'flex flex-col gap-8'}>
                  {aboutData.stats.map((stat, idx) => (
                    <div key={idx} className={isMobile ? '' : 'text-right'}>
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
                    "{review.text || review.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-px" style={{ backgroundColor: primary }} />
                    <div>
                      <div
                        className="text-sm tracking-[0.1em] uppercase"
                        style={{ color: secondary, fontFamily: 'system-ui' }}
                      >
                        {review.author}
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
              className="px-12 py-4 text-sm tracking-[0.2em] uppercase text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: secondary, fontFamily: 'system-ui' }}
              data-editable="buttonText"
            >
              {ctaData.buttonText || 'Prendre rendez-vous'}
            </button>
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
