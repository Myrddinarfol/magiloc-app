# MagiLoc - Référence Rapide Tarifs et CA

## Où sont les tarifs ?

**Table `equipments` :**
- `prix_ht_jour` : Prix/jour (ex: 150.50)
- `minimum_facturation` : Montant min (ex: 450.00)
- `minimum_facturation_apply` : Activé? (true/false)

**Table `location_history` :**
- Archive SNAPSHOT des tarifs lors de chaque clôture
- `ca_total_ht` : CA réel calculé et facturé

---

## Endpoints clés

### Lister équipements + tarifs
```
GET /api/equipment?limit=50
Response: Retourne [prixHT, minimumFacturation, minimumFacturationApply]
```

### Historique locations avec CA
```
GET /api/equipment/{id}/location-history
Response: [
  {
    prix_ht_jour: 150.50,
    duree_jours_ouvres: 14,
    remise_ld: false,
    ca_total_ht: 2107.00,
    minimum_facturation_apply: false
  }
]
```

### Créer location
```
PATCH /api/equipment/{id}
Body: {statut, client, debutLocation, finLocationTheorique}
Tarifs restent dans equipments
```

### Retourner + calculer CA
```
POST /api/equipment/{id}/return
Body: {rentreeLe, noteRetour, minimumFacturationApply}
Backend: Calcule CA -> Archive dans location_history
```

---

## Formule CA

```
1. Jours ouvrés = calculateBusinessDays(debut, retour)
   (exclu weekends + jours fériés FR)

2. SI duree >= 21 jours:
     ca = duree × prix × 0.8   (remise 20%)
   SINON:
     ca = duree × prix

3. SI minimum_apply:
     ca_final = MAX(ca, minimum)
   SINON:
     ca_final = ca
```

---

## Exemples rapides

### Courte durée (10j, 100€/j, min 300€ activé)
```
ca = 10 × 100 = 1000€
min? MAX(1000, 300) = 1000€
remise_ld = false
```

### Longue durée (25j, 100€/j, min inactif)
```
ca = 25 × 100 × 0.8 = 2000€
min? Non appliqué = 2000€
remise_ld = true
```

### Très courte avec min (2j, 100€/j, min 250€ activé)
```
ca = 2 × 100 = 200€
min? MAX(200, 250) = 250€
remise_ld = false
minimum_apply = true
```

---

## Champs API mapping

| Frontend | BDD | Type |
|----------|-----|------|
| prixHT | prix_ht_jour | DECIMAL |
| minimumFacturation | minimum_facturation | DECIMAL |
| minimumFacturationApply | minimum_facturation_apply | BOOL |
| ca_total_ht | ca_total_ht | DECIMAL |
| duree_jours_ouvres | duree_jours_ouvres | INT |
| remise_ld | remise_ld | BOOL |

---

## Affichage LocationHistoryModal

Pour chaque row dans location_history:
```
Durée: 14j
CA: 2107.00€
Détail: "14j × 150.50€/j" + ("-20%" si remise_ld) + ("(Min: XXX€)" si applied)
```

---

## Fichiers clés

| Fichier | Fonction |
|---------|----------|
| backend/server.js (l.625-712) | Calcul CA + archivage |
| backend/server.js (l.749-765) | GET location-history |
| backend/utils/dateHelpers.js | calculateBusinessDays |
| frontend/services/analyticsService.js | Calcul CA estimé/confirmé |
| frontend/components/modals/LocationHistoryModal.js | Affichage historique |

---

## Résumé flux

1. Créer location → PATCH /equipment/{id} (statut="En Location")
2. Location active → GET /equipment (affiche tarifs)
3. Retourner → POST /equipment/{id}/return
4. Backend calcule CA
5. Archive dans location_history (snapshot tarifs+CA)
6. Historique → GET /equipment/{id}/location-history

