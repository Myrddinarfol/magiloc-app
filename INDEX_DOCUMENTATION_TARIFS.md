# MagiLoc - Index Documentation Tarifs et CA

## Documents Créés

### 1. PRICING_STRUCTURE.md (7 KB)
**Contenu complet et structuré du système de tarification**

- 1. Stockage des tarifs (equipments et location_history)
- 2. Endpoints API avec structures JSON détaillées
- 3. Exemple complet: cycle de location
- 4. Logique de calcul du CA (formules)
- 5. Analytiques: CA estimé/confirmé/historique
- 6. Exemple d'affichage LocationHistoryModal
- 7. Champs API - Mapping BD
- 8. Flux complet de données
- 9. Cas spéciaux

**A lire si vous voulez:** Vue d'ensemble complète et structurée

---

### 2. API_DETAILED_EXAMPLES.txt (7.3 KB)
**Exemples d'appels API avec calculs détaillés**

- Exemples réels de requêtes/réponses
- Cas d'usage: courte durée, longue durée, minimum
- Calculs étape par étape annotés
- Valeurs d'exemple concrets

**A lire si vous voulez:** Voir des exemples réels et comprendre le calcul pas à pas

---

### 3. QUICK_REFERENCE.md (3.1 KB)
**Référence rapide du système**

- Où sont les tarifs (tables + colonnes)
- Endpoints clés avec mini-exemples
- Formule CA simple
- Exemples rapides (3 cas)
- Champs API mapping
- Fichiers clés et lignes
- Flux résumé

**A lire si vous voulez:** Retrouver rapidement une info sans lire 7 KB

---

### 4. RESUME_TARIFS.txt (4.8 KB)
**Résumé complet en format texte simple**

Sections:
- 1. Où sont stockés les tarifs
- 2. Endpoints API et structures
- 3. Exemple complet: location 01/10 -> 18/10
- 4. Logique calcul CA
- 5. Analytiques par mois
- 6. Fichiers clés
- 7. Mapping BD -> API

**A lire si vous voulez:** Avoir un document sans dépendances markdown

---

## Structure Base de Données

### Table: equipments
```
prix_ht_jour              DECIMAL(10,2)    Tarif journalier
minimum_facturation       DECIMAL(10,2)    Montant minimum
minimum_facturation_apply BOOLEAN          Minimum activé?
```

### Table: location_history (archive)
```
precio_ht_jour               DECIMAL(10,2)    Tarif appliqué
duree_jours_ouvres          INTEGER          Jours facturés
remise_ld                   BOOLEAN          Remise 20%?
ca_total_ht                 DECIMAL(10,2)    CA final
minimum_facturation_apply   BOOLEAN
minimum_facturation         DECIMAL(10,2)
```

---

## Endpoints Clés

**GET /api/equipment**
- Récupère équipements + tarifs actuels
- Retourne: prixHT, minimumFacturation, minimumFacturationApply

**GET /api/equipment/:id/location-history**
- Récupère historique avec CA réel
- Retourne: prix_ht_jour, duree_jours_ouvres, remise_ld, ca_total_ht

**PATCH /api/equipment/:id** (créer location)
- Met à jour statut, client, dates
- Tarifs restent dans equipments

**POST /api/equipment/:id/return** (retour + calcul CA)
- Calcule jours ouvrés, applique remise LD + minimum
- Archive dans location_history
- Change statut en "En Maintenance"

---

## Formule CA (Simple)

```
1. Jours = calculateBusinessDays(debut, retour)
   Exclut: samedi/dimanche/jours fériés FR

2. SI jours >= 21:
     ca = jours × prix × 0.8   (remise 20%)
   SINON:
     ca = jours × prix

3. SI minimum_apply:
     ca_final = MAX(ca, minimum)
   SINON:
     ca_final = ca
```

---

## Exemple Pratique

Location 01/10 -> 18/10/2025:
- Jours ouvrés: 14
- Prix: 150.50€/jour
- Durée < 21: pas de remise
- CA = 14 × 150.50 = 2107€
- Pas de minimum appliqué
- **CA FINAL = 2107€**

---

## Fichiers Source (Backend)

| Fichier | Lignes | Fonction |
|---------|--------|----------|
| server.js | 625-712 | Calcul CA + archivage |
| server.js | 749-765 | GET location-history |
| server.js | 133-225 | GET equipment |
| utils/dateHelpers.js | 75-107 | calculateBusinessDays |
| database/schema.sql | - | Structure tables |

## Fichiers Source (Frontend)

| Fichier | Fonction |
|---------|----------|
| services/analyticsService.js | Calcul CA estimé/confirmé |
| components/modals/LocationHistoryModal.js | Affichage historique |
| utils/dateHelpers.js | Conversions dates |

---

## Guide de Lecture

**Je suis pressé, je veux une vue d'ensemble rapide:**
-> Lire QUICK_REFERENCE.md (3 min)

**Je veux comprendre le système complètement:**
-> Lire PRICING_STRUCTURE.md (15 min)

**Je veux voir des exemples réels:**
-> Lire API_DETAILED_EXAMPLES.txt (10 min)

**Je veux un document offline/simple:**
-> Lire RESUME_TARIFS.txt (5 min)

**Je veux savoir où exactement modifier le code:**
-> Aller à PRICING_STRUCTURE.md section "Fichiers clés"

---

## Questions Couvertes

1. **Où sont les tarifs?**
   - equipments.prix_ht_jour + minimum_facturation
   - location_history archive les snapshots

2. **Comment récupérer les tarifs?**
   - GET /api/equipment (tarifs actuels)
   - GET /api/equipment/:id/location-history (tarifs appliqués)

3. **Quels champs retourne l'API?**
   - GET /api/equipment: prixHT, minimumFacturation, minimumFacturationApply
   - GET /api/equipment/:id/location-history: voir PRICING_STRUCTURE.md

4. **Exemple réponse API avec CA?**
   - Voir API_DETAILED_EXAMPLES.txt section 4

5. **Où et comment tarifs appliqués?**
   - backend/server.js lignes 625-712
   - Formule: CA = jours × prix × (0.8 si LD?) = MAX(ca, minimum?)

---

## Champs Importants à Retenir

**Pour les tarifs:**
- `prix_ht_jour` / `prixHT` : Le prix par jour
- `minimum_facturation` : Le montant minimum
- `minimum_facturation_apply` : true/false

**Pour le CA calculé:**
- `ca_total_ht` : CA final (archivé dans location_history)
- `duree_jours_ouvres` : Jours facturés
- `remise_ld` : true = remise 20% appliquée

---

## Cas d'Utilisation Courants

**Je veux afficher les tarifs d'un équipement:**
```
GET /api/equipment/1
-> Récupère prixHT, minimumFacturation, minimumFacturationApply
```

**Je veux voir l'historique avec CA:**
```
GET /api/equipment/1/location-history
-> Récupère ca_total_ht + tous les détails
```

**Je veux créer une location:**
```
PATCH /api/equipment/1
Body: {statut: "En Location", client: "ACME", debutLocation, finLocationTheorique}
-> Tarifs restent dans equipments
```

**Je veux retourner un équipement et calculer le CA:**
```
POST /api/equipment/1/return
Body: {rentreeLe, noteRetour, minimumFacturationApply}
-> Backend: Calcule CA -> Archive dans location_history
```

---

**Tous les documents sont dans le dossier racine du projet MagiLoc**

