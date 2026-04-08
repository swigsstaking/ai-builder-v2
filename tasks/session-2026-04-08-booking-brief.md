# Brief : Page de Réservation — Architecture validée

## Décisions prises

1. **Type de page** : `booking` ajouté au type enum de Page (pas de nouveau siteType)
2. **Flow création** : 3ème option dédiée sur le dashboard (one-pager)
3. **Données prestations** : dupliquées (contenu vitrine dans AI Builder, données opérationnelles dans Calendar)
4. **Widget** : iframe `calendar.swigs.online/book/{slug}`
5. **Templates** : un seul template booking générique, l'IA adapte le contenu au métier
6. **Sync URL → Calendar** : non automatique, pré-remplissage vitrine uniquement

## Sections template booking
1. hero-practitioner : photo portrait, nom, titre/spécialité, accroche
2. services-booking : prestations avec durée + prix
3. about : bio, parcours, diplômes
4. booking-widget : iframe calendar.swigs.online/book/{slug}
5. testimonials : avis clients (optionnel)
6. contact : coordonnées, carte Google Maps, horaires

## Onglet "Réservations" dans la sidebar
Visible quand le site a une page booking :
- Prestations : CRUD via proxy → Calendar API
- Horaires : config via proxy → Calendar API
- Rendez-vous : liste via proxy → Calendar API

## Auth cross-service
SSO Hub résolu. Les users AI Builder ont un hubUserId lié au Hub. Calendar utilise le même Hub. Le proxy API utilise cette identité partagée.

## Estimation
- Phase A (template) : 1 sous-session
- Phase B (flow création) : 1 sous-session
- Phase C (proxy API) + D (onglet) + E (ajout existant) : 1-2 sous-sessions
