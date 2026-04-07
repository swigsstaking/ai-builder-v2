import React, { useState } from 'react';
import {
  Zap,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Star,
  Mail,
  Phone,
  MapPin,
  Play,
  Trophy,
} from 'lucide-react';
import { getSectionData, isSectionVisible, getVisibleSections, getStarRating } from '../sectionHelpers';

/**
 * BoldTemplate - Bold / aggressive style with dark backgrounds, sharp edges, uppercase text.
 * Adapted to the universal 9-block section schema.
 */
const BoldTemplate = ({ sections = [], site = {}, isMobile = false, onNavigate = null }) => {
  const [openFaq, setOpenFaq] = useState(null);

  const siteName = site.name || site.siteName || 'Company';
  const tagline = site.tagline || '';
  const colors = site.colors || { primary: '#ef4444', secondary: '#0f172a', accent: '#fbbf24' };
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

  const showHero = isSectionVisible(sections, 'hero');
  const showServices = isSectionVisible(sections, 'services');
  const showAbout = isSectionVisible(sections, 'about');
  const showTestimonials = isSectionVisible(sections, 'testimonials');
  const showFaq = isSectionVisible(sections, 'faq');
  const showGoogleReviews = isSectionVisible(sections, 'google-reviews');
  const showContact = isSectionVisible(sections, 'contact');
  const showCta = isSectionVisible(sections, 'cta');
  const showTeam = isSectionVisible(sections, 'team');

  const services = servicesData.services || [];
  const testimonialItems = testimonialsData.items || [];
  const faqItems = faqData.items || [];
  const googleTestimonials = googleReviewsData.testimonials || [];
  const teamMembers = teamData.members || [];

  const handleNavigate = (target) => {
    if (onNavigate) {
      onNavigate(target);
    } else {
      const el = document.getElementById(target);
      el && el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Section renderers keyed by type
  const sectionRenderers = {
    hero: () =>
      showHero && (
        <section
          key="hero"
          id="hero"
          data-section="hero"
          className={`min-h-screen flex items-center justify-center relative ${isMobile ? 'px-6 pt-20' : 'px-12'}`}
        >
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, ${primary} 0, ${primary} 1px, transparent 0, transparent 50%)`,
              backgroundSize: '20px 20px',
            }}
          />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-48"
            style={{ backgroundColor: primary }}
          />
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 border"
              style={{ borderColor: `${primary}50`, color: primary }}
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-widest">{siteName}</span>
            </div>
            <h1
              data-editable="headline"
              className={`font-black text-white leading-none mb-8 ${isMobile ? 'text-4xl' : 'text-6xl lg:text-8xl'}`}
              style={{ letterSpacing: '-0.02em' }}
            >
              {heroData.headline || siteName}
            </h1>
            <p
              data-editable="subheadline"
              className={`text-white/60 mb-12 max-w-2xl mx-auto ${isMobile ? 'text-lg' : 'text-xl'}`}
            >
              {heroData.subheadline || tagline}
            </p>
            <div className={`flex gap-4 justify-center ${isMobile ? 'flex-col' : ''}`}>
              <button
                className="px-10 py-5 font-bold uppercase tracking-wider text-white flex items-center justify-center gap-3 hover:scale-105 transition-transform"
                style={{ backgroundColor: primary }}
              >
                {heroData.ctaText || 'Commencer'}{' '}
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-10 py-5 font-bold uppercase tracking-wider text-white border-2 border-white/20 flex items-center justify-center gap-3 hover:bg-white/5 transition-colors">
                <Play className="w-5 h-5" /> Voir la démo
              </button>
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
          </div>
        </section>
      ),

    services: () =>
      showServices && services.length > 0 && (
        <section
          key="services"
          id="services"
          data-section="services"
          className={`${isMobile ? 'py-20 px-6' : 'py-32 px-12'}`}
          style={{ backgroundColor: secondary }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-16">
              <div className="w-16 h-1" style={{ backgroundColor: primary }} />
              <h2 className={`font-black text-white ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
                NOS SERVICES
              </h2>
            </div>
            <div className="space-y-4">
              {services.slice(0, 4).map((service, idx) => (
                <div
                  key={idx}
                  className="group p-8 border border-white/10 hover:border-white/30 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-8">
                    <span className="text-white/20 font-black text-2xl">0{idx + 1}</span>
                    <div>
                      <h3
                        data-editable="name"
                        className="font-bold text-xl text-white mb-1 group-hover:text-primary transition-colors"
                        style={{ '--tw-text-opacity': 1 }}
                      >
                        {service.name}
                      </h3>
                      <p className="text-white/50">{service.shortDescription}</p>
                      {service.price && (
                        <span className="text-sm font-bold mt-1 inline-block" style={{ color: accent }}>
                          {service.price}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-white/30 group-hover:text-white group-hover:translate-x-2 transition-all" />
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
          className={`${isMobile ? 'py-20 px-6' : 'py-32 px-12'}`}
          style={{ backgroundColor: 'white' }}
        >
          <div className="max-w-6xl mx-auto">
            <div className={isMobile ? '' : 'grid grid-cols-2 gap-16 items-center'}>
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-1" style={{ backgroundColor: primary }} />
                  <span
                    className="text-sm font-bold uppercase tracking-widest"
                    style={{ color: primary }}
                  >
                    À propos
                  </span>
                </div>
                <h2
                  data-editable="title"
                  className={`font-black mb-6 ${isMobile ? 'text-3xl' : 'text-4xl'}`}
                  style={{ color: secondary }}
                >
                  {aboutData.title || 'QUI SOMMES-NOUS'}
                </h2>
                <p data-editable="body" className="text-gray-600 text-lg leading-relaxed">
                  {aboutData.body}
                </p>
                {aboutData.bulletPoints && aboutData.bulletPoints.length > 0 && (
                  <ul className="mt-6 space-y-3">
                    {aboutData.bulletPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-1 h-6 flex-shrink-0 mt-0.5" style={{ backgroundColor: primary }} />
                        <span className="text-gray-600 font-medium">{typeof point === 'string' ? point : point.text}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {aboutData.ctaText && (
                  <button
                    className="mt-8 px-8 py-4 font-bold uppercase tracking-wider text-white hover:scale-105 transition-transform"
                    style={{ backgroundColor: primary }}
                  >
                    {aboutData.ctaText}
                  </button>
                )}
              </div>
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
          className={`${isMobile ? 'py-20 px-6' : 'py-32 px-12'}`}
          style={{ backgroundColor: secondary }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center gap-1 mb-8">
              {[...Array(5)].map((_, idx) => (
                <Star key={idx} className="w-6 h-6 fill-current" style={{ color: accent }} />
              ))}
            </div>
            {testimonialItems.map((item, idx) => (
              <div key={idx} className={idx > 0 ? 'mt-16 pt-16 border-t border-white/10' : ''}>
                <p
                  data-editable="quote"
                  className={`text-white font-light leading-relaxed mb-8 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                >
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div>
                  <div className="text-white font-bold text-lg">{item.author}</div>
                  <div className="text-white/50">{item.role}</div>
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
          className={`${isMobile ? 'py-20 px-6' : 'py-32 px-12'}`}
          style={{ backgroundColor: secondary }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2
                data-editable="title"
                className={`font-black text-white ${isMobile ? 'text-3xl' : 'text-5xl'}`}
              >
                {googleReviewsData.title || 'AVIS GOOGLE'}
              </h2>
              {googleReviewsData.rating && (
                <div className="flex items-center justify-center gap-6 mt-8">
                  <span
                    className="font-black leading-none"
                    style={{ fontSize: '5rem', color: accent }}
                  >
                    {googleReviewsData.rating}
                  </span>
                  <div className="text-left">
                    <div className="flex gap-1 mb-2">
                      {getStarRating(googleReviewsData.rating).map((state, idx) => (
                        <Star
                          key={idx}
                          className={`w-8 h-8 ${state === 'full' ? 'fill-current' : state === 'half' ? 'fill-current opacity-50' : 'opacity-20'}`}
                          style={{ color: accent }}
                        />
                      ))}
                    </div>
                    {googleReviewsData.reviewCount && (
                      <span className="text-white/50 text-sm uppercase tracking-widest">
                        {googleReviewsData.reviewCount} avis
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            {googleTestimonials.length > 0 && (
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {googleTestimonials.map((review, idx) => (
                  <div
                    key={idx}
                    className="p-8 border border-white/10"
                    style={{ backgroundColor: `${secondary}` }}
                  >
                    <div className="flex gap-1 mb-4">
                      {getStarRating(review.rating || 5).map((state, sIdx) => (
                        <Star
                          key={sIdx}
                          className={`w-5 h-5 ${state === 'full' ? 'fill-current' : 'opacity-20'}`}
                          style={{ color: accent }}
                        />
                      ))}
                    </div>
                    <p className="text-white/70 leading-relaxed mb-6">
                      &ldquo;{review.quote || review.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 flex items-center justify-center font-black text-lg"
                        style={{ color: primary }}
                      >
                        {review.author?.charAt(0)}
                      </div>
                      <span className="text-white font-bold uppercase tracking-wider text-sm">
                        {review.author}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {googleReviewsData.ctaText && (
              <div className="text-center mt-12">
                <a
                  href={googleReviewsData.ctaUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-10 py-5 font-bold uppercase tracking-wider text-white hover:scale-105 transition-transform"
                  style={{ backgroundColor: primary }}
                >
                  {googleReviewsData.ctaText}
                  <ArrowRight className="w-5 h-5" />
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
          className={`${isMobile ? 'py-20 px-6' : 'py-32 px-12'}`}
          style={{ backgroundColor: 'white' }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-16">
              <div className="w-16 h-1" style={{ backgroundColor: primary }} />
              <h2
                className={`font-black ${isMobile ? 'text-3xl' : 'text-5xl'}`}
                style={{ color: secondary }}
              >
                FAQ
              </h2>
            </div>
            <div className="space-y-0">
              {faqItems.map((item, idx) => (
                <div
                  key={idx}
                  className="border-b border-gray-200"
                >
                  <button
                    className="w-full flex items-center justify-between py-6 text-left"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  >
                    <span
                      className="font-bold uppercase tracking-wide"
                      style={{ color: secondary }}
                    >
                      {item.question}
                    </span>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-1 h-6"
                        style={{ backgroundColor: openFaq === idx ? primary : 'transparent' }}
                      />
                      <ChevronDown
                        className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${openFaq === idx ? 'rotate-180' : ''}`}
                        style={{ color: primary }}
                      />
                    </div>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${openFaq === idx ? 'max-h-96' : 'max-h-0'}`}
                  >
                    <div className="pb-6 flex">
                      <div className="w-1 flex-shrink-0 mr-6" style={{ backgroundColor: primary }} />
                      <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                    </div>
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
          className={`${isMobile ? 'py-20 px-6' : 'py-32 px-12'}`}
          style={{ backgroundColor: secondary }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-16">
              <div className="w-16 h-1" style={{ backgroundColor: primary }} />
              <h2 className={`font-black text-white ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
                NOTRE ÉQUIPE
              </h2>
            </div>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
              {teamMembers.map((member, idx) => (
                <div
                  key={idx}
                  className="p-8 border border-white/10 hover:border-white/30 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-1 h-12 flex-shrink-0"
                      style={{ backgroundColor: primary }}
                    />
                    <div>
                      <h3
                        data-editable="name"
                        className="font-black text-white uppercase tracking-wide"
                      >
                        {member.name}
                      </h3>
                      <p className="text-sm uppercase tracking-widest" style={{ color: primary }}>
                        {member.role}
                      </p>
                    </div>
                  </div>
                  {member.bio && (
                    <p className="text-white/50 leading-relaxed text-sm">{member.bio}</p>
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
          className={`${isMobile ? 'py-20 px-6' : 'py-32 px-12'} relative`}
          style={{ backgroundColor: primary }}
        >
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2
              data-editable="headline"
              className={`font-black text-white mb-6 ${isMobile ? 'text-3xl' : 'text-5xl lg:text-6xl'}`}
            >
              {ctaData.headline || 'PRÊT À DOMINER ?'}
            </h2>
            <p data-editable="body" className="text-white/80 mb-10 text-xl">
              {ctaData.body || 'Rejoignez les leaders de demain'}
            </p>
            <button
              className="px-12 py-6 font-bold uppercase tracking-wider text-lg hover:scale-105 transition-transform"
              style={{ backgroundColor: secondary, color: 'white' }}
            >
              {ctaData.ctaText || 'Démarrer maintenant'} <Trophy className="inline w-5 h-5 ml-2" />
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
          className={`${isMobile ? 'py-20 px-6' : 'py-32 px-12'}`}
          style={{ backgroundColor: secondary }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-16">
              <div className="w-16 h-1" style={{ backgroundColor: primary }} />
              <h2
                data-editable="title"
                className={`font-black text-white ${isMobile ? 'text-3xl' : 'text-5xl'}`}
              >
                {contactData.title || 'CONTACT'}
              </h2>
            </div>
            {contactData.body && (
              <p data-editable="body" className="text-white/50 mb-12 text-lg">
                {contactData.body}
              </p>
            )}
            <div className="space-y-6">
              {contactData.email && (
                <div className="flex items-center gap-6 p-6 border border-white/10">
                  <Mail className="w-6 h-6" style={{ color: primary }} />
                  <span className="text-white text-lg">{contactData.email}</span>
                </div>
              )}
              {contactData.phone && (
                <div className="flex items-center gap-6 p-6 border border-white/10">
                  <Phone className="w-6 h-6" style={{ color: primary }} />
                  <span className="text-white text-lg">{contactData.phone}</span>
                </div>
              )}
              {contactData.address && (
                <div className="flex items-center gap-6 p-6 border border-white/10">
                  <MapPin className="w-6 h-6" style={{ color: primary }} />
                  <span className="text-white text-lg">{contactData.address}</span>
                </div>
              )}
            </div>
            {contactData.hours && (
              <p className="text-white/30 text-sm uppercase tracking-widest mt-8">{contactData.hours}</p>
            )}
            {contactData.embedUrl && (
              <div className="mt-8 border border-white/10 overflow-hidden">
                <iframe
                  src={contactData.embedUrl}
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  title="Carte"
                />
              </div>
            )}
          </div>
        </section>
      ),
  };

  // Default section order
  const defaultOrder = ['hero', 'services', 'about', 'testimonials', 'google-reviews', 'faq', 'team', 'cta', 'contact'];

  // Render sections in order from the sections array, falling back to default order
  const visibleSections = getVisibleSections(sections);
  const orderedTypes = visibleSections.length > 0
    ? visibleSections.map(s => s.type)
    : defaultOrder;

  return (
    <div
      className="w-full h-full overflow-y-auto relative"
      style={{ backgroundColor: secondary, fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Navbar */}
      <nav
        className="sticky top-0 z-50 px-6 py-4"
        style={{ backgroundColor: `${secondary}f0`, backdropFilter: 'blur(10px)' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 flex items-center justify-center font-black text-xl"
              style={{ color: primary }}
            >
              {siteName?.charAt(0)}
            </div>
            <span className="text-white font-bold text-lg tracking-tight">{siteName}</span>
          </div>
          {!isMobile && (
            <div className="flex items-center gap-8">
              <span
                onClick={() => handleNavigate('hero')}
                className="text-white/60 text-sm font-medium hover:text-white cursor-pointer transition-colors uppercase tracking-wider"
              >
                Accueil
              </span>
              {showServices && services.length > 0 && (
                <span
                  onClick={() => handleNavigate('services')}
                  className="text-white/60 text-sm font-medium hover:text-white cursor-pointer transition-colors uppercase tracking-wider"
                >
                  Services
                </span>
              )}
              {showAbout && aboutData.body && (
                <span
                  onClick={() => handleNavigate('about')}
                  className="text-white/60 text-sm font-medium hover:text-white cursor-pointer transition-colors uppercase tracking-wider"
                >
                  À propos
                </span>
              )}
              <span
                onClick={() => handleNavigate('contact')}
                className="text-white/60 text-sm font-medium hover:text-white cursor-pointer transition-colors uppercase tracking-wider"
              >
                Contact
              </span>
              <button
                className="px-6 py-3 font-bold text-sm uppercase tracking-wider"
                style={{ backgroundColor: primary, color: 'white' }}
                onClick={() => handleNavigate('contact')}
              >
                Démarrer
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Render sections in order */}
      {orderedTypes.map(type => {
        const renderer = sectionRenderers[type];
        return renderer ? renderer() : null;
      })}

      {/* Footer */}
      <footer
        id="footer"
        data-section="footer"
        className={isMobile ? 'py-12 px-6' : 'py-16 px-12'}
        style={{ backgroundColor: secondary }}
      >
        <div className="max-w-6xl mx-auto">
          <div className={isMobile ? 'space-y-8' : 'flex justify-between items-start'}>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-black text-2xl" style={{ color: primary }}>
                  {siteName?.charAt(0)}
                </span>
                <span className="text-white font-bold text-xl">{siteName}</span>
              </div>
              <p className="text-white/40 max-w-xs">{tagline}</p>
            </div>
            <div className="space-y-3">
              {contactData.email && (
                <div className="flex items-center gap-3 text-white/60">
                  <Mail className="w-4 h-4" />
                  <span>{contactData.email}</span>
                </div>
              )}
              {contactData.phone && (
                <div className="flex items-center gap-3 text-white/60">
                  <Phone className="w-4 h-4" />
                  <span>{contactData.phone}</span>
                </div>
              )}
              {contactData.address && (
                <div className="flex items-center gap-3 text-white/60">
                  <MapPin className="w-4 h-4" />
                  <span>{contactData.address}</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-white/10 text-center text-white/30 text-sm uppercase tracking-widest">
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BoldTemplate;
