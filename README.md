# Plateforme de Streaming Vidéo - Projet Scolaire

**Étudiant:** [YOUR NAME HERE]  
**Période du projet:** 02/02/26 au 06/02/26

Ce projet est une application web moderne de streaming vidéo (type Netflix) développée avec React.js. Il répond aux exigences du projet scolaire "Frontend Plateforme de Streaming Vidéo" en permettant la découverte, la recherche et la gestion d'une liste de lecture et d'un historique de vidéos.

## 🎯 Fonctionnalités Développées

### 1. Authentification

- Système de connexion et d'inscription fonctionnel.
- Validation des champs (email, mot de passe).
- Stockage et gestion des sessions via `localStorage` (simulé par `AuthContext`).

### 2. Catalogue de Découverte (Accueil)

- Affichage dynamique sous forme de grille et de rangées interactives.
- Filtrage conditionnel par type (Films / Séries) via la barre de navigation.
- Système de recherche global (intégré dans la navbar).

### 3. Informations Vidéo & Lecteur

- Page `VideoDetails` affichant toutes les métadonnées (titre, description, casting).
- Implémentation d'un lecteur externe **embarqué (iframe)**.
- _Note:_ L'application va au-delà des simples trailers demandés et permet le visionnage contextuel de contenus entiers, respectant la consigne stricte du "sans upload/stockage local".
- Bouton d'ajout/suppression de "Ma Liste".

### 4. Ma Liste (Watchlist) & Profil

- Page dédiée affichant tous les contenus sauvegardés.
- Page de **Profil Utilisateur** affichant les statistiques de visionnage réelles (heures regardées, compte des vidéos).
- Synchronisation continue via `DataContext` et `localStorage`.

## 🛠️ Exigences Techniques Validées

- **React Hooks :** Utilisation complète de composants fonctionnels (`useState`, `useEffect`, `useMemo`, `useCallback`).
- **Custom Hooks :** Création et utilisation en production de `useLocalStorage` et d'un complexe `useInfiniteScroll`.
- **Protection des Routes :** Mise en place d'un composant `<ProtectedRoute>` empêchant l'accès sans authentification valide.
- **UI / UX Responsive :** Design adaptatif fonctionnel sur mobile, tablette et desktop via CSS natif (Variables, Flexbox, Grid).
- **Architecture d'État :** Gestion d'état global sans Redux, entièrement gérée par la robustesse de l'API `Context` (AuthContext & DataContext).

## 🌟 Bonus Atteints

- **API Publique Externe :** Intégration complète de l'API **TMDb (The Movie Database)** pour récupérer en temps réel les films, séries, acteurs, recommandations et tendances (`src/services/tmdb.js`).

## 🚀 Installation & Lancement

1. Cloner le repository

   ```bash
   git clone https://github.com/Achraf622-cpu/StreamVibe.git
   cd StreamVibe
   ```

2. Installer les dépendances

   ```bash
   npm install
   ```

3. Lancer le serveur de développement local
   ```bash
   npm run dev
   ```

_(Aucun backend n'est requis. Toutes les données utilisateur sont sauvegardées dans le navigateur via `localStorage`)_

## 🔗 Liens

- **GitHub :** https://github.com/Achraf622-cpu/StreamVibe.git
- **Jira :** [Insérer le lien de votre tableau Jira ici]
