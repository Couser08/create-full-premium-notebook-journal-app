import { useEffect } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import AppShell from "./components/AppShell";
import CodeEditorPage from "./pages/CodeEditorPage";
import HomePage from "./pages/HomePage";
import JournalEditorPage from "./pages/JournalEditorPage";
import NotebookPage from "./pages/NotebookPage";
import TrashPage from "./pages/TrashPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import TemplatesPage from "./pages/TemplatesPage";
import SearchPage from "./pages/SearchPage";
import ArchivePage from "./pages/ArchivePage";
import TagsPage from "./pages/TagsPage";
import CalendarPage from "./pages/CalendarPage";
import AttachmentsPage from "./pages/AttachmentsPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import CollaborationPage from "./pages/CollaborationPage";
import { AppProvider, useAppContext } from "./hooks/useAppContext";
import { ToastProvider } from "./components/Toast";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ children }) {
  const { user, loading } = useAppContext();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        navigate("/search");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <AppShell>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><HomePage filter="all" /></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><HomePage filter="favorites" /></ProtectedRoute>} />
        <Route path="/trash" element={<ProtectedRoute><TrashPage /></ProtectedRoute>} />
        <Route path="/notebook/:notebookId" element={<ProtectedRoute><NotebookPage /></ProtectedRoute>} />
        <Route path="/journal/:noteId" element={<ProtectedRoute><JournalEditorPage /></ProtectedRoute>} />
        <Route path="/code/:noteId" element={<ProtectedRoute><CodeEditorPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/templates" element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/archive" element={<ProtectedRoute><ArchivePage /></ProtectedRoute>} />
        <Route path="/tags" element={<ProtectedRoute><TagsPage /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
        <Route path="/attachments" element={<ProtectedRoute><AttachmentsPage /></ProtectedRoute>} />
        <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistantPage /></ProtectedRoute>} />
        <Route path="/collaboration" element={<ProtectedRoute><CollaborationPage /></ProtectedRoute>} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ToastProvider>
  );
}
