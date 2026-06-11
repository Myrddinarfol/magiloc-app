# 📚 Scripts Utiles - MagiLoc

Guide complet des scripts disponibles pour gérer et maintenir l'application MagiLoc.

---

## 🚀 Démarrage de l'Application

### 1. **Démarrer l'application en développement (Recommandé)**
```bash
npm run dev:all
```
- Lance le **Frontend** (React) sur `http://localhost:3000`
- Lance le **Backend** (Node.js) sur `http://localhost:5000`
- Nettoie automatiquement les anciens processus Node
- **Idéal pour:** Développement local

**Alternative:** Double-cliquez sur le raccourci **MagiApps** sur le bureau

---

### 2. **Démarrer seulement le Frontend**
```bash
npm run start:frontend
```
- Lance uniquement le **Frontend React**
- Utilisé quand le backend est déjà lancé
- Démarrage plus rapide

---

### 3. **Démarrer seulement le Backend**
```bash
cd backend && npm run dev
```
- Lance uniquement le **Backend Node.js**
- Utilisé pour tester l'API seule
- Utilise Nodemon (redémarrage automatique)

---

## 🧹 Nettoyage des Données

### 4. **Nettoyer les données d'Analytics et Performances** ⚠️ **IMPORTANT**
```bash
node backend/cleanup-analytics-data-direct.js
```

**Ce que ce script fait:**
- ✅ Supprime TOUTES les locations historiques
- ✅ Supprime TOUS les CA enregistrés
- ✅ Réinitialise tous les équipements
- ✅ Conserve la structure de la base de données
- ✅ Préserve toutes les formules de calcul

**Quand l'utiliser:**
- 🔴 Après une période d'absences dans le suivi du parc
- 🔴 Quand les données sont faussées ou incohérentes
- 🔴 Pour recommencer sur une base saine

**⚠️ ATTENTION:** Cette action est irréversible! Les données supprimées ne peuvent pas être récupérées.

**Vérification après nettoyage:**
```sql
SELECT COUNT(*) FROM location_history;     -- Doit être 0
SELECT COUNT(*) FROM locations;             -- Doit être 0
SELECT COUNT(*) FROM equipments 
WHERE client IS NOT NULL;                   -- Doit être 0
```

---

## 🔧 Nettoyage des Ports

### 5. **Nettoyer les ports occupés**
```bash
# Avec PowerShell (Windows)
Get-Process | Where-Object { $_.Name -eq "node" } | Stop-Process -Force

# Avec Bash
pkill -9 -f "node"
```

**Quand l'utiliser:**
- Quand vous recevez l'erreur "Port 3000/5000 already in use"
- Après un arrêt forcé de l'application

---

## 📊 Vérification de la Base de Données

### 6. **Vérifier la structure de la base de données**
```bash
psql "postgresql://postgres:MAGILOC25@localhost:5432/magiloc_dev?sslmode=disable" \
  -c "\d equipments"
```

**Affiche:**
- Toutes les colonnes de la table `equipments`
- Les types de données
- Les contraintes

---

### 7. **Vérifier le nombre d'enregistrements**
```bash
psql "postgresql://postgres:MAGILOC25@localhost:5432/magiloc_dev?sslmode=disable" \
  -c "
  SELECT 
    (SELECT COUNT(*) FROM equipments) as total_equipments,
    (SELECT COUNT(*) FROM locations) as active_locations,
    (SELECT COUNT(*) FROM location_history) as historical_locations,
    (SELECT COUNT(*) FROM clients) as total_clients;
  "
```

---

## 🛠️ Maintenance et Développement

### 8. **Réinstaller les dépendances**
```bash
# Frontend
cd frontend && npm install --legacy-peer-deps

# Backend
cd backend && npm install

# Root
npm install
```

**Quand l'utiliser:**
- Après avoir fusionné des modifications de package.json
- Si vous avez des erreurs de module introuvable

---

### 9. **Reconstruire le Frontend**
```bash
cd frontend && npm run build
```

**Génère:**
- Dossier `frontend/build/` avec la version optimisée
- Prêt pour la production

---

### 10. **Vérifier les migrations de base de données**
```bash
ls -la backend/migrations/
```

**Affiche:**
- Toutes les migrations appliquées
- L'ordre d'exécution (001_, 002_, etc.)

---

## 📈 Analytics et Performances

### 11. **Exporter les données d'Analytics** (à venir)
```bash
# À implémenter
```

**Fonctionnalité future:**
- Exporter les données en CSV/JSON
- Générer des rapports

---

## 🔐 Sécurité

### 12. **Audit des données sensibles** (à venir)
```bash
# À implémenter
```

**Fonctionnalité future:**
- Vérifier les données sensibles
- Audit des accès

---

## 📋 Commandes NPM Disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev:all` | Démarrer frontend + backend (Recommandé) |
| `npm run start:frontend` | Démarrer frontend seulement |
| `npm run build` | Construire pour la production |
| `cd backend && npm run dev` | Démarrer backend seulement |

---

## 🚨 Dépannage

### **Erreur: "Port 3000 already in use"**
```bash
pkill -9 -f "node"
npm run dev:all
```

### **Erreur: "Database connection failed"**
- Vérifiez que PostgreSQL est démarré
- Vérifiez les credentials dans `backend/.env`
- Testez la connexion avec psql

### **Erreur: "Module not found"**
```bash
# Réinstallez les dépendances
npm install
cd frontend && npm install --legacy-peer-deps
cd ../backend && npm install
```

---

## 📞 Support

Pour plus d'aide:
- Consultez le fichier `README.md`
- Vérifiez les migrations: `backend/migrations/`
- Contactez l'équipe de développement

---

## 📝 Notes Importantes

✅ **La structure de la base de données est protégée**
- Les migrations ne sont jamais supprimées
- Les colonnes ne disparaissent pas
- Les formules de calcul restent intactes

✅ **Les scripts de nettoyage sont sûrs**
- Seules les DONNÉES sont supprimées
- Les STRUCTURES restent intactes
- Vous pouvez relancer immédiatement

✅ **Les tarifs et configurations persistent**
- Les tarifs journaliers restent en place
- Les forfaits minimums sont conservés
- Les formules de jours ouvrés restent actives

---

**Dernière mise à jour:** 11 Juin 2026
**Version:** 1.0.0
