import React from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

/**
 * ContactPage - Contact information + form page with coordinates,
 * opening hours, and a contact form.
 * Extracted from the original AI Builder v1 bundle (mS component).
 */
const ContactPage = ({ content, pageContent, colors, siteName, designStyle, styleConfig }) => {
  const { primary, secondary } = colors;
  const config = styleConfig || { buttonStyle: 'rounded-lg' };
  const title = pageContent?.title || 'Contactez-nous';
  const subtitle = pageContent?.subtitle || 'Nous sommes à votre écoute';
  const email = pageContent?.email || content?.contact?.email || '';
  const phone = pageContent?.phone || content?.contact?.phone || '';
  const address = pageContent?.address || content?.contact?.address || '';
  const openingHours = pageContent?.openingHours || '';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-20 px-6" style={{ backgroundColor: secondary }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          <p className="text-xl text-white/70">{subtitle}</p>
        </div>
      </section>

      {/* Contact info + form */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Coordinates */}
            <div>
              <h2 className="text-2xl font-bold mb-8" style={{ color: secondary }}>
                Nos coordonnées
              </h2>
              <div className="space-y-6">
                {email && (
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${primary}15` }}
                    >
                      <Mail className="w-6 h-6" style={{ color: primary }} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: secondary }}>
                        Email
                      </h3>
                      <a href={`mailto:${email}`} className="text-gray-600 hover:underline">
                        {email}
                      </a>
                    </div>
                  </div>
                )}
                {phone && (
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${primary}15` }}
                    >
                      <Phone className="w-6 h-6" style={{ color: primary }} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: secondary }}>
                        Téléphone
                      </h3>
                      <a href={`tel:${phone}`} className="text-gray-600 hover:underline">
                        {phone}
                      </a>
                    </div>
                  </div>
                )}
                {address && (
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${primary}15` }}
                    >
                      <MapPin className="w-6 h-6" style={{ color: primary }} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: secondary }}>
                        Adresse
                      </h3>
                      <p className="text-gray-600 whitespace-pre-line">{address}</p>
                    </div>
                  </div>
                )}
                {openingHours && (
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${primary}15` }}
                    >
                      <Clock className="w-6 h-6" style={{ color: primary }} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: secondary }}>
                        Horaires
                      </h3>
                      <p className="text-gray-600 whitespace-pre-line">{openingHours}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact form */}
            <div>
              <h2 className="text-2xl font-bold mb-8" style={{ color: secondary }}>
                Envoyez-nous un message
              </h2>
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent transition-all"
                      style={{ '--tw-ring-color': primary }}
                      placeholder="Jean"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent transition-all"
                      placeholder="Dupont"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent transition-all"
                    placeholder="jean.dupont@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent transition-all"
                    placeholder="Comment pouvons-nous vous aider ?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent transition-all resize-none"
                    placeholder="Votre message..."
                  />
                </div>
                <button
                  type="submit"
                  className={`w-full py-4 ${config.buttonStyle} font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90`}
                  style={{ backgroundColor: primary }}
                >
                  Envoyer <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      {address && (
        <section className="h-80 bg-gray-200 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Carte interactive</p>
          </div>
        </section>
      )}
    </div>
  );
};

export default ContactPage;
