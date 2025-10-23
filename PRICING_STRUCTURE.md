# MagiLoc - Structure Complète des Tarifs et CA

## 1. STOCKAGE DES TARIFS

### 1.1 Tarifs dans la table equipments

Les tarifs sont stockés **directement dans la table des équipements** :

```sql
CREATE TABLE equipments (
    id SERIAL PRIMARY KEY,
    prix_ht_jour DECIMAL(10,2),
    minimum_facturation DECIMAL(10,2) DEFAULT 0,
    minimum_facturation_apply BOOLEAN DEFAULT FALSE
);
```

Champs clés:
- `prix_ht_jour` : Tarif journalier HT (ex: 150.00 pour 150€/jour)
- `minimum_facturation` : Montant minimum à facturer
- `minimum_facturation_apply` : Activé/désactivé pour cette location

### 1.2 Archivage dans location_history

```sql
CREATE TABLE location_history (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER,
    client VARCHAR(200),
    date_debut DATE,
    date_fin_theorique DATE,
    date_retour_reel DATE,
    prix_ht_jour DECIMAL(10,2),              -- Tarif appliqué
    duree_jours_ouvres INTEGER,
    remise_ld BOOLEAN DEFAULT FALSE,         -- Remise 20% LD
    ca_total_ht DECIMAL(10,2),               -- CA final
    minimum_facturation_apply BOOLEAN,
    minimum_facturation DECIMAL(10,2)
);
```

**Pourquoi archiver :** Tracer les tarifs exacts facturés même si les tarifs changent.

---

## 2. ENDPOINTS API

### 2.1 GET /api/equipment

Retourne list/paginated d'équipements avec tarifs actuels.

Response exemple:
```json
{
  "data": [
    {
      "id": 1,
      "designation": "Nacelle GENIE S-45",
      "prixHT": 150.50,
      "minimumFacturation": 450.00,
      "minimumFacturationApply": true,
      "statut": "En Location",
      "client": "ACME CONSTRUCTION",
      "debutLocation": "01/10/2025",
      "finLocationTheorique": "20/10/2025"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 127,
    "totalPages": 3
  }
}
```

### 2.2 GET /api/equipment/:id/location-history

Retourne l'historique archivé avec CA réel.

```json
[
  {
    "id": 42,
    "equipment_id": 1,
    "client": "ACME CONSTRUCTION",
    "date_debut": "2025-09-01",
    "date_retour_reel": "2025-09-24",
    "prix_ht_jour": 150.50,
    "duree_jours_ouvres": 20,
    "remise_ld": true,
    "ca_total_ht": 2410.00,
    "minimum_facturation_apply": false,
    "numero_offre": "OFF-2025-001"
  }
]
```

---

## 3. EXEMPLE COMPLET: CYCLE DE LOCATION

### Étape 1: Création location
```
PATCH /api/equipment/1
{
  "statut": "En Location",
  "client": "ACME CONSTRUCTION",
  "debutLocation": "01/10/2025",
  "finLocationTheorique": "20/10/2025"
}
```

Equipment conserve ses tarifs: prix_ht_jour=150.50€/j, minimum=450€

### Étape 2: Retour et calcul CA
```
POST /api/equipment/1/return
{
  "rentreeLe": "18/10/2025",
  "noteRetour": "Bon état",
  "minimumFacturationApply": false
}
```

Backend calcule:
- Jours ouvrés: 14 (01/10 -> 18/10, sans weekends/jours fériés)
- Durée < 21 = pas de remise 20%
- CA = 14 × 150.50 = 2107.00€ HT
- Minimum apply=false, donc CA final = 2107.00€

Archive dans location_history:
```json
{
  "equipment_id": 1,
  "client": "ACME CONSTRUCTION",
  "prix_ht_jour": 150.50,
  "duree_jours_ouvres": 14,
  "remise_ld": false,
  "ca_total_ht": 2107.00,
  "minimum_facturation_apply": false
}
```

---

## 4. LOGIQUE DE CALCUL DU CA

### Règle 1: Durée de location
```
SI duree_jours_ouvres >= 21:
  ca = duree_jours_ouvres × prix_ht_jour × 0.8  (remise 20%)
SINON:
  ca = duree_jours_ouvres × prix_ht_jour
```

### Règle 2: Minimum facturation
```
SI minimum_facturation_apply:
  ca_final = MAX(ca_calculé, minimum_facturation)
SINON:
  ca_final = ca_calculé
```

