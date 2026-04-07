# Complément : Templates AI Builder v1 retrouvés dans le bundle minifié

## Découverte importante

Les 5 templates visuels de l'AI Builder v1 existent dans le JS minifié déployé sur le serveur 59. Ce n'est PAS juste du contenu généré par Claude — ce sont de vrais composants React avec des layouts différents par style.

## Comment récupérer le bundle

```bash
ssh swigs@192.168.110.59 "cat /home/swigs/ai-builder-dist/assets/index-Bw5X756J.js" > /tmp/aibuilder-bundle.js
```

Le fichier fait 487KB. Les templates sont dedans.

## Ce qu'on a trouvé dans le bundle

### 5 composants de design style
Chaque style a son propre composant React avec un layout différent :
- `cy` → **artistic** (layout asymétrique, couleurs vibrantes)
- `uy` → **bold** (texte XXL, contrastes forts)
- un autre → **elegant** (raffiné, épuré)
- un autre → **minimal** (sobre, fonctionnel)
- un autre → **modern** (équilibré, polyvalent, défaut)

Le switch de rendu dans le bundle :
```js
switch(o){
  case"artistic":return i.jsx(cy,{...c});
  case"bold":return i.jsx(uy,{...c});
  case"e... // elegant
  // etc.
}
```

### 4 composants de pages (partagés entre les styles)
- `qm` → **Shop** (produits, catalogue)
- `fS` → **About** (à propos, team, testimonials)
- `mS` → **Contact** (formulaire, map, infos)
- `hS` → **Services** (liste de services)

Routing des pages :
```js
const S={shop:qm, services:hS, about:fS, contact:mS}[m.type]||qm;
```

### Config par style (`Gm`)
```js
Gm = {
  modern: { borderRadius: "rounded-lg", buttonStyle: "rounded-lg", ... },
  bold: { ... },
  elegant: { ... },
  minimal: { ... },
  artistic: { borderRadius: "rounded-full", buttonStyle: "rounded-full", fontFamily: "font-medium" }
}
```

### Props reçues par chaque template
```js
{content, pageContent, colors, siteName, designStyle, styleConfig, onNavigate}
```

Où `content` contient : `siteName, tagline, description, designStyle, colors, hero, features, services, about, testimonial, contact, pages, navigation`

### Composant de preview principal (`pS`)
Gère la navigation entre pages et route vers le bon style :
```js
pS = ({content, viewMode="desktop", visibleSections={}, onPageChange=null}) => {
  const l = content?.designStyle || "modern";
  const c = Gm[l] || Gm.modern;
  const u = content?.colors || {primary:"#0ea5e9", secondary:"#1e293b", accent:"#f59e0b"};
  // ...
}
```

## Ce que tu dois faire

1. **Extraire les templates** : copie le bundle, déminifie-le (prettier ou un outil en ligne), et isole les 5 composants de style + 4 composants de pages
2. **Les recréer en JSX propre** : à partir du code déminifié, recrée chaque template en React lisible
3. **Les adapter** : soit les utiliser tels quels pour le preview dans l'app, soit adapter leur design CSS pour les templates Handlebars SSG existants (dans `/templates/sections/*.hbs` et `/templates/assets/styles/*.css`)
4. **L'idéal** : que les sites générés par notre SSG Handlebars aient le MÊME niveau de qualité visuelle que ces templates React

## Pour déminifier

```bash
# Copier le bundle localement
ssh swigs@192.168.110.59 "cat /home/swigs/ai-builder-dist/assets/index-Bw5X756J.js" > /tmp/aibuilder-bundle.js

# Chercher les composants de style autour de designStyle
grep -b -o 'designStyle' /tmp/aibuilder-bundle.js

# Extraire le contexte autour de chaque occurrence (500 chars avant/après)
# Les composants cy, uy, etc. sont définis juste avant le switch statement
```

