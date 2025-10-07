# 🔧 AUDIT COMPLET - Corrections nécessaires

## ✅ Problèmes résolus

1. ✅ **Dossier obsolète /src/** supprimé (ancienne version v1.0)
2. ✅ **Schéma maintenance_history** - Ajout colonne `duree_jours`
3. ✅ **Schéma equipments** - Structure validée
4. ✅ **Schéma location_history** - Colonnes snake_case OK

## 🚨 Problèmes critiques à corriger

### 1. Conflit de variable `client` dans server.js

**Ligne 182** - Route POST `/api/equipment/import`
```javascript
const client = await pool.connect(); // ❌ Devrait être dbClient
```

**Ligne 472** - Route POST `/api/equipment/:id/return`
```javascript
const client = await pool.connect(); // ❌ Devrait être dbClient
```

**Impact** : Ces deux routes utilisent aussi le paramètre `client` dans les données, ce qui crée un conflit de variable. La route PATCH a été corrigée mais pas ces deux-là.

### 2. Erreur colonne dans maintenance_history INSERT

**Ligne 543-544** dans route `/api/equipment/:id/return`
```javascript
INSERT INTO maintenance_history (
  equipment_id, motif_maintenance, note_retour, date_entree  // ❌ motif_maintenance
```

**Correction** : La colonne s'appelle `motif` pas `motif_maintenance` dans la table

### 3. Scripts de migration multiples

Fichiers backend :
- `migrate.js`
- `migrate-history.js`
- `migrate-ca.js`
- `migrate-fix-retour.js`
- `fix-maintenance-history.js`
- `check-and-fix-schema.js`
- `clear-history.js`

**Problème** : Trop de scripts peuvent créer des incohérences. Il faut un seul script de migration master.

## 📋 Plan de correction

### Étape 1 : Corriger server.js
- Renommer toutes les `const client =` en `const dbClient =`
- Corriger la colonne `motif_maintenance` → `motif` dans l'INSERT

### Étape 2 : Nettoyer les scripts de migration
- Garder uniquement `check-and-fix-schema.js` comme référence
- Supprimer les autres scripts devenus obsolètes

### Étape 3 : Tester toutes les fonctionnalités
- Test validation maintenance
- Test retour de location
- Test réservation → location → retour
- Test mise en maintenance depuis parc
