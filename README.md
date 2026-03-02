# StreamVibe

StreamVibe is a modern, responsive streaming platform interface (Netflix clone) built with React and Vite. It offers a seamless experience for browsing and discovering movies and TV shows, featuring dynamic content rows, infinite scrolling, category filtering, and a personalized watchlist.

## Features

- **Dynamic Content Discovery**: Browse trending movies, new releases, and TV shows through horizontal scrolling rows.
- **Search Functionality**: Quickly find specific movies or TV series with a dedicated search engine.
- **Categories & Filtering**: Navigate between Movies, Series, and customized genres effortlessly.
- **Infinite Scrolling**: Continuously load more content as you scroll down the page.
- **Watchlist (Favorites)**: Add and manage your favorite content to watch later.
- **Authentication**: User login and registration flows (Context-based state management).
- **Responsive Design**: Fully optimized for desktops, tablets, and mobile devices.

## Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context API (`AuthContext`, `DataContext`)
- **Styling**: Vanilla CSS with modern flexbox/grid layouts and CSS variables for theming.

## Project Structure

```text
src/
├── components/
│   ├── common/         # Reusable UI elements (Button, Input, ProtectedRoute)
│   ├── layout/         # Structural components (Navbar, Footer, MainLayout)
│   └── video/          # Video-specific components (HeroSection, MovieRow, VideoCard)
├── context/            # Global state (Auth, Data)
├── hooks/              # Custom React hooks (Infinite Scroll, Local Storage)
├── pages/              # Main route views (Home, Login, Watchlist, VideoDetails)
├── services/           # External API integrations (e.g., TMDB API logic)
├── styles/             # Global CSS and component-specific stylesheets
└── App.jsx             # Main Application routing
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Achraf622-cpu/StreamVibe.git
   cd StreamVibe
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

### Building for Production

To create a production build, run:

```bash
npm run build
```

This will compile the application into the `dist/` folder, ready for deployment.

## License

This project is licensed under the MIT License.
