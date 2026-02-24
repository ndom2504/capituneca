<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🏛️ Capitune - Plateforme de Gestion d'Immigration

Plateforme complète de gestion de dossiers d'immigration avec 4 types d'utilisateurs (Particulier, Professionnel, Partenaire, Admin).

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+ 
- Compte Firebase configuré

### Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos vraies clés Firebase

# 3. Lancer en développement
npm run dev
```

### Configuration Firebase

**⚠️ IMPORTANT:** Éditez `.env.local` avec vos vraies clés Firebase:

```env
VITE_FIREBASE_API_KEY=votre_clé_ici
VITE_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre_projet_id
# ... autres variables (voir .env.example)
```

### Déployer les Security Rules

1. Ouvrez [Firebase Console](https://console.firebase.google.com)
2. Allez dans **Firestore Database → Règles**
3. Copiez le contenu de `firestore.rules` et publiez

---

## 📚 Stack Technique

| Technologie | Version | Usage |
|------------|---------|-------|
| React | 19.2.4 | Framework UI |
| TypeScript | 5.8.2 | Langage (strict mode) |
| Firebase | 12.9.0 | Auth + Firestore |
| Vite | 6.2.0 | Build tool |
| Tailwind CSS | - | Styling |
| Lucide React | 0.564.0 | Icônes |
| Recharts | 3.7.0 | Graphiques|

---

## 🏗️ Architecture

```
capitune-prod/
├── components/          # Composants réutilisables
│   ├── ErrorBoundary.tsx    # ✨ Gestion d'erreurs globale
│   ├── ToastContainer.tsx   # ✨ Notifications
│   ├── ChatWidget.tsx
│   └── Layout.tsx
├── pages/              # Pages de l'application
│   ├── Dashboard.tsx
│   ├── Marketplace.tsx
│   ├── Admin.tsx
│   └── ...
├── services/           # Logique métier + Firestore
│   ├── auth.service.ts      # ✅ Firebase Auth
│   ├── dossier.service.ts   # ✅ Gestion dossiers
│   ├── user.service.ts      # ✅ Profils utilisateurs
│   └── ...
├── utils/
│   └── errorHandler.ts      # ✨ Gestion d'erreurs centralisée
├── types.ts            # Types TypeScript
├── firebase.ts         # ✅ Configuration Firebase
└── App.tsx            # Point d'entrée
```

---

## 🔒 Sécurité

### ✅ Améliorations Février 2026

- **Variables d'environnement sécurisées** avec Vite
- **TypeScript strict mode** activé
- **Firestore Security Rules** production-ready
- **ErrorBoundary React** pour capturer les crashes
- **Gestion d'erreurs centralisée** avec messages FR

### 🛡️ Security Rules Firestore

Les règles de sécurité sont définies dans `firestore.rules` et incluent:
- Lecture/écriture basée sur les rôles (Particulier, Pro, Admin)
- Validation des permissions par collection
- Protection des données sensibles

**⚠️ À déployer dans Firebase Console!**

---

## 👥 Rôles Utilisateurs

| Rôle | Permissions | Couleur |
|------|------------|---------|
| **Particulier** | Gérer ses dossiers | Vert |
| **Professionnel** | Accepter/traiter dossiers | Violet |
| **Partenaire** | Accès institutionnel | Or |
| **Admin** | Contrôle complet | Rouge |

---

## 📖 Documentation

| Fichier | Description |
|---------|-------------|
| [IMPROVEMENTS.md](IMPROVEMENTS.md) | ✅ Résumé des améliorations |
| [MIGRATION.md](MIGRATION.md) | Guide de migration détaillé |
| [firestore.rules](firestore.rules) | Règles de sécurité Firestore |

---

## 🧪 Scripts Disponibles

```bash
npm run dev       # Développement (port 5173)
npm run build     # Build production
npm run preview   # Preview du build
```

---

## 🆕 Nouveautés (v3.1.0)

### Sécurité
- ✨ Variables d'environnement sécurisées
- ✨ TypeScript strict mode
- ✨ Firestore Security Rules complètes

### Architecture
- ✅ Services Firestore (remplacement des mocks)
- ✅ ErrorBoundary React
- ✅ Système de toast notifications
- ✅ Gestion d'erreurs centralisée

### DevEx
- ✨ Types Vite (`vite-env.d.ts`)
- ✨ Documentation complète
- ✨ Messages d'erreur en français

---

## 🐛 Debugging

### Erreurs courantes

**"Firebase configuration is missing"**
→ Vérifiez que `.env.local` contient toutes les variables VITE_

**"Permission denied" Firestore**
→ Déployez les Security Rules depuis `firestore.rules`

**Erreurs TypeScript**
→ Assurez-vous que `strict: true` est dans `tsconfig.json`

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📝 TODO

### Haute Priorité
- [ ] Migrer vers `getCurrentProfile()` async
- [ ] Tests unitaires (Vitest)
- [ ] Validation formulaires (Zod)

### Moyenne Priorité
- [ ] React Query pour cache Firestore
- [ ] CI/CD GitHub Actions
- [ ] E2E tests (Playwright)

### Basse Priorité
- [ ] Monitoring (Sentry)
- [ ] PWA support
- [ ] i18n (EN/FR)

---

## 📧 Support

**Email:** support@capitune.com  
**Documentation:** Voir `MIGRATION.md`

---

## 📄 Licence

Propriétaire - Capitune © 2026

---

<div align="center">
  
**Construit avec ❤️ par l'équipe Capitune**

[🌐 Site](https://capitune.com) • [📚 Docs](MIGRATION.md) • [🐛 Issues](https://github.com/ndom2504/capitune-prod/issues)

</div>
