import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
  createTheme,
} from '@mui/material';
import NotesRounded from '@mui/icons-material/NotesRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StarOutlineRounded from '@mui/icons-material/StarOutlineRounded';
import PushPinRounded from '@mui/icons-material/PushPinRounded';
import PushPinOutlined from '@mui/icons-material/PushPinOutlined';
import ArchiveOutlined from '@mui/icons-material/ArchiveOutlined';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import RestoreFromTrashRounded from '@mui/icons-material/RestoreFromTrashRounded';
import LightModeRounded from '@mui/icons-material/LightModeRounded';
import DarkModeRounded from '@mui/icons-material/DarkModeRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import PaletteOutlined from '@mui/icons-material/PaletteOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import FileUploadOutlined from '@mui/icons-material/FileUploadOutlined';
import AllInboxRounded from '@mui/icons-material/AllInboxRounded';
import FavoriteBorderRounded from '@mui/icons-material/FavoriteBorderRounded';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import MenuBookRounded from '@mui/icons-material/MenuBookRounded';

const STORAGE_KEY = 'mui-notes-data-v1';
const MODE_KEY = 'mui-notes-mode-v1';
const CATEGORIES = ['Personal', 'Work', 'Ideas', 'Study', 'Journal'];
const NOTE_COLORS = [
  { name: 'Default', value: '#ffffff' },
  { name: 'Lavender', value: '#f0edff' },
  { name: 'Blue', value: '#e8f2ff' },
  { name: 'Mint', value: '#e6f6ef' },
  { name: 'Peach', value: '#fff0e6' },
  { name: 'Yellow', value: '#fff7d6' },
  { name: 'Rose', value: '#ffedf1' },
];

const starterNotes = [
  {
    id: 'welcome-note',
    title: 'A little space to think',
    body: 'Welcome to MUI Notes!\n\nCreate notes, collect ideas, and keep the little details that matter. Everything is saved automatically in this browser.\n\nTip: use the pin and star buttons to keep important notes close.',
    category: 'Personal',
    color: '#f0edff',
    favorite: true,
    pinned: true,
    archived: false,
    trashed: false,
    createdAt: '2026-11-05T14:00:00.000Z',
    updatedAt: '2026-11-05T14:00:00.000Z',
  },
  {
    id: 'project-ideas',
    title: 'Ideas for the next project',
    body: 'A few things to explore:\n\n• Keep the interface focused and calm\n• Make the small interactions feel great\n• Start with the essentials, then add polish\n• Leave room for new ideas',
    category: 'Ideas',
    color: '#e6f6ef',
    favorite: false,
    pinned: false,
    archived: false,
    trashed: false,
    createdAt: '2026-11-04T16:20:00.000Z',
    updatedAt: '2026-11-04T16:20:00.000Z',
  },
  {
    id: 'weekly-planning',
    title: 'A simple weekly reset',
    body: '1. Clear the desk and inbox\n2. Pick three priorities\n3. Make time for focused work\n4. Leave a little room for something fun',
    category: 'Work',
    color: '#fff7d6',
    favorite: false,
    pinned: false,
    archived: false,
    trashed: false,
    createdAt: '2026-11-02T10:15:00.000Z',
    updatedAt: '2026-11-02T10:15:00.000Z',
  },
];

function readNotes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return starterNotes;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : starterNotes;
  } catch {
    return starterNotes;
  }
}

function formatDate(value) {
  if (!value) return 'Just now';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
}

