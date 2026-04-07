# Document de relais — Session du 2 avril 2026

## Contexte
Refonte de la page de création de site (`/dashboard/new`) dans AI Builder v2. Trois modifications principales demandées + améliorations UX.

---

## Ce qui a été complété

### 1. Suppression du sticky (✅ terminé)
- **Fichier** : `frontend/src/pages/SiteCreatePage.jsx` (lignes ~620-633)
- Le `<div className="sticky top-14">` autour du BlueprintPanel a été supprimé
- Les deux colonnes (formulaire gauche + blueprint droite) scrollent ensemble

### 2. Background organique du BlueprintPanel (✅ terminé)
- **Fichier** : `frontend/src/components/BlueprintPanel.jsx`
- La grille géométrique CSS a été remplacée par un **SVG avec grille + masque organique**
- La grille utilise les mêmes specs que la landing page (`blueprint-grid` dans `index.css`)
- Un path SVG blob irrégulier avec `feGaussianBlur` (stdDeviation=18) crée des contours organiques fondus
- La grille déborde au-delà du panneau (`overflow-visible`, insets négatifs -20%/-25%)
- Opacité augmentée : petite grille 0.1, grande grille 0.16

### 3. Refonte du panneau de visualisation (✅ terminé)
- **Fichier** : `frontend/src/components/BlueprintPanel.jsx`
- **Gauche** : Mini wireframe SVG (nav + hero + services) avec `width="100%"` responsive, spécifique à chaque template (modern/bold/elegant/minimal/artistic)
- **Droite** : 4 composants UI réels (Button, Card, Input, Badge) stylés dynamiquement selon le template sélectionné (border-radius, uppercase, font-family, couleurs)
- Header "SITE BLUEPRINT", palette de couleurs, spec sheet et status conservés
- Ligne violette sous "SITE BLUEPRINT" supprimée

### 4. Sélection de sections dans le formulaire (✅ terminé)
- **Fichiers** : `BlueprintPanel.jsx` (composant exporté) + `SiteCreatePage.jsx`
- Composant `SectionSelector` avec 9 sections toggle (Hero, Services, À propos, Témoignages, Avis Google, FAQ, Équipe, CTA, Contact)
- Hero est marqué "requis" et non désactivable
- Ajouté dans le formulaire gauche, entre la palette de couleurs et les images
- Import : `import BlueprintPanel, { SectionSelector } from '../components/BlueprintPanel'`
- **⚠️ Pas encore connecté fonctionnellement** — le state des sections n'est pas utilisé lors de la création du site

### 5. Modal de création avec template qui se colore (✅ terminé)
- **Fichier** : `frontend/src/components/CreateProgressModal.jsx`
- Modal élargi (720px) avec layout 2 colonnes : steps à gauche, template preview à droite
- Le template SVG se colore **par vague** de haut-gauche vers bas-droite (`waveAt(x, y)`)
- Chaque élément a un taux de colorisation basé sur sa position et la progression globale
- Interpolation `lerp()` entre gris monochrome et couleurs choisies (primary/secondary/accent)
- Glow derrière le template qui s'intensifie avec la progression
- Props ajoutées : `template`, `colors`, `siteName` (passées depuis SiteCreatePage)
- **⚠️ Non testé visuellement** car le backend (192.168.110.208:4005) retourne 401 avec les credentials fournis

---

## Ce qui reste à faire

### Priorité haute
1. **Connecter le SectionSelector au processus de création** — Le state `sections` du composant est local. Il faut :
   - Remonter le state dans `SiteCreatePage` (via props ou callback)
   - Filtrer les sections envoyées au backend lors de `handleCreate()`
   - Mettre à jour le compteur "9 BLOCKS" dans le spec sheet du BlueprintPanel

2. **Masquer la grille derrière les composants** — L'utilisateur voulait que la grille ne soit pas visible derrière les composants du blueprint (wireframe, UI components, etc.). Tentative faite mais revertée car trop invasive visuellement. **Approche suggérée** : ajouter `backgroundColor: '#0f0f1a'` uniquement sur le div wrapper `z-20` du contenu, sans toucher aux sous-composants individuels. C'est un changement d'une seule ligne.

3. **Tester le modal de création** — Se connecter au vrai backend pour vérifier :
   - Que le modal s'affiche correctement
   - Que la vague de colorisation fonctionne bien visuellement
   - Que les props template/colors/siteName sont bien passées

### Priorité moyenne
4. **Wireframe SVG du BlueprintPanel** — Le MiniWireframe existe toujours dans le code pour les 5 templates mais n'est plus utilisé par le code legacy (l'ancien TemplateWireframe complet a été supprimé). Nettoyer si besoin.

5. **Fond opaque sur les composants UI** — L'utilisateur a demandé que les composants individuels (boutons, cards, input) aient un fond opaque pour masquer la grille. Les valeurs étaient : bouton outline `#13132a`, card `#151530`, input `#131328`. Revert fait car la demande a évolué. À rediscuter.

---

## Architecture des fichiers modifiés

```
frontend/src/
├── pages/
│   └── SiteCreatePage.jsx          # Sticky supprimé, SectionSelector ajouté, props modal enrichies
├── components/
│   ├── BlueprintPanel.jsx           # Refonte complète : grille organique SVG, wireframe mini, UI components, SectionSelector exporté
│   └── CreateProgressModal.jsx      # Modal élargi avec template qui se colore par vague
```

## Pour démarrer la prochaine session

1. Vérifier les credentials backend — le login `admin@swiss.online / Admin123!` retourne 401
2. Commencer par connecter le `SectionSelector` au flow de création (point 1 ci-dessus)
3. Puis tester le modal de création en conditions réelles
4. Revenir sur le masquage de la grille derrière les composants si l'utilisateur le souhaite

## Notes techniques
- Le dev server se lance avec `cd frontend && npm run dev`
- Pour tester sans backend, on peut injecter le auth store Zustand via la console Chrome :
  ```js
  import('/src/stores/authStore.js').then(mod => {
    mod.default.setState({ user: { _id: 'fake', email: 'admin@swiss.online', role: 'admin', name: 'Admin' }, token: 'fake', loading: false });
  });
  ```
- Le XHR interceptor dans `initScript` de Chrome MCP fonctionne pour `/api/auth/me` mais les autres appels API échouent avec le fake token
