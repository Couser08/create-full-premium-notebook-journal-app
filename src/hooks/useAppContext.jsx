import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { notebooks as initialNotebooks, pinnedNotes, recentNotes } from "../data/notebookData";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("synced"); // syncing, synced, error, offline
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncedDeviceCount, setSyncedDeviceCount] = useState(1);

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
  
  // Refs to prevent recursive sync loops and track sync queue
  const lastSyncedNotes = useRef(null);
  const lastSyncedNotebooks = useRef(null);
  const syncQueueRef = useRef([]);
  const syncTimeoutRef = useRef(null);
  const isOnlineRef = useRef(true);

  // Fetch data from Supabase
  const fetchData = useCallback(async (userId) => {
    if (!isSupabaseConfigured || !userId) return;
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

      if (notesData && notesData.length > 0) {
        setNotes(notesData);
        lastSyncedNotes.current = JSON.stringify(notesData);
      }
      if (notebooksData && notebooksData.length > 0) {
        setNotebooks(notebooksData);
        lastSyncedNotebooks.current = JSON.stringify(notebooksData);
      }
      if (favoritesData) setFavorites(favoritesData.map(f => f.note_id));
    } catch (error) {
      console.error("Error fetching data from Supabase:", error.message);
    } finally {
      setSyncing(false);
    }
  }, []);

  // Handle online/offline state
  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true;
      setSyncStatus("syncing");
      console.log('🌐 Back online - syncing queued changes');
      
      // Sync all queued items
      if (syncQueueRef.current.length > 0) {
        syncQueueRef.current.forEach(({ type, data }) => {
          syncToSupabase(type, data);
        });
        syncQueueRef.current = [];
      }
      
      // Refresh data
      if (user) fetchData(user.id);
    };

    const handleOffline = () => {
      isOnlineRef.current = false;
      setSyncStatus("offline");
      console.log('📴 Offline - queuing changes');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial online status
    if (!navigator.onLine) {
      setSyncStatus("offline");
      isOnlineRef.current = false;
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, fetchData, syncToSupabase]);
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

  // Real-time subscriptions for cross-device sync with optimized payload handling
  useEffect(() => {
    if (!isSupabaseConfigured || !user) return;

    const notesChannel = supabase
      .channel(`notes:${user.id}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${user.id}` }, 
        (payload) => {
          console.log('📱 Notes synced from another device:', payload.eventType);
          setLastSyncTime(new Date());
          // Refresh data from another device
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // Add or update the specific note
            setNotes((prev) => {
              const existing = prev.find(n => n.id === payload.new.id);
              if (existing) {
                return prev.map(n => n.id === payload.new.id ? payload.new : n);
              } else {
                return [payload.new, ...prev];
              }
            });
          } else if (payload.eventType === 'DELETE') {
            setNotes((prev) => prev.filter(n => n.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Notes channel status:', status);
        setSyncedDeviceCount(status === 'SUBSCRIBED' ? 2 : 1);
      });

    const notebooksChannel = supabase
      .channel(`notebooks:${user.id}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notebooks', filter: `user_id=eq.${user.id}` }, 
        (payload) => {
          console.log('📓 Notebooks synced from another device:', payload.eventType);
          setLastSyncTime(new Date());
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setNotebooks((prev) => {
              const existing = prev.find(n => n.id === payload.new.id);
              if (existing) {
                return prev.map(n => n.id === payload.new.id ? payload.new : n);
              } else {
                return [...prev, payload.new];
              }
            });
          } else if (payload.eventType === 'DELETE') {
            setNotebooks((prev) => prev.filter(n => n.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Notebooks channel status:', status);
      });

    return () => {
      supabase.removeChannel(notesChannel);
      supabase.removeChannel(notebooksChannel);
    };
  }, [user]);

  // Enhanced sync with debouncing and offline support
  const syncToSupabase = useCallback(async (type, data) => {
    if (!isSupabaseConfigured || !user) return;
    
    // Prevent sync if data hasn't actually changed from last fetch/sync
    const dataStr = JSON.stringify(data);
    if (type === "notes" && dataStr === lastSyncedNotes.current) return;
    if (type === "notebooks" && dataStr === lastSyncedNotebooks.current) return;

    try {
      setSyncStatus("syncing");
      
      if (type === "notes") {
        await supabase.from("notes").upsert(data.map(n => ({ 
          ...n, 
          user_id: user.id,
          updated_at: new Date().toISOString()
        })));
        lastSyncedNotes.current = dataStr;
      } else if (type === "notebooks") {
        await supabase.from("notebooks").upsert(data.map(nb => ({ ...nb, user_id: user.id })));
        lastSyncedNotebooks.current = dataStr;
      } else if (type === "favorites") {
        await supabase.from("favorites").delete().eq("user_id", user.id);
        await supabase.from("favorites").insert(data.map(id => ({ note_id: id, user_id: user.id })));
      }
      
      setLastSyncTime(new Date());
      setSyncStatus("synced");
    } catch (error) {
      console.error(`Error syncing ${type} to Supabase:`, error.message);
      setSyncStatus("error");
      
      // Queue for retry
      syncQueueRef.current.push({ type, data, timestamp: Date.now() });
      
      // Retry after delay
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => syncToSupabase(type, data), 5000);
    }
  }, [user]);

  // Persistence effects
  useEffect(() => {
    window.localStorage.setItem("app-notebooks", JSON.stringify(notebooks));
    const timeout = setTimeout(() => {
      if (user) syncToSupabase("notebooks", notebooks);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [notebooks, user, syncToSupabase]);

  useEffect(() => {
    window.localStorage.setItem("app-notes", JSON.stringify(notes));
    const timeout = setTimeout(() => {
      if (user) syncToSupabase("notes", notes);
    }, 1000);
    return () => clearTimeout(timeout);
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
      date: note.date || new Date().toLocaleString('default', { month: 'short', day: 'numeric' }),
      user_id: user?.id
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
    setNotebooks((prev) => [...prev, { ...notebook, user_id: user?.id }]);
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
    lastSyncedNotes.current = null;
    lastSyncedNotebooks.current = null;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        syncing,
        syncStatus,
        lastSyncTime,
        syncedDeviceCount,
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
