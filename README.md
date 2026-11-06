# MUI Notes

A responsive, local-first note-taking app built with React and the official [MUI Material UI](https://mui.com/material-ui/) component library. The interface uses MUI's standard component defaults rather than a custom design system.

## Features

- Create and edit notes with automatic browser saving
- Search note titles, body text, categories, and tags
- Add multiple comma-separated tags and filter notes by tag
- Use custom category names
- Sort by recently updated, recently created, oldest updated, or title
- Create notes from blank, meeting, to-do, journal, and project templates
- Duplicate notes
- Favorites, pinned notes, archive, trash, restore, and permanent deletion
- Editor word count, character count, and estimated reading time
- Keyboard shortcuts: `Ctrl/Cmd + N` for a new note and `Ctrl/Cmd + F` to focus search
- Light and dark palette modes
- Import and export JSON backups
- Responsive desktop and mobile layouts
- Local-first storage using the browser's `localStorage`

> Notes are stored in the current browser on the current device. They are not synchronized between devices or browsers. Use Export notes to keep a backup before clearing browser data.

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

In the repository, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**. The Vite base path is configured for `/MUI-Notes/`.

## MUI

The interface uses components from `@mui/material` and the official `@mui/icons-material` package. It keeps MUI's built-in component styling and theme defaults.
