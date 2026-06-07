import { motion } from "framer-motion";
import { Search, Bell, SunMedium, Trash2, Undo2, MoreHorizontal, Calendar, Info, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";
import { cn } from "../lib/utils";
import AppShell from "../components/AppShell";

const DOT = {
  violet: "bg-violet-500",
  blue:   "bg-blue-500",
  amber:  "bg-amber-500",
  green:  "bg-emerald-500",
  pink:   "bg-pink-500",
  indigo: "bg-indigo-500",
  slate:  "bg-slate-400",
};

export default function TrashPage() {
  const { notes, notebooks, restoreNote, permanentlyDeleteNote } = useAppContext();
  const [query, setQuery] = useState("");
  
  // Filter only notes that have been soft-deleted
  let trashNotes = notes.filter(n => n.deletedAt);
  
  if (query) {
    trashNotes = trashNotes.filter(n =>
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.body?.toLowerCase().includes(query.toLowerCase())
    );
  }

  const handleRestore = (e, id) => {
    e.preventDefault();
    restoreNote(id);
  };

  const handlePermanentDelete = (e, id) => {
    e.preventDefault();
    permanentlyDeleteNote(id);
  };

  const calculateExpiresIn = (deletedAt) => {
    if (!deletedAt) return "30 days left";
    const deletedDate = new Date(deletedAt);
    const expireDate = new Date(deletedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffTime = Math.abs(expireDate - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days left`;
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] flex">
      <AppShell />
      <div className="flex-1">
        {/* ── Top bar ── */}
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur px-8 max-md:pl-16">
          <label className="flex h-9 w-full max-w-[360px] items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 text-sm shadow-sm">
            <Search className="size-4 text-gray-400 shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search in trash..."
              className="flex-1 bg-transparent outline-none placeholder:text-gray-400"
            />
            <span className="hidden shrink-0 items-center gap-1 rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-gray-400 sm:flex">
              ⌘ K
            </span>
          </label>
          
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 sm:flex">
              <ShieldAlert className="size-4 text-blue-500 shrink-0" />
              <span className="text-xs font-medium text-blue-700">Notes in trash are deleted permanently after 30 days.</span>
            </div>

            <div className="flex items-center gap-3">
              <button className="grid size-9 place-items-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-50 transition">
                <SunMedium className="size-4" />
              </button>
              <button className="relative grid size-9 place-items-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-50 transition">
                <Bell className="size-4" />
              </button>
              <button className="grid size-9 place-items-center rounded-full bg-violet-600 text-sm font-bold text-white shadow-sm">A</button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-10 flex items-start gap-8">
          
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="grid size-12 place-items-center rounded-xl bg-gray-100 text-gray-600">
                  <Trash2 className="size-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Trash</h1>
                  <p className="text-sm font-medium text-gray-500 mt-0.5">{trashNotes.length} notes</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  disabled={trashNotes.length === 0}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="size-4 text-gray-400" />
                  Delete permanently
                </button>
                <span className="text-sm font-medium text-gray-500 hidden sm:block">Sort by: Deleted (newest)</span>
              </div>
            </div>

            {/* Trash List */}
            {trashNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-24 text-center">
                <Trash2 className="mb-4 size-12 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-900">Trash is empty</h3>
                <p className="mt-1 text-sm text-gray-500">Deleted notes will appear here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {/* Table Header */}
                <div className="flex items-center gap-4 px-5 pb-2 text-xs font-semibold text-gray-500">
                  <div className="w-5" />
                  <div className="flex-1">Note</div>
                  <div className="hidden w-24 sm:block">Notebook</div>
                  <div className="hidden w-24 text-right sm:block">Deleted on</div>
                  <div className="hidden w-24 text-right sm:block">Expires in</div>
                  <div className="w-24" />
                </div>

                {trashNotes.map((note, index) => {
                  const nb = notebooks.find(n => n.label === note.notebook);
                  const expiresIn = calculateExpiresIn(note.deletedAt);
                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-3.5 shadow-sm hover:border-red-100 hover:shadow-md transition-all group">
                        <input type="checkbox" className="size-4 rounded border-gray-300 text-violet-600 focus:ring-violet-600" />
                        
                        <span className={cn(
                          "grid size-10 shrink-0 place-items-center rounded-xl text-lg",
                          note.color === "violet" ? "bg-violet-100" :
                          note.color === "blue"   ? "bg-blue-100" :
                          note.color === "green"  ? "bg-emerald-100" :
                          note.color === "amber"  ? "bg-amber-100" :
                          note.color === "pink"   ? "bg-pink-100" : "bg-slate-100"
                        )}>
                          {typeof note.icon === "function"
                            ? <note.icon className={cn("size-5", `text-${note.color}-600`)} />
                            : <span>📝</span>}
                        </span>
                        
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-gray-900">{note.title}</p>
                          <p className="truncate text-xs font-medium text-gray-500 mt-0.5">{note.body}</p>
                        </div>

                        <div className="hidden shrink-0 items-center gap-6 sm:flex">
                          {nb ? (
                            <span className="flex w-24 items-center gap-2 text-xs font-semibold text-gray-600">
                              <span className={cn("size-2 rounded-full", DOT[nb.color] || "bg-gray-300")} />
                              {nb.label}
                            </span>
                          ) : <span className="w-24 text-xs text-gray-400">Orphaned</span>}
                          
                          <span className="w-24 text-right text-xs font-medium text-gray-500">Today, 9:41 AM</span>
                          <span className="w-24 text-right text-xs font-semibold text-red-500">{expiresIn}</span>
                        </div>

                        <div className="flex items-center justify-end gap-2 w-24 shrink-0 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={(e) => handleRestore(e, note.id)}
                            className="grid size-8 place-items-center rounded-md text-violet-600 hover:bg-violet-50 transition"
                            title="Restore"
                          >
                            <Undo2 className="size-4" />
                          </button>
                          <button
                            onClick={(e) => handlePermanentDelete(e, note.id)}
                            className="grid size-8 place-items-center rounded-md text-red-600 hover:bg-red-50 transition"
                            title="Delete permanently"
                          >
                            <Trash2 className="size-4" />
                          </button>
                          <button className="grid size-8 place-items-center rounded-md text-gray-400 hover:bg-gray-100 transition">
                            <MoreHorizontal className="size-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar - Trash Info */}
          <div className="hidden w-64 shrink-0 lg:block pt-16">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-5">Trash info</h3>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-500 font-medium">
                    <Calendar className="size-4" />
                    Items in trash
                  </div>
                  <span className="font-semibold text-gray-900">{trashNotes.length}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-500 font-medium">
                    <Info className="size-4" />
                    Auto delete after
                  </div>
                  <span className="font-semibold text-gray-900">30 days</span>
                </div>

                <div className="mt-2 flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
                  <ShieldAlert className="size-4 shrink-0 text-gray-400 mt-0.5" />
                  <p>You can restore notes before they're permanently deleted.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
