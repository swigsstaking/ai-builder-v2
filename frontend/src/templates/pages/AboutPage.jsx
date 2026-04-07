import React from 'react';
import { Target, Eye, Users, MessageSquareQuote } from 'lucide-react';

/**
 * AboutPage - Company presentation page with mission/vision/values cards,
 * team section, and testimonials grid.
 * Extracted from the original AI Builder v1 bundle (fS component).
 */
const AboutPage = ({ content, pageContent, colors, siteName, designStyle, styleConfig }) => {
  const { primary, secondary } = colors;
  const title = pageContent?.title || 'À propos de nous';
  const subtitle = pageContent?.subtitle || '';
  const description = pageContent?.description || '';
  const team = pageContent?.team || [];
  const testimonials = pageContent?.testimonials || [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-20 px-6" style={{ backgroundColor: secondary }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          {subtitle && <p className="text-xl text-white/70">{subtitle}</p>}
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${primary}15` }}
              >
                <Target className="w-8 h-8" style={{ color: primary }} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: secondary }}>
                Notre Mission
              </h3>
              <p className="text-gray-500 text-sm">Offrir le meilleur à nos clients</p>
            </div>
            <div className="text-center p-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${primary}15` }}
              >
                <Eye className="w-8 h-8" style={{ color: primary }} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: secondary }}>
                Notre Vision
              </h3>
              <p className="text-gray-500 text-sm">Excellence et innovation</p>
            </div>
            <div className="text-center p-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${primary}15` }}
              >
                <Users className="w-8 h-8" style={{ color: primary }} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: secondary }}>
                Nos Valeurs
              </h3>
              <p className="text-gray-500 text-sm">Qualité, confiance, proximité</p>
            </div>
          </div>
          {description && (
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed text-lg">{description}</p>
            </div>
          )}
        </div>
      </section>

      {/* Team */}
      {team.length > 0 && (
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold" style={{ color: secondary }}>
                Notre Équipe
              </h2>
              <p className="text-gray-500 mt-2">Les personnes derrière {siteName}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 text-center shadow-sm">
                  <div
                    className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: `${primary}15` }}
                  >
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Users className="w-10 h-10" style={{ color: primary }} />
                    )}
                  </div>
                  <h3 className="font-semibold text-lg" style={{ color: secondary }}>
                    {member.name}
                  </h3>
                  <p className="text-gray-500">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold" style={{ color: secondary }}>
                Ce que disent nos clients
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((item, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-2xl"
                  style={{ backgroundColor: `${primary}08` }}
                >
                  <MessageSquareQuote className="w-10 h-10 mb-4" style={{ color: primary }} />
                  <p className="text-gray-700 text-lg mb-6 italic">"{item.quote}"</p>
                  <div>
                    <p className="font-semibold" style={{ color: secondary }}>
                      {item.author}
                    </p>
                    <p className="text-gray-500 text-sm">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default AboutPage;
