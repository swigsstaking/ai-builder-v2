# Prompt pour la prochaine session

```
Lis le fichier tasks/session-2026-04-07-b.md pour le contexte complet de la session précédente.

## Contexte
AI Builder est un SaaS qui permet de créer des sites web via IA. Le backend tourne sur 192.168.110.59 (PM2 ai-builder-v2, port 4005), le frontend en dev sur localhost:5179 (Vite, proxy vers le backend). L'OCR utilise deepseek-ocr + qwen3.5 sur un serveur Ollama 0.20.3 (192.168.110.103). SSH: user swigs, sudo password SW45id-445-332. Login app: admin@swigs.online / Admin123!.

Lors de la session précédente :
- Pages multiples implémentées : création from scratch génère homepage + sous-pages + contact
- 5 nouvelles sections : gallery, pricing, products, hours, menu (avec renderers dans les 5 templates)
- Presets par activité : un restaurant auto-sélectionne menu + galerie + horaires
- Migration multi-pages : le pipeline OCR détecte les sous-pages et crée la structure
- AI génère du contenu unique par sous-page via POST /ai/generate-subpage
- Testé et déployé : restaurant "La Table du Valais" avec 5 pages rendues correctement

## Améliorations prioritaires

### 1. Navigation dynamique dans les templates
Actuellement la navbar est hardcodée (Accueil, Services, À propos, Contact). Les sous-pages (Carte, Galerie, Horaires) n'apparaissent pas dans la navigation. Il faut :
- Générer la navigation dynamiquement depuis les pages du site
- Mettre à jour les 5 templates (frontend + backend) pour lire les pages et créer les liens

### 2. Migration multi-pages : test end-to-end
La migration a été enrichie (pageMapping, pageStructure, mapAnalysisToPages) mais pas encore testée en navigateur. Il faut :
- Tester une migration complète sur un site restaurant
- Vérifier que le wizard affiche les onglets multi-pages correctement
- Fix potentiel : l'enum analysisProvider n'accepte pas les nouvelles valeurs

### 3. Qualité du contenu généré
- Les prix du menu sont "XX CHF" — améliorer le prompt AI pour générer des prix réalistes
- La section galerie est vide sans images uploadées — ajouter des placeholders visuels
- Le nombre de services sur la homepage pourrait être 0 si l'AI ne retourne pas otherPages correctement

### Points d'attention
- Le backend est en PROD — ne rien casser, tester avant de déployer
- Deploy via scp + pm2 restart ai-builder-v2
- Fichiers clés : voir tasks/session-2026-04-07-b.md pour la liste complète
- Utiliser Chrome MCP pour tester le flow complet en navigateur
```
