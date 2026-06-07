import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Briefcase, Code2, FileText, Lightbulb, NotebookTabs, X, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAppContext } from "../hooks/useAppContext";
import { CustomSelect } from "./ui";

const NOTEBOOK_ICONS = {
  violet: NotebookTabs,
  blue: FileText,
  green: BookOpen,
  amber: Lightbulb,
  pink: NotebookTabs,
  indigo: Code2,
  slate: Briefcase,
};

const KIND_OPTIONS = [
  { id: "journal", label: "Journal Note", desc: "Rich text with sections" },
  { id: "code",    label: "Code Note",    desc: "Code editor & snippets" },
];

export default function CreateNoteModal({ open, onClose, onCreated }) {
  const { notebooks } = useAppContext();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("journal");
  const [notebookId, setNotebookId] = useState(notebooks[0]?.id || "personal");
  const titleRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setKind("journal");
      setNotebookId(notebooks[0]?.id || "personal");
      setTimeout(() => titleRef.current?.focus(), 80);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  function handleCreate() {
    const trimmed = title.trim();
    if (!trimmed) return;
    const id = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `note-${Date.now()}`;
    const route = kind === "code" ? `/code/${id}` : `/journal/${id}`;
    
    // Save template data to localStorage so the editor picks them up
    window.localStorage.setItem(`note-title-${id}`, trimmed);
    window.localStorage.setItem(`note-sections-${id}`, JSON.stringify([]));
    window.localStorage.setItem(`note-date-${id}`, new Date().toLocaleString());

    const nb = notebooks.find(n => n.id === notebookId);
    onCreated?.({ id, title: trimmed, kind, notebookId, notebook: nb?.label || "Personal", route });
    onClose();
  }

  const selectedNb = notebooks.find(n => n.id === notebookId);
  const NbIcon = NOTEBOOK_ICONS[selectedNb?.color] || NotebookTabs;

  const nbOptions = notebooks.map(nb => ({
    label: nb.label,
    value: nb.id,
    icon: NOTEBOOK_ICONS[nb.color] || NotebookTabs
  }));

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px]" onClick={onClose} />

          <motion.div
            className="relative z-10 w-full max-w-[420px] rounded-2xl bg-white shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-gray-100">
              <h2 className="text-[1.1rem] font-bold text-gray-900 tracking-tight">Create New Note</h2>
              <button onClick={onClose} className="grid size-8 place-items-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
                <X className="size-4" />
              </button>
            </div>

            <div className="px-7 py-5 flex flex-col gap-5">
              {/* Title */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="note-title">Note Title</label>
                <input
                  id="note-title"
                  ref={titleRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="e.g. Meeting Notes"
                  className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-violet-400 focus:ring-3 focus:ring-violet-100"
                />
              </div>

              {/* Kind */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-700">Note Type</span>
                <div className="grid grid-cols-2 gap-3">
                  {KIND_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setKind(opt.id)}
                      className={[
                        "flex flex-col items-start gap-1 rounded-xl border-2 px-4 py-3 text-left transition",
                        kind === opt.id
                          ? "border-violet-400 bg-violet-50"
                          : "border-gray-200 hover:border-gray-300"
                      ].join(" ")}
                    >
                      <span className={["text-sm font-bold", kind === opt.id ? "text-violet-700" : "text-gray-800"].join(" ")}>
                        {opt.label}
                      </span>
                      <span className="text-xs text-gray-500">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notebook */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-700">Add to Notebook</span>
                <CustomSelect
                  value={notebookId}
                  onChange={setNotebookId}
                  options={nbOptions}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-gray-100">
              <button onClick={onClose} className="h-10 rounded-xl px-5 text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!title.trim()}
                className="h-10 rounded-xl px-5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Create Note
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