Les offsets importants dans le bundle :
- **~424000-450000** : composants de pages (Shop, About, Contact, Services)  
- **~440000** : config des styles (`Gm`)
- **~450000** : composant preview principal (`pS`) avec le switch
- **~470000** : sélecteur de template dans l'UI

## DIRECTIVE IMPORTANTE : Repenser entièrement la partie post-login

Ne te contente PAS de "refondre" ou "restyler" ce qui existe. Ce qui a été fait après le login (dashboard, éditeur, création de site, pages, settings) est un copier-coller de Resamatic avec des hacks CSS. **C'est à jeter et à repenser de zéro.**

### Ce que tu dois faire

**REPENSER et RECRÉER** toute l'expérience post-login :
- Le dashboard (comment on affiche et gère ses sites)
- Le flow de création de site (comment on crée un nouveau site)
- L'éditeur de site (comment on édite les pages, sections, contenus)
- La gestion des pages, médias, SEO, settings

Ne pars PAS du code existant des pages dashboard/éditeur. Pars d'une feuille blanche en gardant uniquement :
- La logique backend (API, services) → NE PAS TOUCHER
- Le système PostMessage/iframe pour la preview live → GARDER la mécanique, refaire l'UI autour
- Les stores Zustand (siteStore, authStore, migrationStore) → réutiliser
- L'API service (`api.js`) → réutiliser

### Focus : sites vitrines uniquement

Pour l'instant on se concentre sur les **sites vitrines** (pas e-commerce). Les types de sites prioritaires :
- Services / PME
- Restaurant
- Portfolio
- Auto-école
- Cabinet (médical, juridique, consulting)

Ne pas implémenter pour l'instant : boutique, produits, panier, paiements.

### Les templates AI Builder v1 sont CRITIQUES

Les 5 templates visuels (modern, bold, elegant, minimal, artistic) extraits du bundle sont le **coeur du produit**. C'est ce que le client voit comme résultat. Ils doivent :
- Être extraits du bundle minifié et recréés proprement
- Être intégrés dans le système de preview (iframe)
- Produire des sites BEAUX et PROFESSIONNELS
- Avoir des layouts VRAIMENT différents entre les 5 styles (pas juste un changement de couleurs)

### Architecture cible

```
Landing page (/) → déjà faite, NE PAS TOUCHER
Login (/login) → déjà fait, NE PAS TOUCHER
Migration wizard (/migrate) → déjà fait, NE PAS TOUCHER

Après login :
/dashboard                    → Nouveau dashboard (liste sites, stats, actions rapides)
/dashboard/new                → Nouveau flow de création (repensé)
/dashboard/sites/:id          → Vue d'ensemble d'un site
/dashboard/sites/:id/editor   → Nouvel éditeur visuel (le plus important)
/dashboard/sites/:id/pages    → Gestion des pages
/dashboard/sites/:id/settings → Paramètres du site
/dashboard/sites/:id/seo      → SEO
/dashboard/sites/:id/media    → Bibliothèque médias
```

### L'éditeur visuel = le produit

L'éditeur est CE QUE L'UTILISATEUR UTILISE LE PLUS. Il doit être :
- Intuitif (un non-technicien doit comprendre en 30 secondes)
- Beau (dark, cohérent avec la landing)
- Fluide (preview live, édition inline, auto-save)
- Puissant (réordonner sections, masquer/afficher, changer de style, IA pour réécrire)

L'éditeur actuel (copié de Resamatic) fonctionne techniquement mais son UX est celle d'un outil interne, pas d'un SaaS. REPENSE-LE.

### Résumé des priorités

1. **Extraire et recréer les 5 templates** de l'AI Builder v1 depuis le bundle (sites vitrines uniquement)
2. **Repenser l'éditeur visuel** de zéro (en gardant la mécanique PostMessage/iframe)
3. **Repenser le dashboard** et le flow de création
4. **Tout en dark** cohérent avec la landing (palette violet/bleu, blueprint grid)
5. **Tester chaque flow** avec Chrome MCP
