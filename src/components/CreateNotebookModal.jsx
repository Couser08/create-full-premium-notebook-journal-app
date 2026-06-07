import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Briefcase,
  Code2,
  FileText,
  Lightbulb,
  NotebookTabs,
  Palette,
  X,
  ChevronDown
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAppContext } from "../hooks/useAppContext";
import { CustomSelect } from "./ui";

/* 7 distinct icons + accent colors matching the image */
const COLOR_OPTIONS = [
  { id: "violet",  label: "Violet",  icon: NotebookTabs, bg: "bg-violet-100",  ring: "ring-violet-400",  iconColor: "text-violet-600",  dot: "bg-violet-500"  },
  { id: "blue",    label: "Blue",    icon: FileText,      bg: "bg-blue-100",    ring: "ring-blue-400",    iconColor: "text-blue-600",    dot: "bg-blue-500"    },
  { id: "green",   label: "Green",   icon: BookOpen,      bg: "bg-emerald-100", ring: "ring-emerald-400", iconColor: "text-emerald-600", dot: "bg-emerald-500" },
  { id: "amber",   label: "Amber",   icon: Lightbulb,     bg: "bg-amber-100",   ring: "ring-amber-400",   iconColor: "text-amber-600",   dot: "bg-amber-500"   },
  { id: "pink",    label: "Pink",    icon: Palette,       bg: "bg-pink-100",    ring: "ring-pink-400",    iconColor: "text-pink-600",    dot: "bg-pink-500"    },
  { id: "indigo",  label: "Indigo",  icon: Code2,         bg: "bg-indigo-100",  ring: "ring-indigo-400",  iconColor: "text-indigo-600",  dot: "bg-indigo-500"  },
  { id: "slate",   label: "Slate",   icon: Briefcase,     bg: "bg-slate-100",   ring: "ring-slate-400",   iconColor: "text-slate-600",   dot: "bg-slate-500"   },
];

const MAX_DESC = 200;

export default function CreateNotebookModal({ open, onClose, onCreated }) {
  const { notebooks, addNotebook } = useAppContext();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState("violet");
  const [addTo, setAddTo] = useState("Notebooks");
  const nameRef = useRef(null);

  /* Auto-focus name on open */
  useEffect(() => {
    if (open) {
      setName("");
      setDesc("");
      setColor("violet");
      setTimeout(() => nameRef.current?.focus(), 80);
    }
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  function handleCreate() {
    const label = name.trim();
    if (!label) return;
    const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "nb";
    const id = `${slug}-${Math.random().toString(36).substring(2, 9)}`;
    const notebook = { id, label, count: 0, color, description: desc };
    addNotebook(notebook);
    onClose();
    onCreated?.(notebook);
  }

  const selectedColor = COLOR_OPTIONS.find(c => c.id === color);
  
  const addToOptions = [
    { label: "Notebooks", value: "Notebooks" },
    ...notebooks.map(nb => ({ label: nb.label, value: nb.label }))
  ];

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
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            className="relative z-10 w-full max-w-[480px] rounded-2xl bg-white shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-gray-100">
              <h2 className="text-[1.1rem] font-bold text-gray-900 tracking-tight">Create New Notebook</h2>
              <button
                onClick={onClose}
                className="grid size-8 place-items-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-7 py-5 flex flex-col gap-5">
              {/* Notebook Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="nb-name">
                  Notebook Name
                </label>
                <input
                  id="nb-name"
                  ref={nameRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="e.g. Project Ideas"
                  className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-violet-400 focus:ring-3 focus:ring-violet-100"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="nb-desc">
                  Description <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <div className="relative">
                  <textarea
                    id="nb-desc"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value.slice(0, MAX_DESC))}
                    placeholder="Add a short description..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-violet-400 focus:ring-3 focus:ring-violet-100"
                  />
                  <span className="absolute bottom-2.5 right-3 text-[11px] text-gray-400 font-medium">
                    {desc.length}/{MAX_DESC}
                  </span>
                </div>
              </div>

              {/* Choose Color */}
              <div className="flex flex-col gap-3">
                <span className="text-sm font-semibold text-gray-700">Choose Color</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = color === opt.id;
                    return (
                      <button
                        key={opt.id}
                        title={opt.label}
                        onClick={() => setColor(opt.id)}
                        className={[
                          "relative grid size-[46px] place-items-center rounded-xl border-2 transition-all",
                          opt.bg,
                          isSelected
                            ? `border-transparent ring-2 ${opt.ring} scale-105`
                            : "border-transparent hover:scale-105"
                        ].join(" ")}
                        aria-label={opt.label}
                        aria-pressed={isSelected}
                      >
                        <Icon className={["size-5", opt.iconColor].join(" ")} />
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-violet-600">
                            <svg className="size-2.5 text-white" fill="none" viewBox="0 0 10 8">
                              <path d="M1 4l2.5 3L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add To */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-700">Add to</span>
                <CustomSelect
                  value={addTo}
                  onChange={setAddTo}
                  options={addToOptions}
                  icon={NotebookTabs}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-gray-100">
              <button
                onClick={onClose}
                className="h-10 rounded-xl px-5 text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim()}
                className="h-10 rounded-xl px-5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Create Notebook
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
