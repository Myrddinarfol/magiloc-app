# Setup Développement Local - MagiLoc

## Configuration Frontend

### 1. Créer `.env.local` dans le dossier `/frontend`

```env
REACT_APP_API_URL=http://localhost:5000
```

### 2. Installer les dépendances
```bash
cd frontend
npm install --legacy-peer-deps
```

### 3. Lancer le frontend
```bash
npm start
```
Le site sera accessible sur http://localhost:3000

---

## Configuration Backend

### 1. Créer `.env` dans le dossier `/backend`

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/magiloc_db
JWT_SECRET=dev_secret_key_change_in_production
```

**Note:** Remplacez `postgresql://user:password@localhost:5432/magiloc_db` par votre DATABASE_URL de Railway

### 2. Installer les dépendances
```bash
cd backend
npm install
```

### 3. Lancer le backend
```bash
npm start
```
Le serveur API sera accessible sur http://localhost:5000

---

## Workflow de Développement Recommandé

1. **Développer en local** :
   - Frontend tourne sur http://localhost:3000
   - Backend tourne sur http://localhost:5000
   - Tester complètement avant de pusher

2. **Une fois validé** :
   - `git add .`
   - `git commit -m "message"`
   - `git push origin main`

3. **Déploiements automatiques** :
   - GitHub déclenche Vercel (frontend)
   - GitHub déclenche Railway (backend)
   - Vérifier que tout déploie correctement

---

## Points Importants

- ✅ **Toujours tester en local d'abord**
- ✅ **Ne pas committer les `.env` réels**
- ✅ **Utiliser `.env.example` pour documenter les variables**
- ✅ **REACT_APP_API_URL doit pointer vers localhost:5000 en local**
- ✅ **En production, utiliser l'URL Railway**

---

## Troubleshooting

### Le frontend ne peut pas se connecter au backend
- Vérifiez que `REACT_APP_API_URL=http://localhost:5000` dans `.env.local`
- Vérifiez que le backend tourne sur le port 5000
- Vérifiez que CORS est configuré pour localhost:3000

### Le backend ne peut pas accéder à la base de données
- Vérifiez la valeur de DATABASE_URL dans `.env`
- Vérifiez que la base de données est accessible
- Pour Railroad: Utilisez la DATABASE_URL fournie par Railway
