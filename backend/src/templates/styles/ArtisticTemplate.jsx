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
} from 'lucide-react';
import { getSection, getSectionData, isSectionVisible } from '../sectionHelpers';

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

  const [openFaqIndex, setOpenFaqIndex] = useState(null);

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
      style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
    >
      {/* Navbar */}
      <nav className="sticky top-0 z-50 p-4">
        <div
          className="backdrop-blur-lg rounded-2xl px-6 py-3 flex items-center justify-between shadow-lg"
          style={{ backgroundColor: `${secondary}ee` }}
        >
          <div
            className="flex items-center gap-3"
            onClick={() => handleNavigate('home')}
            style={{ cursor: 'pointer' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold rotate-3 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
            >
              {siteName?.charAt(0)}
            </div>
            <span className="text-white font-semibold">{siteName}</span>
          </div>
          {!isMobile && (
            <div className="flex items-center gap-6">
              <span
                onClick={() => handleNavigate('home')}
                className="text-white/70 text-sm hover:text-white cursor-pointer transition-colors"
              >
                Accueil
              </span>
              {isSectionVisible(sections, 'services') && servicesData.services.length > 0 && (
                <span
                  onClick={() => handleNavigate('services')}
                  className="text-white/70 text-sm hover:text-white cursor-pointer transition-colors"
                >
                  Services
                </span>
              )}
              {isSectionVisible(sections, 'about') && aboutData.body && (
                <span
                  onClick={() => handleNavigate('about')}
                  className="text-white/70 text-sm hover:text-white cursor-pointer transition-colors"
                >
                  À propos
                </span>
              )}
              <span
                onClick={() => handleNavigate('contact')}
                className="text-white/70 text-sm hover:text-white cursor-pointer transition-colors"
              >
                Contact
              </span>
              <button
                className="px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:scale-105 transition-transform"
                style={{ backgroundColor: accent, color: secondary }}
                onClick={() => handleNavigate('contact')}
              >
                Collaborer
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
                <button
                  className="px-8 py-4 rounded-full font-semibold shadow-2xl hover:scale-105 transition-all"
                  style={{ backgroundColor: accent, color: secondary }}
                >
                  {heroData.ctaText || 'Découvrir'}{' '}
                  <ArrowRight className="inline w-5 h-5 ml-2" />
                </button>
                <button className="px-8 py-4 rounded-full font-semibold border-2 border-white/30 text-white hover:bg-white/10 transition-colors">
                  Voir le portfolio
                </button>
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
              </div>
              {aboutData.stats && aboutData.stats.length > 0 && (
                <div className={isMobile ? 'grid grid-cols-2 gap-4' : 'flex flex-col gap-6'}>
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
                      "{review.text || review.quote}"
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
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
            © {new Date().getFullYear()} {siteName}. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ArtisticTemplate;
