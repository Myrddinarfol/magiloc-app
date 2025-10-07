# 🔧 MagiLoc - Configuration Multi-Environnement

Ce guide explique comment configurer et utiliser les différents environnements de base de données pour développer en toute sécurité.

## 📋 Vue d'ensemble

MagiLoc supporte **3 environnements distincts** :

| Environnement | Usage | Base de données |
|--------------|-------|----------------|
| 🟢 **development** | PC Maison (local) | PostgreSQL local (`magiloc_dev`) |
| 🟡 **work** | PC Travail (local) | PostgreSQL local (`magiloc_dev`) |
| 🔴 **production** | Déploiement Render | PostgreSQL cloud Render |

## 🚀 Démarrage rapide

### 1️⃣ Sur votre PC Maison (development)

```powershell
cd backend
$env:NODE_ENV="development"
npm start
```

### 2️⃣ Sur votre PC Travail (work)

```powershell
cd backend
$env:NODE_ENV="work"
npm start
```

### 3️⃣ En production (Render)

Le serveur Render utilise automatiquement `.env.production` via la variable d'environnement `NODE_ENV=production`.

## 📁 Fichiers de configuration

Trois fichiers `.env` ont été créés à la racine du projet :

### `.env.development` (PC Maison)
```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=magiloc_dev
DB_USER=postgres
DB_PASSWORD=magiloc25
DB_SSL=false
PORT=5001
```

### `.env.work` (PC Travail)
```env
NODE_ENV=work
DB_HOST=localhost
DB_PORT=5432
DB_NAME=magiloc_dev
DB_USER=postgres
DB_PASSWORD=magiloc25
DB_SSL=false
PORT=5001
```

### `.env.production` (Render)
```env
NODE_ENV=production
DB_HOST=dpg-d3cpaq24d50c73coqc70-a.frankfurt-postgres.render.com
DB_PORT=5432
DB_NAME=magiloc
DB_USER=magiloc_user
DB_PASSWORD=WXI3h9gX0txmMzmOIo3bho6L6MmeEeXb
DB_SSL=true
PORT=5001
```

## 🎨 Affichage au démarrage

Lorsque vous lancez le serveur, vous verrez un affichage clair indiquant l'environnement actif :

```
══════════════════════════════════════════════════════════════════════
  🗄️  MAGILOC - CONFIGURATION BASE DE DONNÉES
══════════════════════════════════════════════════════════════════════

  Environnement: 🟢 DEVELOPMENT (Local)
  Base de données: magiloc_dev
  Hôte: localhost:5432
  SSL: Désactivé
  Fichier config: .env.development

══════════════════════════════════════════════════════════════════════

✅ Connexion à la base de données établie avec succès !
```

## 🛠️ Installation PostgreSQL local

### Sur Windows (via PostgreSQL Installer)

1. Téléchargez PostgreSQL : https://www.postgresql.org/download/windows/
2. Installez PostgreSQL avec le mot de passe `magiloc25` pour l'utilisateur `postgres`
3. Créez la base de données locale :

```powershell
# Ouvrir PowerShell
psql -U postgres
# Entrez le mot de passe: magiloc25

# Dans psql:
CREATE DATABASE magiloc_dev;
\q
```

### Initialisation du schéma

Une fois PostgreSQL installé et la base créée, initialisez le schéma :

```powershell
cd backend
$env:NODE_ENV="development"
npm run reset-db
```

## 🔄 Commande de réinitialisation

Pour **réinitialiser complètement** votre base de données locale :

```powershell
cd backend
$env:NODE_ENV="development"  # ou "work"
npm run reset-db
```

⚠️ **ATTENTION** : Cette commande :
- Supprime TOUTES les tables
- Recrée le schéma complet
- EFFACE toutes les données
- Demande confirmation (`OUI` en majuscules)
- **BLOQUÉE en production** pour sécurité

## 📊 Structure du schéma

Le fichier `backend/database/schema.sql` contient :

### Tables principales
- **equipments** : Matériel du parc (avec `note_retour`)
- **locations** : Locations actives
- **location_history** : Historique des locations (avec CA: `duree_jours_ouvres`, `prix_ht_jour`, `remise_ld`, `ca_total_ht`)
- **maintenance_history** : Historique des maintenances

