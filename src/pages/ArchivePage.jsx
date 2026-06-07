import { motion } from "framer-motion";
import { Archive, RotateCcw, Trash2, FileText, Code2, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";
import { cn } from "../lib/utils";
import { Card, Button, Badge } from "../components/ui";
import { useToast } from "../components/Toast";

export default function ArchivePage() {
  const { notes, restoreFromArchive, permanentlyDeleteNote } = useAppContext();
  const { addToast } = useToast();
  const [query, setQuery] = useState("");

  const archivedNotes = notes.filter(n => n.isArchived && !n.deletedAt);
  const filteredNotes = archivedNotes.filter(n => 
    n.title.toLowerCase().includes(query.toLowerCase())
  );

  function handleRestore(id, title) {
    restoreFromArchive(id);
    addToast(`Restored "${title}" from archive`);
  }

  function handleDelete(id, title) {
    if (window.confirm(`Permanently delete "${title}"?`)) {
      permanentlyDeleteNote(id);
      addToast(`Deleted "${title}" permanently`);
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur px-8 max-md:pl-16">
        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Archive className="size-5 text-gray-400" />
          Archive
        </h1>
        <label className="flex h-9 w-full max-w-[300px] items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 text-sm shadow-sm">
          <Search className="size-4 text-gray-400 shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search archive..."
            className="flex-1 bg-transparent outline-none"
          />
        </label>
      </header>

      <main className="mx-auto max-w-[800px] px-8 py-10">
        <div className="mb-8">
          <p className="text-sm text-gray-500">
            Archived notes are hidden from your main list but kept safe here.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {filteredNotes.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-4 flex items-center gap-4 group" animate={false}>
                <div className={cn(
                  "size-10 rounded-xl flex items-center justify-center shrink-0",
                  note.kind === "code" ? "bg-indigo-50 text-indigo-600" : "bg-violet-50 text-violet-600"
                )}>
                  {note.kind === "code" ? <Code2 className="size-5" /> : <FileText className="size-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 truncate">{note.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{note.notebook} • Archived on {note.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 rounded-lg gap-2 text-xs"
                    onClick={() => handleRestore(note.id, note.title)}
                  >
                    <RotateCcw className="size-3" />
                    Restore
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleDelete(note.id, note.title)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}

          {filteredNotes.length === 0 && (
            <div className="py-20 text-center">
              <div className="size-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Archive className="size-10 text-gray-200" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Archive is empty</h3>
              <p className="text-gray-500">You haven't archived any notes yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
