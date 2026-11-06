import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AppBar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardActionArea,
  Chip,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
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
import AddRounded from '@mui/icons-material/AddRounded';
import AllInboxRounded from '@mui/icons-material/AllInboxRounded';
import ArchiveOutlined from '@mui/icons-material/ArchiveOutlined';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import DownloadRounded from '@mui/icons-material/DownloadRounded';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRounded from '@mui/icons-material/FavoriteBorderRounded';
import LightModeRounded from '@mui/icons-material/LightModeRounded';
import DarkModeRounded from '@mui/icons-material/DarkModeRounded';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import NotesRounded from '@mui/icons-material/NotesRounded';
import PushPinRounded from '@mui/icons-material/PushPinRounded';
import PushPinOutlined from '@mui/icons-material/PushPinOutlined';
import RestoreFromTrashRounded from '@mui/icons-material/RestoreFromTrashRounded';
import UploadFileRounded from '@mui/icons-material/UploadFileRounded';

const STORAGE_KEY = 'mui-notes-data-v1';
const MODE_KEY = 'mui-notes-mode-v1';
const CATEGORIES = ['Personal', 'Work', 'Ideas', 'Study', 'Journal'];

const starterNotes = [
  {
    id: 'welcome-note',
    title: 'Welcome to MUI Notes',
    body: 'This is your space to capture thoughts, plans, and ideas.\n\nCreate a note with the New note button. Your changes are saved automatically in this browser.',
    category: 'Personal',
    favorite: true,
    pinned: true,
    archived: false,
    trashed: false,
    createdAt: '2026-11-05T14:00:00.000Z',
    updatedAt: '2026-11-05T14:00:00.000Z',
  },
  {
    id: 'project-ideas',
    title: 'Project ideas',
    body: 'Things to explore:\n\n• Keep the interface focused\n• Make common actions easy to find\n• Build a little time for experimentation into the week',
    category: 'Ideas',
    favorite: false,
    pinned: false,
    archived: false,
    trashed: false,
    createdAt: '2026-11-04T16:20:00.000Z',
    updatedAt: '2026-11-04T16:20:00.000Z',
  },
  {
    id: 'weekly-planning',
    title: 'Weekly planning',
    body: '1. Review the inbox\n2. Choose three priorities\n3. Make time for focused work\n4. Leave some room for something unexpected',
    category: 'Work',
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

function readMode() {
  try {
    return localStorage.getItem(MODE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? 'note-' + Date.now() + '-' + Math.random().toString(16).slice(2);
}

function formatDate(value) {
  const date = new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return 'Just now';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function truncateText(value, maxLength = 180) {
  const text = String(value || '').trim();
  if (text.length <= maxLength) return text || 'No additional text';
  return text.slice(0, maxLength).trimEnd() + '…';
}

function App() {
  const [notes, setNotes] = useState(readNotes);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [mode, setMode] = useState(readMode);
  const [snackbar, setSnackbar] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [importFile, setImportFile] = useState(null);

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      setSnackbar('Browser storage is full. Export a backup before continuing.');
    }
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem(MODE_KEY, mode);
    } catch {
      // The theme preference is optional.
    }
  }, [mode]);

  const activeNote = notes.find((note) => note.id === activeId) || null;

  const counts = useMemo(() => ({
    all: notes.filter((note) => !note.archived && !note.trashed).length,
    favorites: notes.filter((note) => note.favorite && !note.archived && !note.trashed).length,
    archived: notes.filter((note) => note.archived && !note.trashed).length,
    trash: notes.filter((note) => note.trashed).length,
  }), [notes]);

  const filteredNotes = useMemo(() => {
    const term = search.trim().toLowerCase();
    return notes
      .filter((note) => {
        if (filter === 'favorites' && (!note.favorite || note.archived || note.trashed)) return false;
        if (filter === 'archived' && (!note.archived || note.trashed)) return false;
        if (filter === 'trash' && !note.trashed) return false;
        if (filter === 'all' && (note.archived || note.trashed)) return false;
        if (!term) return true;
        return [note.title, note.body, note.category].some((value) => String(value || '').toLowerCase().includes(term));
      })
      .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [notes, filter, search]);

  const updateNote = (id, changes) => {
    setNotes((current) => current.map((note) => (
      note.id === id
        ? { ...note, ...changes, updatedAt: new Date().toISOString() }
        : note
    )));
  };

  const createNote = () => {
    const now = new Date().toISOString();
    const note = {
      id: createId(),
      title: '',
      body: '',
      category: 'Personal',
      favorite: false,
      pinned: false,
      archived: false,
      trashed: false,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((current) => [note, ...current]);
    setFilter('all');
    setSearch('');
    setActiveId(note.id);
  };

  const moveToTrash = (id) => {
    updateNote(id, { trashed: true, archived: false });
    setActiveId(null);
    setSnackbar('Note moved to trash');
  };

  const restoreNote = (id) => {
    updateNote(id, { trashed: false });
    setSnackbar('Note restored');
  };

  const archiveNote = (id) => {
    updateNote(id, { archived: true });
    setActiveId(null);
    setSnackbar('Note archived');
  };

  const unarchiveNote = (id) => {
    updateNote(id, { archived: false });
    setSnackbar('Note moved back to all notes');
  };

  const permanentlyDelete = () => {
    setNotes((current) => current.filter((note) => note.id !== deleteId));
    setDeleteId(null);
    setActiveId(null);
    setSnackbar('Note permanently deleted');
  };

  const exportNotes = () => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mui-notes-backup.json';
    link.click();
    URL.revokeObjectURL(url);
    setSnackbar('Backup downloaded');
  };

  const importNotes = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    event.target.value = '';
  };

  const confirmImport = () => {
    if (!importFile) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed) || parsed.some((item) => !item || typeof item !== 'object' || typeof item.id !== 'string')) {
          throw new Error('Invalid backup');
        }
        const imported = parsed.map((item) => ({
          id: item.id,
          title: String(item.title || ''),
          body: String(item.body || ''),
          category: CATEGORIES.includes(item.category) ? item.category : 'Personal',
          favorite: Boolean(item.favorite),
          pinned: Boolean(item.pinned),
          archived: Boolean(item.archived),
          trashed: Boolean(item.trashed),
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        }));
        setNotes(imported);
        setActiveId(null);
        setFilter('all');
        setSearch('');
        setSnackbar('Backup imported');
      } catch {
        setSnackbar('This file is not a valid MUI Notes backup');
      }
      setImportFile(null);
    };
    reader.readAsText(importFile);
  };

  const pageTitle = {
    all: 'All notes',
    favorites: 'Favorites',
    archived: 'Archived',
    trash: 'Trash',
  }[filter];

  const handleCloseEditor = () => setActiveId(null);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Stack direction="row" spacing={2} alignItems="center">
            <NotesRounded />
            <Typography variant="h6" component="h1">MUI Notes</Typography>
            <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
              <IconButton color="inherit" onClick={() => setMode((current) => current === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">
                {mode === 'light' ? <DarkModeRounded /> : <LightModeRounded />}
              </IconButton>
            </Tooltip>
            <Button color="inherit" startIcon={<AddRounded />} onClick={createNote}>
              New note
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl">
        <Stack spacing={3} direction="column">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Stack spacing={2}>
                <Typography variant="h6">Notes</Typography>
                <Paper variant="outlined">
                  <List disablePadding>
                    <ListItemButton selected={filter === 'all'} onClick={() => setFilter('all')}>
                      <ListItemIcon><AllInboxRounded /></ListItemIcon>
                      <ListItemText primary="All notes" />
                      <Chip size="small" label={counts.all} />
                    </ListItemButton>
                    <ListItemButton selected={filter === 'favorites'} onClick={() => setFilter('favorites')}>
                      <ListItemIcon><FavoriteBorderRounded /></ListItemIcon>
                      <ListItemText primary="Favorites" />
                      <Chip size="small" label={counts.favorites} />
                    </ListItemButton>
                    <ListItemButton selected={filter === 'archived'} onClick={() => setFilter('archived')}>
                      <ListItemIcon><Inventory2Outlined /></ListItemIcon>
                      <ListItemText primary="Archived" />
                      <Chip size="small" label={counts.archived} />
                    </ListItemButton>
                    <ListItemButton selected={filter === 'trash'} onClick={() => setFilter('trash')}>
                      <ListItemIcon><DeleteOutlineRounded /></ListItemIcon>
                      <ListItemText primary="Trash" />
                      <Chip size="small" label={counts.trash} />
                    </ListItemButton>
                  </List>
                </Paper>
                <Divider />
                <Typography variant="subtitle2">Backup</Typography>
                <Button variant="outlined" startIcon={<DownloadRounded />} onClick={exportNotes}>
                  Export notes
                </Button>
                <TextField
                  type="file"
                  label="Import notes"
                  size="small"
                  inputProps={{ accept: 'application/json,.json' }}
                  onChange={importNotes}
                />
                <Typography variant="body2" color="text.secondary">
                  Notes are stored in this browser. Export a backup before clearing browser data.
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 9 }}>
              <Stack spacing={3}>
                <Stack spacing={2}>
                  <Typography variant="h4" component="h2">{pageTitle}</Typography>
                  <TextField
                    fullWidth
                    label="Search notes"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                    <Typography color="text.secondary" variant="body2">
                      {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
                    </Typography>
                    {filter !== 'trash' && (
                      <Button variant="contained" startIcon={<AddRounded />} onClick={createNote}>
                        New note
                      </Button>
                    )}
                  </Stack>
                </Stack>

                {filteredNotes.length > 0 ? (
                  <Grid container spacing={2}>
                    {filteredNotes.map((note) => (
                      <Grid key={note.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                        <Card>
                          <CardActionArea onClick={() => setActiveId(note.id)}>
                            <CardContent>
                              <Stack spacing={1}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography variant="h6" component="h3">
                                    {note.title.trim() || 'Untitled note'}
                                  </Typography>
                                  {note.pinned && <PushPinRounded color="action" fontSize="small" />}
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                  {truncateText(note.body)}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Chip size="small" label={note.category || 'Personal'} />
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDate(note.updatedAt)}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </CardContent>
                          </CardActionArea>
                          <CardActions>
                            {filter === 'trash' ? (
                              <>
                                <Tooltip title="Restore note">
                                  <IconButton aria-label="Restore note" onClick={() => restoreNote(note.id)}>
                                    <RestoreFromTrashRounded />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete forever">
                                  <IconButton aria-label="Delete forever" color="error" onClick={() => setDeleteId(note.id)}>
                                    <DeleteOutlineRounded />
                                  </IconButton>
                                </Tooltip>
                              </>
                            ) : (
                              <>
                                <Tooltip title={note.favorite ? 'Remove from favorites' : 'Add to favorites'}>
                                  <IconButton
                                    aria-label={note.favorite ? 'Remove from favorites' : 'Add to favorites'}
                                    color={note.favorite ? 'warning' : 'default'}
                                    onClick={() => updateNote(note.id, { favorite: !note.favorite })}
                                  >
                                    {note.favorite ? <FavoriteRounded /> : <FavoriteBorderRounded />}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={note.pinned ? 'Unpin note' : 'Pin note'}>
                                  <IconButton aria-label={note.pinned ? 'Unpin note' : 'Pin note'} onClick={() => updateNote(note.id, { pinned: !note.pinned })}>
                                    {note.pinned ? <PushPinRounded /> : <PushPinOutlined />}
                                  </IconButton>
                                </Tooltip>
                                {filter === 'archived' ? (
                                  <Tooltip title="Unarchive note">
                                    <IconButton aria-label="Unarchive note" onClick={() => unarchiveNote(note.id)}>
                                      <Inventory2Outlined />
                                    </IconButton>
                                  </Tooltip>
                                ) : (
                                  <Tooltip title="Archive note">
                                    <IconButton aria-label="Archive note" onClick={() => archiveNote(note.id)}>
                                      <ArchiveOutlined />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title="Move to trash">
                                  <IconButton aria-label="Move to trash" color="error" onClick={() => moveToTrash(note.id)}>
                                    <DeleteOutlineRounded />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Card>
                    <CardContent>
                      <Stack spacing={2} alignItems="center">
                      <NotesRounded fontSize="large" color="action" />
                      <Typography variant="h6">
                        {search ? 'No matching notes' : filter === 'trash' ? 'Trash is empty' : 'No notes here yet'}
                      </Typography>
                      <Typography color="text.secondary" align="center">
                        {search
                          ? 'Try another search term.'
                          : filter === 'favorites'
                            ? 'Add a note to favorites using its heart button.'
                            : filter === 'archived'
                              ? 'Archived notes will appear here.'
                              : filter === 'trash'
                                ? 'Notes you move to trash will appear here.'
                                : 'Create a note to get started.'}
                      </Typography>
                      {filter === 'all' && !search && (
                        <Button variant="contained" startIcon={<AddRounded />} onClick={createNote}>
                          Create note
                        </Button>
                      )}
                      {search && <Button onClick={() => setSearch('')}>Clear search</Button>}
                      </Stack>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            </Grid>
          </Grid>
          <Divider />
          <Typography variant="body2" color="text.secondary" align="center">
            MUI Notes · Your notes are saved locally in this browser
          </Typography>
        </Stack>
      </Container>

      <Dialog open={Boolean(activeNote)} onClose={handleCloseEditor} fullWidth maxWidth="md">
        {activeNote && (
          <>
            <DialogTitle>
              {activeNote.title.trim() || 'Untitled note'}
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <TextField
                  autoFocus
                  fullWidth
                  label="Title"
                  value={activeNote.title}
                  inputProps={{ maxLength: 140 }}
                  onChange={(event) => updateNote(activeNote.id, { title: event.target.value })}
                />
                <FormControl fullWidth>
                  <InputLabel id="note-category-label">Category</InputLabel>
                  <Select
                    labelId="note-category-label"
                    label="Category"
                    value={activeNote.category || 'Personal'}
                    onChange={(event) => updateNote(activeNote.id, { category: event.target.value })}
                  >
                    {CATEGORIES.map((category) => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  multiline
                  minRows={14}
                  label="Note"
                  value={activeNote.body}
                  onChange={(event) => updateNote(activeNote.id, { body: event.target.value })}
                />
                <Typography variant="caption" color="text.secondary">
                  Last edited {formatDate(activeNote.updatedAt)}. Changes are saved automatically.
                </Typography>
              </Stack>
            </DialogContent>
            <DialogActions>
              {activeNote.trashed ? (
                <>
                  <Button onClick={() => { restoreNote(activeNote.id); setActiveId(null); }} startIcon={<RestoreFromTrashRounded />}>
                    Restore
                  </Button>
                  <Button color="error" onClick={() => setDeleteId(activeNote.id)}>
                    Delete forever
                  </Button>
                </>
              ) : (
                <>
                  <Button color="error" onClick={() => moveToTrash(activeNote.id)}>
                    Move to trash
                  </Button>
                  {activeNote.archived ? (
                    <Button onClick={() => { unarchiveNote(activeNote.id); setActiveId(null); }}>
                      Unarchive
                    </Button>
                  ) : (
                    <Button onClick={() => archiveNote(activeNote.id)} startIcon={<ArchiveOutlined />}>
                      Archive
                    </Button>
                  )}
                </>
              )}
              <Button variant="contained" onClick={handleCloseEditor}>Done</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete note permanently?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This note will be permanently removed. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={permanentlyDelete}>Delete forever</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(importFile)} onClose={() => setImportFile(null)}>
        <DialogTitle>Import notes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Importing a backup replaces the notes currently saved in this browser. Continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportFile(null)}>Cancel</Button>
          <Button variant="contained" onClick={confirmImport}>Import</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3500} onClose={() => setSnackbar('')}>
        <Alert severity="info" onClose={() => setSnackbar('')}>
          {snackbar}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