### Index de performance
- Index sur `statut`, `numero_serie`, `prochain_vgp`
- Index sur les clés étrangères
- Index sur les colonnes de date et CA

## 🔒 Sécurité

### Protection production
Le script `reset-db.js` **refuse catégoriquement** de s'exécuter en production :

```javascript
if (NODE_ENV === 'production') {
  console.log('❌ ERREUR: Impossible de réinitialiser la base PRODUCTION !');
  process.exit(1);
}
```

### Variables sensibles
Les fichiers `.env.*` contiennent des mots de passe :
- ⚠️ **NE JAMAIS** committer ces fichiers sur GitHub
- ✅ Ils sont dans `.gitignore`
- ✅ Seuls `.env.development` et `.env.work` sont en local

## 🎯 Workflow de développement

### Scénario 1 : Développement sur PC Maison

```powershell
# Terminal 1 : Backend
cd backend
$env:NODE_ENV="development"
npm start

# Terminal 2 : Frontend
cd frontend
npm start
```

### Scénario 2 : Développement sur PC Travail

```powershell
# Terminal 1 : Backend
cd backend
$env:NODE_ENV="work"
npm start

# Terminal 2 : Frontend
cd frontend
npm start
```

### Scénario 3 : Synchronisation des données

Si vous voulez **synchroniser** les données entre vos deux PC :

1. **Exporter** depuis un environnement :
```powershell
pg_dump -U postgres -d magiloc_dev > backup.sql
```

2. **Importer** vers l'autre environnement :
```powershell
psql -U postgres -d magiloc_dev < backup.sql
```

## 🐛 Dépannage

### Erreur : "database does not exist"
```powershell
psql -U postgres
CREATE DATABASE magiloc_dev;
\q
```

### Erreur : "password authentication failed"
Vérifiez que le mot de passe dans `.env.development` ou `.env.work` est correct (`magiloc25`).

### Erreur : "relation does not exist"
Le schéma n'est pas initialisé. Lancez :
```powershell
npm run reset-db
```

### Le serveur se connecte au mauvais environnement
Vérifiez que `NODE_ENV` est bien défini **avant** `npm start` :
```powershell
$env:NODE_ENV="development"
npm start
```

## 📝 Notes importantes

1. **Par défaut** : Si `NODE_ENV` n'est pas défini, le système utilise `development`
2. **Render** : En production, Render définit automatiquement `NODE_ENV=production`
3. **Schéma synchronisé** : Le fichier `schema.sql` est maintenant **100% synchronisé** avec Render
4. **Colonnes ajoutées** :
   - `equipments.note_retour`
   - `location_history.date_retour_reel`, `note_retour`, `rentre_le`
   - `location_history.duree_jours_ouvres`, `prix_ht_jour`, `remise_ld`, `ca_total_ht`
   - Table complète `maintenance_history`

## 🎓 Exemple complet

```powershell
# 1. Cloner le projet (déjà fait)
cd c:\Users\kevin\Desktop\Apprentissage Python VScode\magiLoc

# 2. Installer PostgreSQL local
# (Suivre les instructions d'installation ci-dessus)

# 3. Créer la base de données
psql -U postgres
CREATE DATABASE magiloc_dev;
\q

# 4. Initialiser le schéma
cd backend
$env:NODE_ENV="development"
npm run reset-db
# Taper: OUI

# 5. Lancer le backend
npm start

# 6. Vérifier la connexion
# Vous devriez voir:
# ✅ Connexion à la base de données établie avec succès !

# 7. Lancer le frontend (nouveau terminal)
cd ../frontend
npm start
```

## 🔗 Ressources

- [Documentation PostgreSQL](https://www.postgresql.org/docs/)
- [Node.js dotenv](https://www.npmjs.com/package/dotenv)
- [Render PostgreSQL](https://render.com/docs/databases)

---

✅ **Configuration terminée !** Vous pouvez maintenant développer en toute sécurité sans risque pour la base de production.
