import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Globe, Sparkles, Palette, Monitor, Search, Rocket,
  PenTool, Zap, Eye, ArrowRight, ChevronRight, Layers,
  Shield, Server, Headphones, Star, Check,
} from 'lucide-react';

const BG = '#0f0f1a';
const SURFACE = '#1a1a2e';
const CARD = '#1e1e35';
const BORDER = 'rgba(255,255,255,0.07)';
const GRADIENT = 'linear-gradient(135deg, #7c3aed, #3b82f6)';

export default function LandingPage() {
  const navigate = useNavigate();
  const [migrateUrl, setMigrateUrl] = useState('');

  const handleMigrate = () => {
    if (migrateUrl.trim()) {
      navigate(`/migrate?url=${encodeURIComponent(migrateUrl.trim())}`);
    } else {
      navigate('/migrate');
    }
  };

  return (
    <div className="min-h-screen blueprint-grid" style={{ background: BG, color: '#e2e8f0' }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: 'rgba(15,15,26,0.85)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: GRADIENT }}>
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">AI Builder</span>
          </Link>
          <nav className="flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-gray-300 hover:text-white transition-colors hidden md:block">Comment ça marche</a>
            <a href="#features" className="text-sm text-gray-300 hover:text-white transition-colors hidden md:block">Fonctionnalités</a>
            <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors">Connexion</Link>
            <Link
              to="/migrate"
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:brightness-110"
              style={{ background: GRADIENT }}
            >
              Commencer
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-[-100px] left-1/4 w-[500px] h-[500px] rounded-full opacity-25 blur-[120px]" style={{ background: '#7c3aed' }} />
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-20 blur-[120px]" style={{ background: '#3b82f6' }} />

        <div className="relative max-w-5xl mx-auto px-6 pt-28 pb-24 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
            Créez votre site web
            <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #60a5fa, #22d3ee)' }}>
              en quelques minutes
            </span>
          </h1>

          <p className="text-lg text-gray-300 max-w-lg mx-auto mb-14 leading-relaxed">
            Créez un site professionnel de zéro ou migrez un site existant.
            Notre IA analyse, génère et déploie pour vous.
          </p>

          {/* Two CTA cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            <button
              onClick={() => navigate('/login')}
              className="group relative p-6 rounded-2xl text-left transition-all duration-200 hover:brightness-110 hover:scale-[1.01]"
              style={{ background: CARD, border: `1px solid ${BORDER}` }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(124,58,237,0.2)' }}>
                <PenTool size={20} className="text-purple-300" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Créer de zéro</h3>
              <p className="text-sm text-gray-400 mb-4">Décrivez votre activité, l'IA génère un site complet</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-purple-300 group-hover:gap-2 transition-all">
                Commencer <ArrowRight size={14} />
              </span>
            </button>

            <div
              className="relative p-6 rounded-2xl text-left"
              style={{ background: CARD, border: `1px solid ${BORDER}` }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(59,130,246,0.2)' }}>
                <Globe size={20} className="text-blue-300" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Migrer un site existant</h3>
              <p className="text-sm text-gray-400 mb-4">Entrez l'URL, l'IA reprend contenu et design</p>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={migrateUrl}
                  onChange={e => setMigrateUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleMigrate()}
                  placeholder="https://www.monsite.ch"
                  className="flex-1 px-3 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/40"
                  style={{ background: BG, border: `1px solid rgba(255,255,255,0.12)` }}
                />
                <button
                  onClick={handleMigrate}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:brightness-110"
                  style={{ background: GRADIENT }}
                >
                  <Search size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-gray-400">
            <span className="flex items-center gap-2"><Zap size={14} className="text-purple-300" /> Prêt en 5 min</span>
            <span className="flex items-center gap-2"><Monitor size={14} className="text-blue-300" /> 100% responsive</span>
            <span className="flex items-center gap-2"><Search size={14} className="text-cyan-300" /> SEO optimisé</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24" style={{ background: SURFACE }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Comment ça marche ?</h2>
            <p className="text-gray-400 text-base">Trois étapes simples pour avoir votre site en ligne</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: Globe, title: 'Analysez', desc: 'Entrez l\'URL d\'un site existant ou décrivez votre activité. Notre IA analyse tout en quelques secondes.' },
              { step: '02', icon: Eye, title: 'Personnalisez', desc: 'Choisissez un style, modifiez le contenu et les sections dans l\'éditeur visuel en temps réel.' },
              { step: '03', icon: Rocket, title: 'Publiez', desc: 'Un clic et votre site est en ligne avec SSL, SEO et performance optimisés.' },
            ].map((item) => (
              <div key={item.step} className="relative p-6 rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <span className="text-5xl font-black" style={{ color: 'rgba(124,58,237,0.12)' }}>{item.step}</span>
                <div className="mt-2">
                  <item.icon size={22} className="text-purple-300 mb-3" />
                  <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24" style={{ background: BG }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Tout ce dont vous avez besoin</h2>
            <p className="text-gray-400 text-base">Des fonctionnalités professionnelles sans la complexité</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Sparkles, title: 'IA avancée', desc: 'Analyse visuelle et génération de contenu par intelligence artificielle.' },
              { icon: Palette, title: '5 styles de design', desc: 'Modern, Bold, Élégant, Minimal ou Artistique. Changez en un clic.' },
              { icon: Eye, title: 'Éditeur visuel', desc: 'Modifiez directement dans la preview. Cliquez, éditez, c\'est en ligne.' },
              { icon: Search, title: 'SEO automatique', desc: 'Titres, méta-descriptions, JSON-LD et sitemap générés automatiquement.' },
              { icon: Monitor, title: 'Responsive natif', desc: 'Desktop, tablette, mobile. Votre site s\'adapte à tous les écrans.' },
              { icon: Layers, title: 'Sections modulaires', desc: 'Hero, services, FAQ, témoignages, carte... Réorganisez librement.' },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-5 rounded-xl transition-all duration-200 hover:translate-y-[-2px] hover:brightness-110"
                style={{ background: CARD, border: `1px solid ${BORDER}` }}
              >
                <feature.icon size={20} className="text-purple-300 mb-3" />
                <h3 className="text-sm font-semibold text-white mb-1.5">{feature.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24" style={{ background: SURFACE }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">Tarifs simples et transparents</h2>
            <p className="text-gray-400 text-base">Choisissez l'offre adaptée à vos besoins</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Création', price: '299', desc: 'Idéal pour un site vitrine simple', features: ['5 pages max', 'Design responsive', 'SSL inclus', 'SEO de base', 'Support email'], popular: false },
              { name: 'Business', price: '499', desc: 'Pour les entreprises qui veulent plus', features: ['15 pages max', 'Design premium', 'SSL inclus', 'SEO avancé', 'Domaine personnalisé', 'Support prioritaire'], popular: true },
              { name: 'E-commerce', price: '799', desc: 'Solution complète pour vendre en ligne', features: ['Pages illimitées', 'Boutique en ligne', 'SSL inclus', 'SEO avancé', 'Paiements intégrés', 'Support dédié 24/7'], popular: false },
            ].map((plan) => (
              <div key={plan.name} className="relative p-7 rounded-2xl flex flex-col transition-all duration-200 hover:translate-y-[-2px]"
                style={{ background: plan.popular ? 'rgba(124,58,237,0.08)' : CARD, border: `1px solid ${plan.popular ? 'rgba(124,58,237,0.3)' : BORDER}` }}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: GRADIENT }}>Populaire</div>
                )}
                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-400 mb-5">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-sm text-gray-400 ml-1">CHF</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map(f => <li key={f} className="flex items-center gap-2 text-sm text-gray-300"><Check size={16} className="text-purple-400" /> {f}</li>)}
                </ul>
                <button onClick={() => navigate('/migrate')} className="w-full py-3 rounded-xl font-semibold transition-all hover:brightness-110"
                  style={{ background: plan.popular ? GRADIENT : 'transparent', border: plan.popular ? 'none' : `1px solid ${BORDER}`, color: 'white' }}>
                  Commencer
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24" style={{ background: BG }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">Ce que disent nos clients</h2>
            <p className="text-gray-400 text-base">Des entreprises suisses nous font confiance</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Marc Dubois', role: 'Restaurant Le Panorama', text: 'En 10 minutes, j\'avais un site magnifique pour mon restaurant. L\'IA a parfaitement compris mon activité.' },
              { name: 'Sophie Müller', role: 'Cabinet d\'architecture', text: 'La migration depuis mon ancien site s\'est faite sans aucune perte de contenu. Impressionnant.' },
              { name: 'Thomas Favre', role: 'Coach sportif', text: 'Le design est professionnel et mes clients trouvent facilement toutes les informations. Je recommande !' },
            ].map(t => (
              <div key={t.name} className="p-6 rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <div className="flex gap-1 mb-4">{[1,2,3,4,5].map(i => <Star key={i} size={16} fill="#a78bfa" className="text-purple-300" />)}</div>
                <p className="text-sm text-gray-300 leading-relaxed mb-5">"{t.text}"</p>
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-gray-500">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24" style={{ background: SURFACE }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Prêt à créer votre site ?</h2>
          <p className="text-gray-400 text-base mb-8">Commencez gratuitement. Aucune carte de crédit requise.</p>
          <button onClick={() => navigate('/migrate')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold text-base transition-all hover:brightness-110 hover:scale-[1.02]"
            style={{ background: GRADIENT }}>
            Commencer maintenant <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: BG, borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: GRADIENT }}>
              <Sparkles size={11} className="text-white" />
            </div>
            <span className="text-white font-semibold text-sm">AI Builder</span>
          </div>
          <p className="text-xs text-gray-500">&copy; 2026 AI Builder. Tous droits réservés.</p>
          <Link to="/login" className="text-xs text-gray-400 hover:text-white transition-colors">Connexion</Link>
        </div>
      </footer>
    </div>
  );
}
