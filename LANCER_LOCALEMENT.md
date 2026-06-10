# 🚀 Lancer MagiLoc en Local

## Option 1: Raccourci Bureau (Recommandé)

✅ **Le plus simple!** Un raccourci `MagiLoc` a été créé sur votre bureau.

1. **Double-cliquez** sur le raccourci `MagiLoc` sur le bureau
2. Une fenêtre s'ouvrira avec les logs des deux serveurs
3. Le frontend s'ouvrira automatiquement à: **http://localhost:3000**
4. Le backend tournera sur: **http://localhost:5000**

Pour arrêter l'application, appuyez sur **Ctrl+C** dans la fenêtre.

---

## Option 2: Ligne de Commande

### Depuis le répertoire du projet

```bash
npm run dev:all
```

Cela lance les deux serveurs (Frontend + Backend) en parallèle.

---

## Option 3: Scripts Individuels

Si vous préférez lancer le frontend et backend séparément:

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Le backend démarre sur `http://localhost:5000`

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```
Le frontend démarre sur `http://localhost:3000`

---

## 🔧 Prérequis

- **Node.js 18+** - [Installer Node.js](https://nodejs.org/)
- **npm** - Installé avec Node.js

Vérifiez que Node.js est installé:
```bash
node --version
npm --version
```

---

## 📝 Que font les scripts?

### `start-dev.js`
- Lance le backend en mode développement (`npm run dev`)
- Attend 3 secondes, puis lance le frontend (`npm start`)
- Les deux tournent en parallèle dans la même fenêtre
- Affiche les logs de chaque serveur

### `run-magiloc.bat`
- Script Windows qui exécute `npm run dev:all`
- Vérifie que Node.js est installé
- Affiche les URLs pour accéder à l'app
- Pause avant de fermer si erreur

---

## 🐛 Dépannage

### Port déjà utilisé
Si vous avez une erreur comme `EADDRINUSE`, c'est qu'un port est déjà occupé.

**Solution**: 
- Fermez l'autre application qui utilise le port
- Ou modifiez les ports dans:
  - Frontend: `frontend/package.json` → `"start": "PORT=3001 react-scripts start"`
  - Backend: `backend/server.js` → `const PORT = process.env.PORT || 5001`

### Node.js non trouvé
Si le script dit que Node.js n'est pas installé:
- Installez Node.js depuis https://nodejs.org/
- Redémarrez votre terminal après installation

### Modules manquants
Si vous avez une erreur `Cannot find module`:
```bash
cd backend && npm install
cd ../frontend && npm install --legacy-peer-deps
```

---

## 💾 Développement

Les changements au code sont **auto-rechargés** (hot reload):
- **Frontend**: React avec Webpack dev server
- **Backend**: Nodemon détecte les changements

Pas besoin de redémarrer l'app, juste recharger la page navigateur.

---

## 🌐 Accès

Une fois lancée, l'application est accessible à:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/...

---

## ✨ Tips

- Gardez les deux serveurs lancés pendant le développement
- Les logs affichent les requêtes API et les erreurs
- Utilisez les DevTools du navigateur (F12) pour déboguer le frontend
- Consultez `backend/server.js` pour les endpoints disponibles

Bon développement! 🎉