### Code backend (server.js, ligne 625-712):
```javascript
const businessDays = calculateBusinessDays(debutLocationISO, rentreLeISO);
const prixHT = equipment.prix_ht_jour;
const isLongDuration = businessDays >= 21;

let calculatedCA;
if (isLongDuration) {
  calculatedCA = businessDays * prixHT * 0.8;
} else {
  calculatedCA = businessDays * prixHT;
}

if (minimumFacturationApply && calculatedCA < minimumFacturation) {
  caTotal = minimumFacturation;
} else {
  caTotal = calculatedCA;
}
```

---

## 5. ANALYTIQUES: CALCUL CA ESTIMÉ/CONFIRMÉ

### Estimé (mois courant)
```javascript
// Inclut locations EN COURS jusqu'à fin du mois
IF statut = 'En Location':
  businessDays = jours ouvrés entre deb et fin théo
  ca = businessDays × prixHT
  SI businessDays >= 21:
    ca *= 0.8
  IF minimumFacturationApply:
    ca = MAX(ca, minimum_facturation)
```

### Confirmé (jours écoulés seulement)
```javascript
// Seuls les jours jusqu'à aujourd'hui
IF statut = 'En Location':
  businessDays = jours ouvrés entre deb et aujourd'hui
  // Même logique de calcul que estimé
```

### Historique (mois passés)
```javascript
// Utilise les location_history.ca_total_ht (CA réel facturé)
FOR EACH location_history WHERE date_retour_reel IN mois:
  totalCA += location_history.ca_total_ht
```

---

## 6. EXEMPLE PRATIQUE D'AFFICHAGE

Component: LocationHistoryModal.js

```jsx
{history.map(loc => {
  const caDetail = `${loc.duree_jours_ouvres}j × ${loc.prix_ht_jour}€/j`
                  + (loc.remise_ld ? ' -20%' : '')
                  + (loc.minimum_facturation_apply ? ` (Min: ${loc.minimum_facturation}€)` : '');
  
  return (
    <tr>
      <td>{loc.client}</td>
      <td>{loc.date_debut} - {loc.date_retour_reel}</td>
      <td>{loc.duree_jours_ouvres}j</td>
      <td>
        {parseFloat(loc.ca_total_ht).toFixed(2)}€
        <br/>
        <small>{caDetail}</small>
      </td>
    </tr>
  );
})}
```

Résultat affiché:
```
Client: ACME CONSTRUCTION
Dates: 01/10/2025 - 18/10/2025
Durée: 14j
CA: 2107.00€
Détail: 14j × 150.50€/j
```

---

## 7. CHAMPS API - MAPPING BD

### GET /api/equipment

| Champ JSON | Colonne BD | Type |
|---|---|---|
| prixHT | prix_ht_jour | DECIMAL(10,2) |
| minimumFacturation | minimum_facturation | DECIMAL(10,2) |
| minimumFacturationApply | minimum_facturation_apply | BOOLEAN |

### GET /api/equipment/:id/location-history

| Champ | Colonne BD | Signification |
|---|---|---|
| prix_ht_jour | prix_ht_jour | Tarif appliqué à cette location |
| duree_jours_ouvres | duree_jours_ouvres | Jours facturés |
| remise_ld | remise_ld | true = remise 20% |
| ca_total_ht | ca_total_ht | CA final archivé |
| minimum_facturation_apply | minimum_facturation_apply | Minimum appliqué |

---

## 8. FLUX COMPLET DE DONNÉES

1. **Création**: tarifs dans equipments
2. **Affichage location active**: GET /api/equipment retourne prix_ht_jour
3. **Analytiques**: calcule CA estimé/confirmé avec tarifs actuels
4. **Retour**: calcule CA final avec tarifs de l'équipement
5. **Archive**: location_history snapshot des tarifs + CA
6. **Historique**: GET /api/equipment/:id/location-history affiche CA réel

---

## 9. CAS SPÉCIAUX

### Modification de tarif en cours de location
- Equipments.prix_ht_jour change
- Locations en cours utilisent nouveau tarif pour analytiques
- Location_history garde le tarif facturé réel

### Tarif nul (NULL)
- prixHT = null -> pas de CA calculé
- Affichage: "N/A"

### Minimum facturation
- Si activated + CA < minimum: facture le minimum
- Tracé dans location_history pour audit

