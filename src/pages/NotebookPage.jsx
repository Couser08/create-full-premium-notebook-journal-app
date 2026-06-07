import { motion } from "framer-motion";
import {
  BookOpen, Briefcase, Code2, FileText, Lightbulb,
  NotebookTabs, Plus, MoreHorizontal, Search
} from "lucide-react";
import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";
import CreateNoteModal from "../components/CreateNoteModal";
import { cn } from "../lib/utils";

const ICON_MAP = {
  violet: NotebookTabs,
  blue: FileText,
  green: BookOpen,
  amber: Lightbulb,
  pink: NotebookTabs,
  indigo: Code2,
  slate: Briefcase,
};

const COLOR_BG = {
  violet: "bg-violet-100 text-violet-600",
  blue:   "bg-blue-100 text-blue-600",
  green:  "bg-emerald-100 text-emerald-600",
  amber:  "bg-amber-100 text-amber-600",
  pink:   "bg-pink-100 text-pink-600",
  indigo: "bg-indigo-100 text-indigo-600",
  slate:  "bg-slate-100 text-slate-600",
};

const DOT_COLOR = {
  violet: "bg-violet-500",
  blue:   "bg-blue-500",
  green:  "bg-emerald-500",
  amber:  "bg-amber-500",
  pink:   "bg-pink-500",
  indigo: "bg-indigo-500",
  slate:  "bg-slate-500",
};

export default function NotebookPage() {
  const { notebookId } = useParams();
  const navigate = useNavigate();
  const { notebooks, notes, addNote } = useAppContext();
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [query, setQuery] = useState("");

  const notebook = notebooks.find(nb => nb.id === notebookId);
  const notebookNotes = notes.filter(
    n => n.notebook?.toLowerCase() === notebook?.label?.toLowerCase()
  ).filter(n =>
    !query || n.title.toLowerCase().includes(query.toLowerCase()) || n.body?.toLowerCase().includes(query.toLowerCase())
  );

  if (!notebook) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-400 mb-3">Notebook not found</p>
          <Link to="/" className="text-violet-600 font-semibold hover:underline">← Back home</Link>
        </div>
      </div>
    );
  }

  const NbIcon = ICON_MAP[notebook.color] || NotebookTabs;
  const bgColor = COLOR_BG[notebook.color] || COLOR_BG.violet;

  function handleNoteCreated({ id, title, kind, notebook: nb, route }) {
    addNote({
      id,
      title,
      body: kind === "code" ? "Code note..." : "Fresh note...",
      date: "Just now",
      notebook: nb,
      color: notebook.color || "violet",
      route,
    });
    navigate(route);
  }

  return (
    <div className="min-h-screen px-10 py-10 max-lg:px-6 max-md:pl-16">
      <div className="mx-auto max-w-[920px]">

        {/* Notebook Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-10"
        >
          <div className="flex items-center gap-5 mb-6">
            <span className={cn("grid size-16 place-items-center rounded-2xl shadow-sm", bgColor)}>
              <NbIcon className="size-8" />
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">{notebook.label}</h1>
              {notebook.description && (
                <p className="mt-1 text-base text-gray-500">{notebook.description}</p>
              )}
              <p className="mt-1 text-sm font-medium text-gray-400">
                {notebookNotes.length} {notebookNotes.length === 1 ? "note" : "notes"}
              </p>
            </div>
          </div>

          {/* Search + Add */}
          <div className="flex items-center gap-3">
            <label className="flex h-11 flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 shadow-sm max-w-[400px]">
              <Search className="size-4 text-gray-400 shrink-0" />
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                placeholder={`Search in ${notebook.label}...`}
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </label>
            <button
              onClick={() => setNoteModalOpen(true)}
              className="flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white hover:bg-violet-700 transition shadow-sm"
            >
              <Plus className="size-4" />
              New Note
            </button>
          </div>
        </motion.div>

        {/* Divider */}
        <div className={cn("h-1 w-16 rounded-full mb-8", DOT_COLOR[notebook.color] || "bg-violet-500")} />

        {/* Notes grid */}
        {notebookNotes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center"
          >
            <span className={cn("grid size-16 place-items-center rounded-2xl mb-4", bgColor)}>
              <NbIcon className="size-8" />
            </span>
            <p className="text-lg font-bold text-gray-700 mb-2">No notes yet</p>
            <p className="text-sm text-gray-400 mb-6">Create your first note in this notebook</p>
            <button
              onClick={() => setNoteModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition"
            >
              <Plus className="size-4" /> Create Note
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            {notebookNotes.map((note, index) => {
              const NoteIcon = ICON_MAP[note.color] || FileText;
              const noteBg = COLOR_BG[note.color] || COLOR_BG.violet;
              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={note.route || `/journal/${note.id}`}>
                    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                      <span className={cn("grid size-12 shrink-0 place-items-center rounded-xl", noteBg)}>
                        {typeof note.icon === "function" ? (
                          <note.icon className="size-6" />
                        ) : (
                          <NoteIcon className="size-6" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 truncate">{note.title}</p>
                        <p className="text-sm text-gray-500 truncate mt-0.5">{note.body}</p>
                      </div>
                      <div className="shrink-0 text-right hidden sm:block">
                        <p className="text-xs text-gray-400 font-medium">{note.date}</p>
                      </div>
                      <MoreHorizontal className="size-5 text-gray-400 shrink-0" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <CreateNoteModal
        open={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        onCreated={handleNoteCreated}
      />
    </div>
  );
}