function formatLongDate(value) {
  const date = new Date(value || Date.now());
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `note-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function NavItem({ icon, label, count, active, onClick }) {
  return (
    <Button
      fullWidth
      onClick={onClick}
      startIcon={icon}
      endIcon={count > 0 ? <Typography component="span" variant="caption" sx={{ color: active ? 'primary.main' : 'text.disabled', fontWeight: 700 }}>{count}</Typography> : null}
      sx={{
        justifyContent: 'flex-start',
        minHeight: 44,
        px: 1.6,
        borderRadius: 2.5,
        color: active ? 'primary.main' : 'text.secondary',
        bgcolor: active ? 'action.selected' : 'transparent',
        fontWeight: active ? 700 : 500,
        '& .MuiButton-startIcon': { mr: 1.5, color: active ? 'primary.main' : 'text.secondary' },
        '&:hover': { bgcolor: active ? 'action.selected' : 'action.hover' },
      }}
    >
      {label}
    </Button>
  );
}

function App() {
  const [notes, setNotes] = useState(readNotes);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem(MODE_KEY) || 'light'; } catch { return 'light'; }
  });
  const [snack, setSnack] = useState('');
  const [importInputKey, setImportInputKey] = useState(0);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); } catch { setSnack('Browser storage is full. Export notes to keep a backup.'); }
  }, [notes]);

  useEffect(() => {
    try { localStorage.setItem(MODE_KEY, mode); } catch { /* storage is optional */ }
  }, [mode]);

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: mode === 'light' ? '#5266d5' : '#a9b5ff', contrastText: '#ffffff' },
      background: mode === 'light'
        ? { default: '#f7f8fc', paper: '#ffffff' }
        : { default: '#111522', paper: '#1b2130' },
      text: mode === 'light'
        ? { primary: '#202438', secondary: '#687087' }
        : { primary: '#eef0f8', secondary: '#aab1c4' },
      divider: mode === 'light' ? '#e9ebf2' : '#30384a',
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      h4: { fontWeight: 750, letterSpacing: '-0.04em' },
      h5: { fontWeight: 700, letterSpacing: '-0.03em' },
      button: { textTransform: 'none', fontWeight: 650, letterSpacing: 0 },
    },
    components: {
      MuiButton: { styleOverrides: { root: { borderRadius: 11, boxShadow: 'none' } } },
      MuiIconButton: { styleOverrides: { root: { borderRadius: 11 } } },
      MuiCard: { styleOverrides: { root: { borderRadius: 18 } } },
      MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 12 } } },
    },
  }), [mode]);

  const activeNote = notes.find((note) => note.id === activeId) || null;
  const counts = useMemo(() => ({
    all: notes.filter((note) => !note.archived && !note.trashed).length,
    favorites: notes.filter((note) => note.favorite && !note.archived && !note.trashed).length,
    archived: notes.filter((note) => note.archived && !note.trashed).length,
    trash: notes.filter((note) => note.trashed).length,
  }), [notes]);

  const visibleNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return notes
      .filter((note) => {
        if (filter === 'favorites' && (!note.favorite || note.archived || note.trashed)) return false;
        if (filter === 'archived' && (!note.archived || note.trashed)) return false;
        if (filter === 'trash' && !note.trashed) return false;
        if (filter === 'all' && (note.archived || note.trashed)) return false;
        if (!normalizedQuery) return true;
        return [note.title, note.body, note.category].some((value) => (value || '').toLowerCase().includes(normalizedQuery));
      })
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [notes, filter, query]);

  const updateNote = (id, patch) => {
    setNotes((current) => current.map((note) => note.id === id
      ? { ...note, ...patch, updatedAt: new Date().toISOString() }
      : note));
  };

  const createNote = () => {
    const now = new Date().toISOString();
    const note = {
      id: makeId(),
      title: '',
      body: '',
      category: 'Personal',
      color: '#ffffff',
      favorite: false,
      pinned: false,
      archived: false,
      trashed: false,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((current) => [note, ...current]);
    setFilter('all');
    setQuery('');
    setActiveId(note.id);
  };

  const toggleFavorite = (note) => updateNote(note.id, { favorite: !note.favorite });
  const togglePin = (note) => updateNote(note.id, { pinned: !note.pinned });

  const moveToTrash = (id) => {
    updateNote(id, { trashed: true, archived: false });
    setActiveId(null);
    setSnack('Moved to trash');
  };

  const restoreNote = (id) => {
    updateNote(id, { trashed: false });
    setSnack('Note restored');
  };

  const archiveNote = (id) => {
    updateNote(id, { archived: true });
    setActiveId(null);
    setSnack('Note archived');
  };

  const permanentlyDelete = (id) => {
    if (!window.confirm('Permanently delete this note? This cannot be undone.')) return;
    setNotes((current) => current.filter((note) => note.id !== id));
    setActiveId(null);
    setSnack('Note permanently deleted');
  };

  const exportNotes = () => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mui-notes-backup.json';
    link.click();
    URL.revokeObjectURL(url);
    setSnack('Notes backup downloaded');
  };

  const importNotes = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed) || parsed.some((item) => !item || typeof item !== 'object' || typeof item.id !== 'string')) {
          throw new Error('Invalid notes file');
        }
        const cleaned = parsed.map((item) => ({
          id: item.id,
          title: String(item.title || ''),
          body: String(item.body || ''),
          category: CATEGORIES.includes(item.category) ? item.category : 'Personal',
          color: NOTE_COLORS.some((color) => color.value === item.color) ? item.color : '#ffffff',
          favorite: Boolean(item.favorite),
          pinned: Boolean(item.pinned),
          archived: Boolean(item.archived),
          trashed: Boolean(item.trashed),
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        }));
        setNotes(cleaned);
        setActiveId(null);
        setSnack('Notes imported successfully');
      } catch {
        setSnack('That file could not be read as a MUI Notes backup');
      }
      setImportInputKey((value) => value + 1);
    };
    reader.readAsText(file);
  };

  const titleByFilter = {
    all: 'All notes',
    favorites: 'Favorites',
    archived: 'Archived',
    trash: 'Trash',
  };

  const nav = (
    <Stack spacing={0.7}>
      <NavItem icon={<AllInboxRounded fontSize="small" />} label="All notes" count={counts.all} active={filter === 'all'} onClick={() => setFilter('all')} />
      <NavItem icon={<FavoriteBorderRounded fontSize="small" />} label="Favorites" count={counts.favorites} active={filter === 'favorites'} onClick={() => setFilter('favorites')} />
      <NavItem icon={<Inventory2Outlined fontSize="small" />} label="Archived" count={counts.archived} active={filter === 'archived'} onClick={() => setFilter('archived')} />
      <NavItem icon={<DeleteOutlineRounded fontSize="small" />} label="Trash" count={counts.trash} active={filter === 'trash'} onClick={() => setFilter('trash')} />
    </Stack>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
        <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Toolbar sx={{ minHeight: '76px !important', px: { xs: 2, md: 3 }, gap: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1.4} sx={{ minWidth: { md: 220 } }}>
              <Box sx={{ width: 42, height: 42, display: 'grid', placeItems: 'center', borderRadius: 3, bgcolor: 'primary.main', color: '#fff' }}>
                <NotesRounded />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.1 }}>MUI Notes</Typography>
                <Typography variant="caption" color="text.secondary">Your thoughts, in one place</Typography>
              </Box>
            </Stack>

            <TextField
              size="small"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your notes..."
              aria-label="Search notes"
              sx={{
                flex: 1,
                maxWidth: 560,
                mx: 'auto',
                display: { xs: 'none', sm: 'flex' },
                '& .MuiOutlinedInput-root': { bgcolor: 'background.default', borderRadius: 3 },
              }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" color="action" /></InputAdornment>,
                },
              }}
            />

            <Stack direction="row" spacing={0.7} alignItems="center" sx={{ ml: 'auto' }}>
              <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
                <IconButton aria-label="Toggle color theme" onClick={() => setMode((value) => value === 'light' ? 'dark' : 'light')}>
                  {mode === 'light' ? <DarkModeRounded /> : <LightModeRounded />}
                </IconButton>
              </Tooltip>
              <Button variant="contained" startIcon={<AddRounded />} onClick={createNote} sx={{ px: { xs: 1.5, sm: 2.2 }, py: 1.1 }}>
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>New note</Box>
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>New</Box>
              </Button>
            </Stack>
          </Toolbar>
          <Box sx={{ display: { xs: 'block', sm: 'none' }, px: 2, pb: 1.6 }}>
            <TextField
              size="small"
              fullWidth
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your notes..."
              aria-label="Search notes"
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" color="action" /></InputAdornment> } }}
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default', borderRadius: 3 } }}
            />
          </Box>
        </AppBar>

        <Box sx={{ display: 'flex', maxWidth: 1600, mx: 'auto', minHeight: 'calc(100vh - 76px)' }}>
          <Box
            component="aside"
            sx={{
              width: 252,
              flexShrink: 0,
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              p: 2.5,
              borderRight: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="overline" color="text.secondary" sx={{ px: 1.6, mb: 1.1, fontWeight: 700, letterSpacing: 1.1 }}>Workspace</Typography>
            {nav}
            <Box sx={{ flex: 1 }} />
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1.1}>
              <Typography variant="caption" color="text.secondary" sx={{ px: 1.2 }}>Keep your notes safe</Typography>
              <Button fullWidth variant="outlined" color="inherit" startIcon={<FileDownloadOutlined />} onClick={exportNotes} sx={{ justifyContent: 'flex-start', borderColor: 'divider', color: 'text.secondary' }}>
                Export backup
              </Button>
              <Button component="label" fullWidth variant="outlined" color="inherit" startIcon={<FileUploadOutlined />} sx={{ justifyContent: 'flex-start', borderColor: 'divider', color: 'text.secondary' }}>
                Import backup
                <input key={importInputKey} hidden type="file" accept="application/json,.json" onChange={importNotes} />
              </Button>
              <Typography variant="caption" color="text.disabled" sx={{ px: 1.2, pt: 0.5, lineHeight: 1.5 }}>
                Notes are saved in this browser. Export a backup before clearing browser data.
              </Typography>
            </Stack>
          </Box>

          <Box component="main" sx={{ flex: 1, minWidth: 0, p: { xs: 2, sm: 3.5, lg: 5 } }}>
            <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 0.7, overflowX: 'auto', pb: 2.5, mb: 1, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
              {[
                ['all', 'All notes', AllInboxRounded, counts.all],
                ['favorites', 'Favorites', FavoriteBorderRounded, counts.favorites],
                ['archived', 'Archived', Inventory2Outlined, counts.archived],
                ['trash', 'Trash', DeleteOutlineRounded, counts.trash],
              ].map(([key, label, Icon, count]) => (
                <Chip
                  key={key}
                  icon={<Icon />}
                  label={`${label} · ${count}`}
                  onClick={() => setFilter(key)}
                  color={filter === key ? 'primary' : 'default'}
                  variant={filter === key ? 'filled' : 'outlined'}
                  sx={{ flexShrink: 0, fontWeight: 600 }}
                />
              ))}
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'flex-end' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 3.2 }}>
              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1.2 }}>YOUR WORKSPACE</Typography>
                <Typography variant="h4" sx={{ mt: 0.25 }}>{titleByFilter[filter]}</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.7 }}>
                  {filter === 'trash' ? 'Notes here can be restored or permanently removed.' : 'A clear space for everything on your mind.'}
                </Typography>
              </Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" color="text.secondary">{visibleNotes.length} {visibleNotes.length === 1 ? 'note' : 'notes'}</Typography>
                {filter !== 'trash' && (
                  <Button variant="contained" startIcon={<AddRounded />} onClick={createNote} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
                    Create note
                  </Button>
                )}
              </Stack>
            </Stack>

            {visibleNotes.length > 0 ? (
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 265px), 1fr))',
                gap: 2,
                alignItems: 'stretch',
              }}>
                {visibleNotes.map((note) => (
                  <Card
                    key={note.id}
                    onClick={() => setActiveId(note.id)}
                    onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setActiveId(note.id); }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Open note ${note.title || 'Untitled note'}`}
                    sx={{
                      cursor: 'pointer',
                      minHeight: 218,
                      bgcolor: mode === 'light' ? (note.color || '#fff') : 'background.paper',
                      border: 1,
                      borderColor: 'divider',
                      boxShadow: '0 2px 8px rgba(25, 35, 75, 0.025)',
                      transition: 'transform .18s ease, box-shadow .18s ease, border-color .18s ease',
                      '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 28px rgba(25, 35, 75, 0.09)', borderColor: 'primary.light' },
                      '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.light', outlineOffset: 2 },
                    }}
                  >
                    <CardContent sx={{ p: 2.4, '&:last-child': { pb: 2.4 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 1.6 }}>
                        <Chip label={note.category || 'Personal'} size="small" sx={{ bgcolor: mode === 'light' ? 'rgba(255,255,255,.66)' : 'action.selected', fontWeight: 600, maxWidth: 125 }} />
                        <Stack direction="row" spacing={0}>
                          {note.pinned && <Tooltip title="Pinned"><PushPinRounded sx={{ fontSize: 18, color: 'primary.main', mt: 0.9, mr: 0.4 }} /></Tooltip>}
                          <Tooltip title={note.favorite ? 'Remove favorite' : 'Add favorite'}>
                            <IconButton
                              size="small"
                              aria-label={note.favorite ? 'Remove favorite' : 'Add favorite'}
                              onClick={(event) => { event.stopPropagation(); toggleFavorite(note); }}
                              sx={{ color: note.favorite ? '#e5a326' : 'text.disabled' }}
                            >
                              {note.favorite ? <StarRounded fontSize="small" /> : <StarOutlineRounded fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                      <Typography variant="h6" sx={{ fontSize: '1.03rem', fontWeight: 750, lineHeight: 1.35, mb: 1.1, wordBreak: 'break-word' }}>
                        {note.title.trim() || 'Untitled note'}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.6,
                          wordBreak: 'break-word',
                        }}
                      >
                        {note.body.trim() || 'Your note is waiting for a few words...'}
                      </Typography>
                      <Box sx={{ flex: 1, minHeight: 18 }} />
                      <Divider sx={{ borderColor: 'rgba(110,120,150,.15)', my: 1.4 }} />
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={0.6}>
                          <AccessTimeRounded sx={{ fontSize: 15, color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.secondary">{formatDate(note.updatedAt)}</Typography>
                        </Stack>
                        {filter === 'trash' ? (
                          <Tooltip title="Restore note">
                            <IconButton size="small" aria-label="Restore note" onClick={(event) => { event.stopPropagation(); restoreNote(note.id); }}>
                              <RestoreFromTrashRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Pin note">
                            <IconButton size="small" aria-label={note.pinned ? 'Unpin note' : 'Pin note'} onClick={(event) => { event.stopPropagation(); togglePin(note); }} sx={{ color: note.pinned ? 'primary.main' : 'text.disabled' }}>
                              {note.pinned ? <PushPinRounded fontSize="small" /> : <PushPinOutlined fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Box sx={{
                minHeight: 360,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                border: 1,
                borderColor: 'divider',
                borderStyle: 'dashed',
                borderRadius: 4,
                px: 3,
                bgcolor: 'background.paper',
              }}>
                <Box sx={{ width: 64, height: 64, borderRadius: 4, display: 'grid', placeItems: 'center', bgcolor: 'action.hover', color: 'text.secondary', mb: 2 }}>
                  {filter === 'trash' ? <DeleteOutlineRounded sx={{ fontSize: 30 }} /> : <MenuBookRounded sx={{ fontSize: 30 }} />}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 750, mb: 0.6 }}>
                  {query ? 'No matching notes' : filter === 'trash' ? 'Your trash is empty' : 'Nothing here just yet'}
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 360, mb: 2.2 }}>
                  {query ? 'Try a different search, or clear the search field.' : filter === 'favorites' ? 'Star a note to keep it in your favorites.' : filter === 'archived' ? 'Archived notes will appear here.' : filter === 'trash' ? 'Notes you move to trash will show up here.' : 'Start with a fresh note and capture what is on your mind.'}
                </Typography>
                {filter === 'all' && !query && <Button variant="contained" startIcon={<AddRounded />} onClick={createNote}>Create your first note</Button>}
                {query && <Button variant="outlined" onClick={() => setQuery('')}>Clear search</Button>}
              </Box>
            )}

            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.8} sx={{ pt: 4, pb: 1 }}>
              <NotesRounded sx={{ fontSize: 16, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.disabled">Made for your thoughts · Saved on this device</Typography>
            </Stack>
          </Box>
        </Box>
      </Box>

      <Dialog
        open={Boolean(activeNote)}
        onClose={() => setActiveId(null)}
        fullWidth
        maxWidth="md"
        scroll="paper"
        PaperProps={{ sx: { borderRadius: { xs: 0, sm: 4 }, minHeight: { sm: 590 }, overflow: 'hidden' } }}
      >
        {activeNote && (
          <>
            <Box sx={{ px: { xs: 2, sm: 3.5 }, pt: 2.5, pb: 1.5 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 34, height: 34, display: 'grid', placeItems: 'center', borderRadius: 2.2, bgcolor: 'action.hover', color: 'primary.main' }}>
                    <NotesRounded fontSize="small" />
                  </Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 650 }}>Note editor</Typography>
                </Stack>
                <Stack direction="row" spacing={0.4} alignItems="center">
                  <Tooltip title={activeNote.favorite ? 'Remove favorite' : 'Add favorite'}>
                    <IconButton onClick={() => toggleFavorite(activeNote)} aria-label="Toggle favorite" sx={{ color: activeNote.favorite ? '#e5a326' : 'text.secondary' }}>
                      {activeNote.favorite ? <StarRounded /> : <StarOutlineRounded />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={activeNote.pinned ? 'Unpin note' : 'Pin note'}>
                    <IconButton onClick={() => togglePin(activeNote)} aria-label="Toggle pin" color={activeNote.pinned ? 'primary' : 'default'}>
                      {activeNote.pinned ? <PushPinRounded /> : <PushPinOutlined />}
                    </IconButton>
                  </Tooltip>
                  <IconButton onClick={() => setActiveId(null)} aria-label="Close editor"><CloseRounded /></IconButton>
                </Stack>
              </Stack>
              <TextField
                fullWidth
                variant="standard"
                placeholder="Untitled note"
                value={activeNote.title}
                onChange={(event) => updateNote(activeNote.id, { title: event.target.value })}
                inputProps={{ 'aria-label': 'Note title', maxLength: 140 }}
                sx={{
                  mt: 2.1,
                  mb: 1.4,
                  '& .MuiInputBase-input': { fontSize: { xs: 25, sm: 30 }, fontWeight: 750, letterSpacing: '-.035em', py: 0.7 },
                  '& .MuiInput-underline:before': { borderBottomColor: 'divider' },
                }}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={1.4}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <Select
                      value={activeNote.category || 'Personal'}
                      onChange={(event) => updateNote(activeNote.id, { category: event.target.value })}
                      inputProps={{ 'aria-label': 'Note category' }}
                      sx={{ borderRadius: 2, fontSize: 13, bgcolor: 'action.hover', '& fieldset': { border: 0 } }}
                    >
                      {CATEGORIES.map((category) => <MenuItem key={category} value={category}>{category}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <PaletteOutlined sx={{ fontSize: 17, color: 'text.secondary' }} />
                    {NOTE_COLORS.map((color) => (
                      <Tooltip key={color.value} title={color.name}>
                        <IconButton
                          size="small"
                          aria-label={`${color.name} note color`}
                          onClick={() => updateNote(activeNote.id, { color: color.value })}
                          sx={{
                            width: 22,
                            height: 22,
                            p: 0,
                            bgcolor: color.value,
                            border: activeNote.color === color.value ? '2px solid' : '1px solid',
                            borderColor: activeNote.color === color.value ? 'primary.main' : 'divider',
                            '&:hover': { bgcolor: color.value, transform: 'scale(1.08)' },
                          }}
                        />
                      </Tooltip>
                    ))}
                  </Stack>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Edited {formatLongDate(activeNote.updatedAt)}
                </Typography>
              </Stack>
            </Box>
            <Divider />
            <DialogContent sx={{ px: { xs: 2, sm: 3.5 }, py: 2.5, flex: 1, bgcolor: mode === 'light' ? '#fff' : 'background.paper' }}>
              <TextField
                fullWidth
                multiline
                minRows={12}
                maxRows={22}
                variant="standard"
                placeholder="Start writing..."
                value={activeNote.body}
                onChange={(event) => updateNote(activeNote.id, { body: event.target.value })}
                inputProps={{ 'aria-label': 'Note content' }}
                sx={{
                  height: '100%',
                  '& .MuiInputBase-root': { alignItems: 'flex-start', fontSize: 15.5, lineHeight: 1.85 },
                  '& textarea': { resize: 'vertical', minHeight: 300 },
                  '& .MuiInput-underline:before': { borderBottom: 0 },
                  '& .MuiInput-underline:after': { borderBottom: 0 },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 0 },
                }}
              />
            </DialogContent>
            <Divider />
            <DialogActions sx={{ px: { xs: 2, sm: 3.5 }, py: 1.8, justifyContent: 'space-between' }}>
              <Stack direction="row" spacing={0.7}>
                {activeNote.trashed ? (
                  <>
                    <Button color="primary" startIcon={<RestoreFromTrashRounded />} onClick={() => { restoreNote(activeNote.id); setActiveId(null); }}>Restore</Button>
                    <Button color="error" startIcon={<DeleteOutlineRounded />} onClick={() => permanentlyDelete(activeNote.id)}>Delete forever</Button>
                  </>
                ) : (
                  <>
                    <Tooltip title="Move to trash">
                      <IconButton color="error" aria-label="Move note to trash" onClick={() => moveToTrash(activeNote.id)}><DeleteOutlineRounded /></IconButton>
                    </Tooltip>
                    <Tooltip title="Archive note">
                      <IconButton aria-label="Archive note" onClick={() => archiveNote(activeNote.id)}><ArchiveOutlined /></IconButton>
                    </Tooltip>
                  </>
                )}
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1.2}>
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>Changes save automatically</Typography>
                <Button variant="contained" onClick={() => setActiveId(null)}>Done</Button>
              </Stack>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar open={Boolean(snack)} autoHideDuration={3200} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnack('')} severity={snack.includes('could not') || snack.includes('full') ? 'warning' : 'success'} variant="filled" sx={{ borderRadius: 3 }}>
          {snack}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
