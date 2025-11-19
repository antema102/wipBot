# Guide de Démarrage Rapide

## 🚀 Configuration en 5 Minutes

### Étape 1: Installation

```bash
# Cloner le dépôt
git clone https://github.com/antema102/wipBot.git
cd wipBot

# Installer les dépendances
npm install
```

### Étape 2: Configuration

```bash
# Créer le fichier de configuration
cp .env.example .env
```

Éditer `.env` et configurer:
```env
IMAP_PASSWORD=votre_mot_de_passe_ionos
API_URL=https://votre-api.com/upload
API_KEY=votre_clé_api_optionnelle
```

### Étape 3: Test de Configuration

```bash
npm run test-config
```

Vous devriez voir:
```
✓ Configuration looks good!
```

### Étape 4: Démarrage

**Option A: Node.js Standard**
```bash
npm start
```

**Option B: Docker**
```bash
docker-compose up -d
docker-compose logs -f
```

## 🧪 Test Local

Pour tester localement sans API réelle:

1. **Terminal 1** - Démarrer le serveur exemple:
```bash
# Installer les dépendances du serveur exemple
npm install express multer

# Démarrer le serveur
node examples/api-server-example.js
```

2. **Terminal 2** - Configurer pour le test local:
```bash
# Éditer .env
echo "API_URL=http://localhost:3000/upload" >> .env

# Démarrer le bot
npm start
```

3. **Envoyer un email de test** à `recrutement@wipwork.com` avec un CV en pièce jointe

4. **Vérifier les logs** - Le bot devrait détecter l'email et envoyer le CV au serveur local

## 📧 Configuration Email IONOS

Si vous devez configurer les paramètres IONOS:

### Serveur IMAP (Réception)
- Serveur: `imap.ionos.fr`
- Port: `993`
- Sécurité: `SSL/TLS`
- Email: `recrutement@wipwork.com`

### Serveur SMTP (Envoi - référence)
- Serveur: `smtp.ionos.fr`
- Port: `465`
- Sécurité: `SSL/TLS`

## 🔍 Vérification

Le bot fonctionne correctement si vous voyez:

```
CV Automation Bot started
Checking for new emails every 60 seconds
Monitoring: recrutement@wipwork.com

=== Starting CV processing ===
✓ Connected to IMAP server
Found X unread email(s)
...
```

## ❓ Problèmes Courants

### "IMAP connection error"
- Vérifier le mot de passe dans `.env`
- Vérifier que le compte IONOS est actif
- Vérifier la connexion internet

### "No API_URL configured"
- Configurer `API_URL` dans `.env`
- Pour tester: utiliser le serveur exemple

### "No unread emails found"
- C'est normal si aucun email n'a été reçu
- Le bot continue de surveiller automatiquement

## 📚 Documentation Complète

- [README.md](README.md) - Documentation complète
- [CONTRIBUTING.md](CONTRIBUTING.md) - Guide de contribution
- [examples/README.md](examples/README.md) - Exemples d'utilisation

## 🆘 Support

En cas de problème:
1. Consulter les logs du bot
2. Vérifier la configuration avec `npm run test-config`
3. Ouvrir une issue sur GitHub avec les détails

---

**Prêt à automatiser vos CVs!** 🎉
