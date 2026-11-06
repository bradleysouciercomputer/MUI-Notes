# MUI Notes

A responsive note-taking app built with React and the official [MUI Material UI](https://mui.com/material-ui/) component library.

## Features

- Create and edit notes with automatic saving
- Search note titles, content, and categories
- Favorites, pinned notes, archive, and trash
- Note categories and soft background colors
- Light and dark themes
- Import and export JSON backups
- Responsive desktop and mobile layouts
- Local-first storage using the browser's `localStorage`

> Notes are stored in the current browser on the current device. They are not synchronized between devices or browsers. Use Export backup to keep a copy.

## Development

Requires Node.js 20 or later.

```bash
npm install
npm run dev
```

Build the production site:

```bash
npm run build
npm run preview
```

## GitHub Pages

The repository includes a GitHub Actions workflow that builds and deploys the site to GitHub Pages on every push to `main`.

In the repository, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**. The Vite base path is already configured for `/MUI-Notes/`.

## MUI

The interface uses MUI Material UI components, MUI's Emotion styling engine, and the official MUI Material Icons package.
