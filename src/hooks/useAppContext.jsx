import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { notebooks as initialNotebooks, pinnedNotes, recentNotes } from "../data/notebookData";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [notebooks, setNotebooks] = useState(() => {
    const saved = window.localStorage.getItem("app-notebooks");
    return saved ? JSON.parse(saved) : initialNotebooks;
  });

  const [notes, setNotes] = useState(() => {
    const saved = window.localStorage.getItem("app-notes");
    return saved ? JSON.parse(saved) : [...pinnedNotes, ...recentNotes];
  });

  const [favorites, setFavorites] = useState(() => {
    const saved = window.localStorage.getItem("app-favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const [focusMode, setFocusMode] = useState(false);

  // Fetch data from Supabase
  const fetchData = useCallback(async (userId) => {
    if (!isSupabaseConfigured || !userId) return;
    setSyncing(true);
    try {
      const [
        { data: notesData },
        { data: notebooksData },
        { data: favoritesData }
      ] = await Promise.all([
        supabase.from("notes").select("*").eq("user_id", userId),
        supabase.from("notebooks").select("*").eq("user_id", userId),
        supabase.from("favorites").select("*").eq("user_id", userId)
      ]);

      if (notesData) setNotes(notesData);
      if (notebooksData) setNotebooks(notebooksData);
      if (favoritesData) setFavorites(favoritesData.map(f => f.note_id));
    } catch (error) {
      console.error("Error fetching data from Supabase:", error);
    } finally {
      setSyncing(false);
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

  // Sync to Supabase
  const syncToSupabase = useCallback(async (type, data) => {
    if (!isSupabaseConfigured || !user) return;
    try {
      if (type === "notes") {
        await supabase.from("notes").upsert(data.map(n => ({ ...n, user_id: user.id })));
      } else if (type === "notebooks") {
        await supabase.from("notebooks").upsert(data.map(nb => ({ ...nb, user_id: user.id })));
      } else if (type === "favorites") {
        // Delete old favorites and insert new ones
        await supabase.from("favorites").delete().eq("user_id", user.id);
        await supabase.from("favorites").insert(data.map(id => ({ note_id: id, user_id: user.id })));
      }
    } catch (error) {
      console.error(`Error syncing ${type} to Supabase:`, error);
    }
  }, [user]);

  // Persistence effects
  useEffect(() => {
    window.localStorage.setItem("app-notebooks", JSON.stringify(notebooks));
    if (user) syncToSupabase("notebooks", notebooks);
  }, [notebooks, user, syncToSupabase]);

  useEffect(() => {
    window.localStorage.setItem("app-notes", JSON.stringify(notes));
    if (user) syncToSupabase("notes", notes);
  }, [notes, user, syncToSupabase]);

  useEffect(() => {
    window.localStorage.setItem("app-favorites", JSON.stringify(favorites));
    if (user) syncToSupabase("favorites", favorites);
  }, [favorites, user, syncToSupabase]);

  const addNote = (note) => {
    const newNote = {
      ...note,
      id: note.id || `note-${Date.now()}`,
      createdAt: note.createdAt || new Date().toISOString(),
      date: note.date || new Date().toLocaleString('default', { month: 'short', day: 'numeric' })
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
    setNotes([...pinnedNotes, ...recentNotes]);
    setNotebooks(initialNotebooks);
    setFavorites([]);
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
