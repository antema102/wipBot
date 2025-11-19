# Guide de Contribution

Merci de votre intérêt pour contribuer à WipBot ! Ce document explique comment contribuer au projet.

## 🚀 Démarrage Rapide

1. Fork le dépôt
2. Cloner votre fork localement
3. Installer les dépendances: `npm install`
4. Créer une branche pour vos modifications: `git checkout -b feature/ma-fonctionnalite`

## 🔧 Configuration pour le Développement

1. Copier `.env.example` vers `.env`
2. Configurer vos identifiants de test
3. Tester la configuration: `npm run test-config`

## 📝 Standards de Code

### Style de Code
- Utiliser des noms de variables et fonctions descriptifs en anglais
- Commenter le code complexe
- Suivre le style JavaScript standard

### Structure des Commits
- Utiliser des messages de commit clairs et descriptifs
- Format: `type: description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Exemples:
```
feat: add email filtering by sender
fix: correct attachment parsing error
docs: update API documentation
```

## 🧪 Tests

Avant de soumettre une Pull Request:
1. Tester manuellement vos modifications
2. Vérifier que la configuration fonctionne: `npm run test-config`
3. S'assurer qu'aucune régression n'a été introduite

## 🐛 Rapporter des Bugs

Lorsque vous rapportez un bug, incluez:
- Description claire du problème
- Étapes pour reproduire
- Comportement attendu vs comportement actuel
- Version de Node.js utilisée
- Logs d'erreur pertinents

## ✨ Proposer des Fonctionnalités

Pour proposer une nouvelle fonctionnalité:
1. Ouvrir une issue pour discuter de l'idée
2. Attendre les retours avant de commencer le développement
3. Implémenter la fonctionnalité
4. Soumettre une Pull Request

## 📋 Checklist Pull Request

Avant de soumettre:
- [ ] Le code suit les standards du projet
- [ ] Les modifications ont été testées localement
- [ ] La documentation a été mise à jour si nécessaire
- [ ] Les commits sont clairs et bien organisés
- [ ] Aucune donnée sensible n'est incluse

## 🔒 Sécurité

- Ne jamais commiter de credentials ou tokens
- Utiliser `.env` pour les données sensibles
- Signaler les vulnérabilités de sécurité en privé

## 📞 Questions

Pour toute question:
- Ouvrir une issue sur GitHub
- Utiliser le tag `question`

Merci de contribuer à WipBot ! 🎉
