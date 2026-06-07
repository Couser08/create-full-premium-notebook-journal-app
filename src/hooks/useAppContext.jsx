import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { notebooks as initialNotebooks, pinnedNotes, recentNotes } from "../data/notebookData";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

const AppContext = createContext();

// Helper to strip non-DB columns before sync
function cleanNote(n, userId) {
  return {
    id: n.id,
    user_id: userId,
    title: n.title || "Untitled",
    body: n.body || "",
    date: n.date || "",
    notebook: n.notebook || "",
    tags: n.tags || [],
    content: n.content || null,
    is_archived: n.isArchived || false,
    deleted_at: n.deletedAt || null,
    created_at: n.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    color: n.color || null,
    route: n.route || null,
    icon_name: n.icon ? (typeof n.icon === 'string' ? n.icon : n.icon.name) : null
  };
}

function cleanNotebook(nb, userId) {
  return {
    id: nb.id,
    user_id: userId,
    label: nb.label,
    count: nb.count || 0,
    color: nb.color || 'violet',
    description: nb.description || ""
  };
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Initialize with empty lists if Supabase is active (will be populated from fetch)
  // Fallback to local data only for "Mock Mode"
  const [notebooks, setNotebooks] = useState(() => {
    if (isSupabaseConfigured) return [];
    const saved = window.localStorage.getItem("app-notebooks");
    return saved ? JSON.parse(saved) : initialNotebooks;
  });

  const [notes, setNotes] = useState(() => {
    if (isSupabaseConfigured) return [];
    const saved = window.localStorage.getItem("app-notes");
    return saved ? JSON.parse(saved) : [...pinnedNotes, ...recentNotes];
  });

  const [favorites, setFavorites] = useState(() => {
    const saved = window.localStorage.getItem("app-favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const [focusMode, setFocusMode] = useState(false);
  
  const lastSyncedNotes = useRef(null);
  const lastSyncedNotebooks = useRef(null);
  const isFetchingRef = useRef(false);

  const fetchData = useCallback(async (userId) => {
    if (!isSupabaseConfigured || !userId || isFetchingRef.current) return;
    isFetchingRef.current = true;
    setSyncing(true);
    try {
      const [
        { data: notesData, error: notesError },
        { data: notebooksData, error: notebooksError },
        { data: favoritesData, error: favoritesError }
      ] = await Promise.all([
        supabase.from("notes").select("*").eq("user_id", userId).order('created_at', { ascending: false }),
        supabase.from("notebooks").select("*").eq("user_id", userId),
        supabase.from("favorites").select("*").eq("user_id", userId)
      ]);

      if (notesError) throw notesError;
      if (notebooksError) throw notebooksError;
      if (favoritesError) throw favoritesError;

      // Even if empty, we update state to clear the "predefined" data
      setNotes((notesData || []).map(n => ({
        ...n,
        isArchived: n.is_archived,
        deletedAt: n.deleted_at,
        createdAt: n.created_at
      })));
      lastSyncedNotes.current = JSON.stringify(notesData || []);

      setNotebooks(notebooksData || []);
      lastSyncedNotebooks.current = JSON.stringify(notebooksData || []);

      setFavorites((favoritesData || []).map(f => f.note_id));
    } catch (error) {
      console.error("Supabase Fetch Error:", error.message);
    } finally {
      setSyncing(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Auth session management
  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) fetchData(currentUser.id);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) fetchData(currentUser.id);
      });

      return () => subscription.unsubscribe();
    } else {
      const savedUser = window.localStorage.getItem("app-user");
      if (savedUser) setUser(JSON.parse(savedUser));
      setLoading(false);
    }
  }, [fetchData]);

  // Real-time subscriptions for bidirectional cross-device sync
  useEffect(() => {
    if (!isSupabaseConfigured || !user) return;

    // Use specific channel names for better tracking
    const changesChannel = supabase
      .channel(`sync:${user.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notes', 
        filter: `user_id=eq.${user.id}` 
      }, (payload) => {
        console.log("Real-time update received (notes):", payload.eventType);
        fetchData(user.id);
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notebooks', 
        filter: `user_id=eq.${user.id}` 
      }, (payload) => {
        console.log("Real-time update received (notebooks):", payload.eventType);
        fetchData(user.id);
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'favorites', 
        filter: `user_id=eq.${user.id}` 
      }, (payload) => {
        fetchData(user.id);
      })
      .subscribe((status) => {
        console.log(`Real-time sync status for ${user.id}:`, status);
      });

    return () => {
      supabase.removeChannel(changesChannel);
    };
  }, [user, fetchData]);

  const syncToSupabase = useCallback(async (type, data) => {
    if (!isSupabaseConfigured || !user || isFetchingRef.current) return;
    
    try {
      if (type === "notes") {
        const cleaned = data.map(n => cleanNote(n, user.id));
        const dataStr = JSON.stringify(cleaned);
        if (dataStr === lastSyncedNotes.current) return;
        
        const { error } = await supabase.from("notes").upsert(cleaned);
        if (error) throw error;
        lastSyncedNotes.current = dataStr;
      } else if (type === "notebooks") {
        const cleaned = data.map(nb => cleanNotebook(nb, user.id));
        const dataStr = JSON.stringify(cleaned);
        if (dataStr === lastSyncedNotebooks.current) return;

        const { error } = await supabase.from("notebooks").upsert(cleaned);
        if (error) throw error;
        lastSyncedNotebooks.current = dataStr;
      } else if (type === "favorites") {
        // Sync favorites (slightly different as it's a join table)
        await supabase.from("favorites").delete().eq("user_id", user.id);
        if (data.length > 0) {
          await supabase.from("favorites").insert(data.map(id => ({ note_id: id, user_id: user.id })));
        }
      }
    } catch (error) {
      console.error(`Supabase Sync Error (${type}):`, error.message);
    }
  }, [user]);

  useEffect(() => {
    window.localStorage.setItem("app-notebooks", JSON.stringify(notebooks));
    const timeout = setTimeout(() => syncToSupabase("notebooks", notebooks), 800);
    return () => clearTimeout(timeout);
  }, [notebooks, syncToSupabase]);

  useEffect(() => {
    window.localStorage.setItem("app-notes", JSON.stringify(notes));
    const timeout = setTimeout(() => syncToSupabase("notes", notes), 800);
    return () => clearTimeout(timeout);
  }, [notes, syncToSupabase]);

  useEffect(() => {
    window.localStorage.setItem("app-favorites", JSON.stringify(favorites));
    syncToSupabase("favorites", favorites);
  }, [favorites, syncToSupabase]);

  const addNote = (note) => {
    const newNote = {
      ...note,
      id: note.id || `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      date: new Date().toLocaleString('default', { month: 'short', day: 'numeric' })
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const deleteNote = (noteId) => {
    setNotes((prev) => prev.map((n) => n.id === noteId ? { ...n, deletedAt: new Date().toISOString() } : n));
    setFavorites((prev) => prev.filter((id) => id !== noteId));
  };

  const restoreNote = (noteId) => {
    setNotes((prev) => prev.map((n) => {
      if (n.id === noteId) {
        const { deletedAt, ...rest } = n;
        return rest;
      }
      return n;
    }));
  };

  const permanentlyDeleteNote = (noteId) => {
    if (isSupabaseConfigured && user) {
      supabase.from("notes").delete().eq("id", noteId).eq("user_id", user.id).then();
    }
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  const updateNote = (noteId, patch) => {
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, ...patch } : n)));
  };

  const toggleFavorite = (noteId) => {
    setFavorites((prev) =>
      prev.includes(noteId) ? prev.filter((id) => id !== noteId) : [...prev, noteId]
    );
  };

  const archiveNote = (noteId) => {
    setNotes((prev) => prev.map((n) => n.id === noteId ? { ...n, isArchived: true } : n));
  };

  const restoreFromArchive = (noteId) => {
    setNotes((prev) => prev.map((n) => n.id === noteId ? { ...n, isArchived: false } : n));
  };

  const addNotebook = (notebook) => {
    setNotebooks((prev) => [...prev, notebook]);
  };

  const deleteNotebook = (notebookId) => {
    if (isSupabaseConfigured && user) {
      supabase.from("notebooks").delete().eq("id", notebookId).eq("user_id", user.id).then();
    }
    setNotebooks((prev) => prev.filter((n) => n.id !== notebookId));
  };

  const signup = async (email, password, fullName) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });
      if (error) throw error;
      return data;
    } else {
      const newUser = { id: "mock-id", email, user_metadata: { full_name: fullName } };
      window.localStorage.setItem("app-user", JSON.stringify(newUser));
      setUser(newUser);
      return { user: newUser };
    }
  };

  const login = async (email, password) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    } else {
      const mockUser = { id: "mock-id", email, user_metadata: { full_name: "Mock User" } };
      window.localStorage.setItem("app-user", JSON.stringify(mockUser));
      setUser(mockUser);
      return { user: mockUser };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      window.localStorage.removeItem("app-user");
      setUser(null);
    }
    setNotes([]);
    setNotebooks([]);
    setFavorites([]);
    lastSyncedNotes.current = null;
    lastSyncedNotebooks.current = null;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        syncing,
        login,
        signup,
        logout,
        notebooks,
        notes,
        favorites,
        addNote,
        deleteNote,
        restoreNote,
        permanentlyDeleteNote,
        updateNote,
        toggleFavorite,
        archiveNote,
        restoreFromArchive,
        addNotebook,
        deleteNotebook,
        setNotebooks,
        focusMode,
        setFocusMode
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
