# 🚀 DÉMARRAGE RAPIDE - MagiLoc (Branche Audit)

## ✅ TU AS DÉJÀ FAIT

- ✅ `backend/.env` créé avec DATABASE_URL
- ✅ `frontend/.env` créé
- ✅ Application testée et fonctionnelle

---

## 🔄 SI TU DOIS REDÉMARRER

### 1. Arrêter les processus Node

**PowerShell:**
```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

**Gestionnaire des tâches:**
`Ctrl+Shift+Échap` → Cherche "Node.js" → Fin de tâche

---

### 2. Démarrer le Backend

**Terminal 1:**
```bash
cd backend
npm start
```

**✅ Succès:**
```
✅ Server running on port 5000
```

**❌ Si erreur DB:** Vérifie `backend/.env` contient le bon DATABASE_URL

---

### 3. Démarrer le Frontend

**Terminal 2:**
```bash
cd frontend
npm start
```

Ouvre automatiquement http://localhost:3000

---

## 🧪 TESTS RAPIDES

- [ ] Login fonctionne
- [ ] Dashboard affiche stats
- [ ] Liste équipements se charge
- [ ] Pas d'erreur console (F12)

---

## 🚨 PROBLÈMES COURANTS

### "Connection terminated"
→ Mauvais DATABASE_URL dans `backend/.env`
→ Récupère l'URL depuis Render Dashboard

### "Cannot find module '../data/equipments'"
→ Vide le cache:
```bash
cd frontend
rm -rf node_modules/.cache
npm start
```

### "Port already in use"
→ Tue les processus node (voir étape 1)

---

## 📝 COMMIT & MERGE

```bash
git add .
git commit -m "Audit v1.0.8: Sécurité + Nettoyage"
git checkout main
git merge audit
git push origin main
```

⚠️ **N'oublie pas de roter les credentials Render avant le push production !**

---

**Voir aussi:**
- `AUDIT_REPORT.md` - Rapport complet
- `CONFIGURATION_TESTS_LOCAUX.md` - Setup détaillé
