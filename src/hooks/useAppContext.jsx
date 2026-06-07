import React, { createContext, useContext, useEffect, useState } from "react";
import { notebooks as initialNotebooks, pinnedNotes, recentNotes } from "../data/notebookData";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Auth session management
  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    } else {
      const savedUser = window.localStorage.getItem("app-user");
      if (savedUser) setUser(JSON.parse(savedUser));
      setLoading(false);
    }
  }, []);

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
      // Mock signup
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
      // Mock login
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
  };

  useEffect(() => {
    window.localStorage.setItem("app-notebooks", JSON.stringify(notebooks));
  }, [notebooks]);

  useEffect(() => {
    window.localStorage.setItem("app-notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    window.localStorage.setItem("app-favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (isSupabaseConfigured && user) {
      // In a real app, you would sync data here
      // e.g. supabase.from('notes').upsert(notes)
    }
  }, [notes, notebooks, favorites, user]);

  const addNote = (note) => {
    const newNote = {
      ...note,
      createdAt: note.createdAt || new Date().toISOString(),
      date: note.date || new Date().toLocaleString('default', { month: 'short', day: 'numeric' })
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const deleteNote = (noteId) => {
    // Soft delete: move to trash
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
    setNotebooks((prev) => prev.filter((n) => n.id !== notebookId));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
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
