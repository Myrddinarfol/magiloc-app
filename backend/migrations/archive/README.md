# 📁 Migrations Archivées - MagiLoc

⚠️ **Scripts exécutés UNE SEULE FOIS** - Conservés pour référence

---

## 2025-10-07 - init-render.js
**But:** Initialisation schéma sur nouvelle base Render
**Status:** ✅ Exécuté
**Tables créées:** equipments, locations, location_history, maintenance_history

---

## 2025-10-08 - convert-offre.js
**But:** Conversion "Offre de Prix" → "En Réservation"
**Status:** ✅ Exécuté (5 équipements)
**SQL:**
```sql
UPDATE equipments
SET statut = 'En Réservation'
WHERE statut ILIKE '%offre%'
```

---

## 2025-10-08 - fix-return.js
**But:** Ajout colonne `debut_maintenance` + rename `date_fin_theorique`
**Status:** ✅ Exécuté
**Impact:** Fix HTTP 500 sur route `/api/equipment/:id/return`

---

## 2025-10-09 - maintenance-history.js
**But:** Ajout colonne `duree_jours`
**Status:** ✅ Exécuté

---

## 🔧 Créer une Nouvelle Migration

1. Créer fichier `backend/migrations/YYYY-MM-DD_description.js`
2. Utiliser `process.env.DATABASE_URL` (JAMAIS credentials hardcodés)
3. Tester sur base locale d'abord
4. Documenter ici après exécution
5. Archiver le script

---

**Dernière mise à jour:** 2025-10-09
