import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  FileText, Home, Menu, Plus, Settings, Sparkles,
  Star, Trash2, X, BookOpen, Briefcase, Code2,
  Lightbulb, NotebookTabs, Users, ChevronRight,
  LogOut, UserCircle, LayoutGrid, Search, Tag,
  Paperclip, Calendar
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";
import { isSupabaseConfigured } from "../lib/supabase";
import { useToast } from "./Toast";
import { cn } from "../lib/utils";
import { Button, Separator } from "./ui";
import CreateNotebookModal from "./CreateNotebookModal";

const ICON_MAP = {
  violet: NotebookTabs, blue: FileText,  green: BookOpen,
  amber: Lightbulb,     pink: NotebookTabs, indigo: Code2, slate: Briefcase,
};

const DOT = {
  violet: "bg-violet-500", blue: "bg-blue-500",   green:  "bg-emerald-500",
  amber:  "bg-amber-500",  pink: "bg-pink-500",   indigo: "bg-indigo-500",
  slate:  "bg-slate-400",
};

function SidebarContent({ onClose }) {
  const { notebooks, deleteNotebook, setNotebooks, logout, user } = useAppContext();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [notebookModalOpen, setNotebookModalOpen] = useState(false);
  const [showMoreNb, setShowMoreNb] = useState(false);

  const navItems = [
    { label: "Home",          icon: Home,  to: "/" },
    { label: "All Notes",     icon: FileText, to: "/notes" },
    { label: "Templates",     icon: LayoutGrid, to: "/templates" },
    { label: "Calendar",      icon: Calendar, to: "/calendar" },
    { label: "Search",        icon: Search, to: "/search" },
    { label: "AI Assistant",  icon: Sparkles, to: "/ai-assistant" },
    { label: "Tags",          icon: Tag, to: "/tags" },
    { label: "Files",         icon: Paperclip, to: "/attachments" },
    { label: "Favorites",     icon: Star,  to: "/favorites" },
    { label: "Shared",        icon: Users, to: "/collaboration" },
    { label: "Archive",       icon: Briefcase, to: "/archive" },
    { label: "Trash",         icon: Trash2,to: "/trash" },
  ];

  const visibleNb = showMoreNb ? notebooks : notebooks.slice(0, 5);

  function handleNotebookCreated(notebook) {
    onClose?.();
    addToast("Notebook created successfully");
    navigate(`/notebook/${notebook.id}`);
  }

  function handleDeleteNotebook(e, notebook) {
    e.preventDefault();
    e.stopPropagation();
    const previousList = [...notebooks];
    deleteNotebook(notebook.id);
    addToast(`Deleted "${notebook.label}"`, {
      action: {
        label: "Undo",
        onClick: () => setNotebooks(previousList)
      }
    });
  }

  const handleLogout = async () => {
    try {
      await logout();
      addToast("Logged out successfully");
      navigate("/login");
    } catch (error) {
      addToast("Logout failed", "error");
    }
  };

  return (
    <>
      <aside className="flex h-full flex-col bg-white px-4 py-6 border-r border-gray-100">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <span className="grid size-8 place-items-center rounded-lg bg-violet-600 text-white shadow-sm">
              <FileText className="size-4" />
            </span>
            <span className="text-xl font-bold tracking-tight text-gray-900">Notebook</span>
          </NavLink>
          <button className="rounded-full p-1 text-gray-400 hover:bg-gray-100 transition lg:hidden" onClick={onClose}>
            <X className="size-4" />
          </button>
          {/* Collapse icon (decorative) */}
          <button className="hidden lg:flex items-center justify-center size-7 rounded-md text-gray-400 hover:bg-gray-100 transition">
            <ChevronRight className="size-4 rotate-180" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 overflow-y-auto min-h-0 max-h-[45vh]">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition shrink-0",
                    isActive ? "bg-violet-50 text-violet-700 font-semibold" : "text-gray-700 hover:bg-gray-100"
                  )
                }
              >
                <item.icon className="size-4 text-gray-500" />
                {item.label}
              </NavLink>
            ))}
        </nav>

        <Separator className="my-5" />

        {/* Notebooks */}
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Notebooks</span>
          <button
            className="grid size-6 place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-violet-600 transition"
            aria-label="Add notebook"
            onClick={() => setNotebookModalOpen(true)}
          >
            <Plus className="size-3.5" />
          </button>
        </div>

        <div className="flex flex-col gap-0.5 flex-1 overflow-y-auto mb-4">
          {visibleNb.map((notebook) => (
            <div key={notebook.id} className="group relative">
              <NavLink
                to={`/notebook/${notebook.id}`}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                    isActive ? "bg-violet-50 text-violet-700 font-semibold" : "text-gray-700 hover:bg-gray-100 pr-10"
                  )
                }
              >
                <span className={cn("size-2.5 rounded-full shrink-0", DOT[notebook.color] || "bg-gray-300")} />
                <span className="flex-1 truncate">{notebook.label}</span>
                <span className="text-xs text-gray-400 tabular-nums">{notebook.count}</span>
              </NavLink>
              <button
                onClick={(e) => handleDeleteNotebook(e, notebook)}
                className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:grid size-6 place-items-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                aria-label="Delete notebook"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
          {notebooks.length > 5 && (
            <button
              className="flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-medium text-gray-500 hover:bg-gray-100 transition"
              onClick={() => setShowMoreNb(v => !v)}
            >
              {showMoreNb ? "Show less" : `More ›`}
            </button>
          )}
        </div>

        {/* User Profile & Logout */}
        {user && (
          <div className="mt-auto pt-4 flex flex-col gap-2">
            <button 
              onClick={() => { navigate("/profile"); onClose?.(); }}
              className="flex items-center gap-3 px-1 py-2 rounded-xl hover:bg-gray-50 transition text-left"
            >
              <div className="grid size-9 place-items-center rounded-full bg-violet-100 text-violet-600">
                <UserCircle className="size-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user.user_metadata?.full_name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="size-4" />
              Log out
            </button>

            <div className="mt-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 flex items-center gap-2">
              <div className={cn("size-1.5 rounded-full", isSupabaseConfigured ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {isSupabaseConfigured ? "Supabase Active" : "Mock Mode"}
              </span>
            </div>
          </div>
        )}
      </aside>

      <CreateNotebookModal
        open={notebookModalOpen}
        onClose={() => setNotebookModalOpen(false)}
        onCreated={handleNotebookCreated}
      />
    </>
  );
}

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false);
  const { user, focusMode } = useAppContext();

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-foreground">
      {user && !focusMode && (
        <button
          className="fixed left-4 top-3 z-40 grid size-8 place-items-center rounded-lg border border-gray-200 bg-white shadow-sm lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="size-4" />
        </button>
      )}

      {/* Desktop sidebar */}
      {user && !focusMode && (
        <div className="fixed inset-y-0 left-0 hidden w-[220px] lg:block">
          <SidebarContent />
        </div>
      )}

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && user && !focusMode && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute inset-0 bg-black/20" onClick={() => setOpen(false)} aria-label="Close" />
            <motion.div initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ duration: 0.22 }} className="relative h-full w-[220px]">
              <SidebarContent onClose={() => setOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className={cn(user && !focusMode && "lg:pl-[220px]", focusMode && "max-w-[900px] mx-auto transition-all duration-500")}>
        {children}
      </main>
    </div>
  );
}
