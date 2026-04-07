import React from 'react';
import { Zap, ArrowRight, Check } from 'lucide-react';

/**
 * ServicesPage - Service listing page with detailed cards including
 * feature bullets and CTA section.
 * Extracted from the original AI Builder v1 bundle (hS component).
 */
const ServicesPage = ({ content, pageContent, colors, siteName, designStyle, styleConfig, onNavigate }) => {
  const { primary, secondary } = colors;
  const config = styleConfig || { buttonStyle: 'rounded-lg' };
  const services = pageContent?.services || [];
  const title = pageContent?.title || 'Nos Services';
  const subtitle = pageContent?.subtitle || 'Ce que nous proposons';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-20 px-6" style={{ backgroundColor: secondary }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          <p className="text-xl text-white/70">{subtitle}</p>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          {services.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {services.map((service, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-2xl border border-gray-200 hover:border-primary/30 hover:shadow-xl transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${primary}15` }}
                    >
                      <Zap className="w-7 h-7" style={{ color: primary }} />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors"
                        style={{ color: secondary }}
                      >
                        {service.title}
                      </h3>
                      <p className="text-gray-500 mb-4">{service.description}</p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="w-4 h-4" style={{ color: primary }} />
                          Service personnalisé
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="w-4 h-4" style={{ color: primary }} />
                          Qualité garantie
                        </li>
                      </ul>
                      <button
                        className="flex items-center gap-2 font-medium transition-colors"
                        style={{ color: primary }}
                        onClick={() => onNavigate('contact')}
                      >
                        En savoir plus <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: `${primary}10` }}
              >
                <Zap className="w-12 h-12" style={{ color: primary }} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Services à venir</h3>
              <p className="text-gray-500">
                Notre catalogue de services sera bientôt disponible
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 px-6"
        style={{ backgroundColor: `${primary}08` }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: secondary }}>
            Besoin d'un service sur mesure ?
          </h2>
          <p className="text-gray-600 mb-8">
            Contactez-nous pour discuter de vos besoins spécifiques
          </p>
          <button
            className={`px-8 py-4 ${config.buttonStyle} font-semibold text-white transition-all hover:opacity-90`}
            style={{ backgroundColor: primary }}
            onClick={() => onNavigate('contact')}
          >
            Demander un devis
          </button>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
