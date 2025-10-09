# 🧪 CONFIGURATION TESTS LOCAUX - MagiLoc

## 🎯 Objectif
Tester la branche `audit` avant merge sur `main`

---

## 🟢 OPTION 1 : Base Render (RECOMMANDÉ)

### Avantages
✅ Pas d'install PostgreSQL
✅ Vraies données de prod
✅ Configuration 2 minutes

### Procédure

**1. Récupérer credentials Render**
- Va sur https://dashboard.render.com
- Clique sur database `magiloc_mt5o`
- Copie l'**External Database URL**

**2. Créer backend/.env**
```env
DATABASE_URL=COLLE_ICI_URL_RENDER
PORT=5000
NODE_ENV=development
```

**3. Créer frontend/.env**
```env
REACT_APP_API_URL=http://localhost:5000
```

**4. Démarrer**
```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm start
```

---

## 🔵 OPTION 2 : PostgreSQL Local

### Installation PostgreSQL

**Windows:**
1. Télécharge https://www.postgresql.org/download/windows/
2. Installe (mot de passe `postgres`)
3. Créer la base:
```bash
psql -U postgres
CREATE DATABASE magiloc;
\q
```

**4. Initialiser le schéma**
```bash
cd backend
node reset-db.js
# Tape "OUI"
```

**5. Créer backend/.env**
```env
DATABASE_URL=postgresql://postgres:TON_MOT_DE_PASSE@localhost:5432/magiloc
PORT=5000
NODE_ENV=development
```

**6. Importer des données**
- Lance backend et frontend
- Utilise "IMPORTER CSV" dans l'app

---

## 🚨 DÉPANNAGE

### Connection failed
→ Vérifie DATABASE_URL correct
→ Sur Render: autorise ton IP

### Password authentication failed
→ Vérifie le mot de passe PostgreSQL

### Frontend ne charge pas
→ Vérifie backend tourne: http://localhost:5000/api/health
→ Vérifie frontend/.env correct

---

## ✅ CHECKLIST TESTS

### Backend
- [ ] http://localhost:5000/api/health OK
- [ ] http://localhost:5000/api/equipment retourne data

### Frontend
- [ ] Login OK
- [ ] Dashboard affiche stats
- [ ] CRUD équipements OK
- [ ] Import CSV OK

---

**Voir aussi:** `AUDIT_REPORT.md` section "Tests"
