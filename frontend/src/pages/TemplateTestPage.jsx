import { useState } from 'react';
import ArtisticTemplate from '../templates/styles/ArtisticTemplate';
import BoldTemplate from '../templates/styles/BoldTemplate';
import ElegantTemplate from '../templates/styles/ElegantTemplate';
import MinimalTemplate from '../templates/styles/MinimalTemplate';
import ModernTemplate from '../templates/styles/ModernTemplate';

// Demo data using the UNIVERSAL 9-block section schema
const DEMO_SECTIONS = [
  {
    type: 'hero', order: 0, visible: true,
    data: {
      headline: 'Buffet de la Gare — Chez Claude',
      subheadline: 'Cuisine traditionnelle valaisanne dans un cadre authentique depuis 1987',
      ctaText: 'Réserver une table',
      ctaUrl: '#contact',
      bulletPoints: [
        { value: 'Cuisine maison avec produits frais et locaux' },
        { value: 'Plus de 200 références de vins valaisans' },
        { value: 'Terrasse ombragée avec vue sur les vignobles' },
      ],
    },
  },
  {
    type: 'services', order: 1, visible: true,
    data: {
      title: 'Notre carte',
      subtitle: 'Des plats traditionnels préparés avec passion',
      services: [
        { name: 'Menu du jour', shortDescription: 'Entrée, plat, dessert — CHF 22.—', price: '22 CHF' },
        { name: 'Raclette traditionnelle', shortDescription: 'Fromage à raclette du Valais, pommes de terre et cornichons', price: '28 CHF' },
        { name: 'Fondue moitié-moitié', shortDescription: 'Gruyère et Vacherin fribourgeois', price: '26 CHF' },
        { name: 'Assiette valaisanne', shortDescription: 'Viande séchée, fromage, pain de seigle', price: '24 CHF' },
      ],
    },
  },
  {
    type: 'about', order: 2, visible: true,
    data: {
      title: 'Notre histoire',
      body: '<p>Depuis 1987, le Buffet de la Gare accueille les habitants et voyageurs de St-Pierre-de-Clages. Claude et son équipe perpétuent la tradition culinaire valaisanne avec passion et authenticité.</p>',
      bulletPoints: [
        { value: 'Plus de 35 ans d\'expérience' },
        { value: 'Produits locaux et de saison' },
        { value: 'Ambiance chaleureuse et familiale' },
      ],
    },
  },
  {
    type: 'testimonials', order: 3, visible: true,
    data: {
      title: 'Ce que disent nos clients',
      items: [
        { name: 'Jean-Pierre M.', location: 'Sion', rating: 5, text: 'La meilleure raclette de la région ! Ambiance chaleureuse et service impeccable.' },
        { name: 'Sophie L.', location: 'Lausanne', rating: 5, text: 'Un vrai bijou caché. La fondue est divine et les vins excellents.' },
        { name: 'Thomas R.', location: 'Martigny', rating: 4, text: 'Cadre authentique, cuisine généreuse. On y revient toujours avec plaisir.' },
      ],
    },
  },
  {
    type: 'google-reviews', order: 4, visible: true,
    data: {
      title: 'Avis Google vérifiés',
      reviewCount: 127,
      rating: 4.7,
      ctaText: 'Voir nos 127+ avis',
      ctaUrl: 'https://g.page/buffetdelagare',
      testimonials: [
        { name: 'Marie D.', location: 'Conthey', text: 'Excellent restaurant ! Les plats sont copieux et délicieux. Personnel très accueillant.', isGoogle: true },
        { name: 'Patrick B.', location: 'Sierre', text: 'Toujours un plaisir de venir chez Claude. La raclette est la meilleure du Valais.', isGoogle: true },
      ],
    },
  },
  {
    type: 'faq', order: 5, visible: true,
    data: {
      title: 'Questions fréquentes',
      items: [
        { question: 'Faut-il réserver ?', answer: 'Nous recommandons de réserver, surtout le week-end et en période de fêtes. Appelez-nous au 027 306 37 66.' },
        { question: 'Proposez-vous des menus pour groupes ?', answer: 'Oui, nous proposons des menus banquet à partir de 10 personnes. Contactez-nous pour un devis personnalisé.' },
        { question: 'Y a-t-il un parking ?', answer: 'Oui, un parking gratuit est disponible devant le restaurant. La gare CFF est également à 50 mètres.' },
      ],
    },
  },
  {
    type: 'team', order: 6, visible: true,
    data: {
      title: 'Notre équipe',
      body: '<p>Une équipe passionnée à votre service depuis plus de 35 ans.</p>',
      members: [
        { name: 'Claude Passot', role: 'Chef & Propriétaire', bio: 'Passionné de cuisine valaisanne depuis toujours' },
        { name: 'Marie Passot', role: 'Service & Accueil', bio: 'Le sourire qui fait la différence' },
        { name: 'Jean-Marc', role: 'Sommelier', bio: 'Expert en vins du Valais et de Suisse' },
      ],
    },
  },
  {
    type: 'cta', order: 7, visible: true,
    data: {
      text: 'Envie de goûter notre cuisine traditionnelle ?',
      ctaText: 'Réserver une table',
      ctaUrl: '#contact',
      bannerStyle: 'dark',
    },
  },
  {
    type: 'contact', order: 8, visible: true,
    data: {
      title: 'Nous trouver',
      body: '<p>Situé au cœur de St-Pierre-de-Clages, à deux pas de la gare CFF.</p>',
      phone: '027 306 37 66',
      email: 'info@buffetdelagarechezclaude.ch',
      address: 'Rue de la Gare 1, 1955 St-Pierre-de-Clages',
      hours: 'Mar-Dim: 11h30-14h, 18h-22h | Lundi: fermé',
    },
  },
];

const DEMO_SITE = {
  name: 'Buffet de la Gare',
  siteName: 'Buffet de la Gare',
  tagline: 'Restaurant traditionnel à St-Pierre-de-Clages',
};

const TEMPLATES = [
  { id: 'modern', label: 'Modern', Component: ModernTemplate, colors: { primary: '#0ea5e9', secondary: '#1e293b', accent: '#f59e0b' } },
  { id: 'bold', label: 'Bold', Component: BoldTemplate, colors: { primary: '#ef4444', secondary: '#0f172a', accent: '#fbbf24' } },
  { id: 'elegant', label: 'Elegant', Component: ElegantTemplate, colors: { primary: '#b8860b', secondary: '#1a1a1a', accent: '#d4af37' } },
  { id: 'minimal', label: 'Minimal', Component: MinimalTemplate, colors: { primary: '#374151', secondary: '#111827', accent: '#6366f1' } },
  { id: 'artistic', label: 'Artistic', Component: ArtisticTemplate, colors: { primary: '#7c3aed', secondary: '#1e293b', accent: '#f59e0b' } },
];

export default function TemplateTestPage() {
  const [active, setActive] = useState('artistic'); // Start with already-adapted template

  const tmpl = TEMPLATES.find(t => t.id === active);
  const site = { ...DEMO_SITE, colors: tmpl.colors };

  return (
    <div className="h-screen flex flex-col bg-[#0f0f1a]">
      <div className="flex items-center gap-2 px-4 py-3 bg-[#151525] border-b border-white/[0.07] shrink-0">
        <span className="text-xs text-slate-500 mr-2">Template V1 (universel) :</span>
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
              active === t.id
                ? 'bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden">
        <tmpl.Component
          sections={DEMO_SECTIONS}
          site={site}
          isMobile={false}
          onNavigate={null}
        />
      </div>
    </div>
  );
}
