import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle, Tag, X } from "lucide-react";
import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { EditorTopbar, FormattingToolbar, PageTabs } from "../components/EditorChrome";
import { JournalSectionRenderer } from "../components/JournalSections";
import SectionPalette from "../components/SectionPalette";
import { useToast } from "../components/Toast";
import { journalSections } from "../data/notebookData";
import { useNotebookSections } from "../hooks/useNotebookSections";
import { useAppContext } from "../hooks/useAppContext";

export default function JournalEditorPage() {
  const { noteId = "project-plan" } = useParams();
  const navigate = useNavigate();
  const { deleteNote } = useAppContext();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [title, setTitle] = useState(
    () => window.localStorage.getItem(`note-title-${noteId}`) ||
      (noteId === "daily-journal" ? "Daily Journal" : "Untitled Note")
  );
  const [date, setDate] = useState(
    () => window.localStorage.getItem(`note-date-${noteId}`) || new Date().toLocaleString()
  );
  const [tags, setTags] = useState(
    () => JSON.parse(window.localStorage.getItem(`note-tags-${noteId}`) || "[]")
  );
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const tagRef = useRef(null);
  const { addToast } = useToast();

  const { 
    sections, addSection, removeSection, updateSection, moveSection, resetSections,
    pages, activePageId, addPage, removePage, renamePage, switchPage
  } = useNotebookSections(`note-sections-${noteId}`, journalSections);

  function saveTitle(value) {
    setTitle(value);
    window.localStorage.setItem(`note-title-${noteId}`, value);
  }
  function saveDate(value) {
    setDate(value);
    window.localStorage.setItem(`note-date-${noteId}`, value);
  }
  function handleDelete() { setShowDeleteConfirm(true); }
  function confirmDelete() {
    deleteNote(noteId);
    navigate("/");
  }

  function submitTag(e) {
    e.preventDefault();
    if (!tagInput.trim()) return;
    const next = [...tags, tagInput.trim()];
    setTags(next);
    window.localStorage.setItem(`note-tags-${noteId}`, JSON.stringify(next));
    addToast("Tag added");
    setTagInput("");
    setShowTagInput(false);
  }

  const wordCount = sections.map(s => JSON.stringify(s)).join(" ").split(/\s+/).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <EditorTopbar crumbs={["Work", title]} noteId={noteId} onDelete={handleDelete} isEditMode={isEditMode} setIsEditMode={setIsEditMode} />
      <article className="editor-page">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {isEditMode ? (
            <input className="editor-title title-input" value={title} onChange={e => saveTitle(e.target.value)} />
          ) : (
            <h1 className="editor-title pb-2">{title}</h1>
          )}
          
          {isEditMode ? (
            <input className="editor-date date-input" value={date} onChange={e => saveDate(e.target.value)} />
          ) : (
            <p className="editor-date">{date}</p>
          )}

          <PageTabs
            pages={pages}
            activePageId={activePageId}
            onSwitch={switchPage}
            onAdd={addPage}
            onRename={renamePage}
            onRemove={removePage}
            isEditMode={isEditMode}
          />
          
          {tags.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <button
                  key={`${tag}-${index}`}
                  className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-red-50 hover:text-red-500 transition"
                  onClick={() => {
                    const next = tags.filter((_, i) => i !== index);
                    setTags(next);
                    window.localStorage.setItem(`note-tags-${noteId}`, JSON.stringify(next));
                  }}
                >
                  {tag} <X className="size-3" />
                </button>
              ))}
            </div>
          )}
          {isEditMode && <FormattingToolbar />}
        </motion.div>

        <div className="prose-note">
          <JournalSectionRenderer sections={sections} onRemove={removeSection} onUpdate={updateSection} onMove={moveSection} isEditMode={isEditMode} />
        </div>
      </article>

      <footer className="editor-footer">
        <div className="flex items-center gap-3">
          {showTagInput && isEditMode ? (
            <form onSubmit={submitTag} className="flex items-center gap-2">
              <input
                ref={tagRef}
                autoFocus
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === "Escape" && setShowTagInput(false)}
                placeholder="tag name"
                className="h-8 rounded-lg border border-violet-300 bg-violet-50 px-3 text-sm text-violet-800 outline-none focus:ring-2 focus:ring-violet-200 w-32"
              />
              <button type="submit" className="h-8 rounded-lg bg-violet-600 px-3 text-xs font-bold text-white hover:bg-violet-700 transition">Add</button>
              <button type="button" onClick={() => setShowTagInput(false)} className="h-8 rounded-lg px-3 text-xs font-semibold text-gray-500 hover:bg-gray-100 transition">Cancel</button>
            </form>
          ) : isEditMode && (
            <button
              className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground transition hover:bg-muted"
              onClick={() => setShowTagInput(true)}
            >
              <Tag className="size-4" /> Add tag
            </button>
          )}
        </div>
        <div className="flex items-center gap-5 text-sm text-muted-foreground">
          <span>{wordCount.toLocaleString()} words</span>
          <HelpCircle className="size-5" />
        </div>
      </footer>

      {isEditMode && (
        <SectionPalette
          open={paletteOpen}
          onToggle={() => setPaletteOpen(v => !v)}
          onAdd={(type) => { addSection(type); setPaletteOpen(false); }}
          onReset={resetSections}
        />
      )}

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px]" onClick={() => setShowDeleteConfirm(false)} />
            <motion.div
              className="relative z-10 w-full max-w-[360px] rounded-2xl bg-white p-7 shadow-2xl"
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="mb-2 text-lg font-bold text-gray-900">Delete this note?</h2>
              <p className="mb-6 text-sm text-gray-500">This action cannot be undone. The note will be permanently deleted.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="h-10 rounded-xl border border-gray-200 px-5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button onClick={confirmDelete} className="h-10 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 transition">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
