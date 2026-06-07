import { motion } from "framer-motion";
import { Tag, Hash, ChevronRight, FileText, Code2, Search, X } from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";
import { cn } from "../lib/utils";
import { Card, Badge, Button } from "../components/ui";

export default function TagsPage() {
  const { notes } = useAppContext();
  const [selectedTag, setSelectedTag] = useState(null);
  const [query, setQuery] = useState("");

  const allTagsData = useMemo(() => {
    const tagMap = new Map(); // tag -> Set of noteIds

    notes.forEach(note => {
      if (note.deletedAt) return;
      
      const noteTags = new Set();
      
      // 1. Scrape from content
      const content = (note.body + " " + note.title);
      const matches = content.match(/#[\w-]+/g);
      if (matches) matches.forEach(t => noteTags.add(t.toLowerCase()));
      
      // 2. Read explicit tags from localStorage
      try {
        const explicit = JSON.parse(window.localStorage.getItem(`note-tags-${note.id}`) || "[]");
        explicit.forEach(t => {
           const normalized = t.startsWith("#") ? t.toLowerCase() : `#${t.toLowerCase()}`;
           noteTags.add(normalized);
        });
      } catch (e) {
        console.error("Error reading tags for note", note.id, e);
      }

      // Add to map
      noteTags.forEach(tag => {
        if (!tagMap.has(tag)) tagMap.set(tag, new Set());
        tagMap.get(tag).add(note.id);
      });
    });

    return tagMap;
  }, [notes]);

  const allTags = useMemo(() => Array.from(allTagsData.keys()).sort(), [allTagsData]);

  const filteredNotes = useMemo(() => {
    if (!selectedTag) return [];
    const noteIds = allTagsData.get(selectedTag);
    if (!noteIds) return [];
    return notes.filter(n => noteIds.has(n.id) && !n.deletedAt && !n.isArchived);
  }, [notes, selectedTag, allTagsData]);

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur px-8 max-md:pl-16">
        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Tag className="size-5 text-gray-400" />
          Tags
        </h1>
        <label className="flex h-9 w-full max-w-[300px] items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 text-sm shadow-sm">
          <Search className="size-4 text-gray-400 shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tags..."
            className="flex-1 bg-transparent outline-none"
          />
        </label>
      </header>

      <main className="mx-auto max-w-[1000px] px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-10">
          
          {/* Tags Sidebar */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">All Tags</h2>
            <div className="flex flex-wrap gap-2">
              {allTags.filter(t => t.includes(query.toLowerCase())).map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all",
                    selectedTag === tag 
                      ? "bg-violet-600 text-white shadow-md shadow-violet-200" 
                      : "bg-white border border-gray-100 text-gray-500 hover:border-gray-200"
                  )}
                >
                  <Hash className={cn("size-3", selectedTag === tag ? "text-violet-200" : "text-gray-300")} />
                  {tag.replace("#", "")}
                  <span className={cn(
                    "text-[10px] ml-1 opacity-60",
                    selectedTag === tag ? "text-white" : "text-gray-400"
                  )}>
                    {allTagsData.get(tag).size}
                  </span>
                </button>
              ))}
            </div>
            {allTags.length === 0 && (
              <div className="py-10 text-center border border-dashed border-gray-200 rounded-2xl">
                <p className="text-xs text-gray-400">No tags found. Add #hashtags to your notes to see them here.</p>
              </div>
            )}
          </div>

          {/* Notes List */}
          <div className="flex flex-col gap-6">
            {selectedTag ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    Notes tagged with 
                    <span className="text-violet-600 px-3 py-1 bg-violet-50 rounded-lg flex items-center gap-1">
                      <Hash className="size-4" />
                      {selectedTag.replace("#", "")}
                    </span>
                  </h2>
                  <button 
                    onClick={() => setSelectedTag(null)}
                    className="text-sm font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1"
                  >
                    <X className="size-4" /> Clear
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {filteredNotes.map(note => (
                    <Link key={note.id} to={note.route || `/journal/${note.id}`}>
                      <Card className="p-4 flex items-center gap-4 group hover:border-violet-200" animate={false}>
                        <div className={cn(
                          "size-10 rounded-xl flex items-center justify-center shrink-0",
                          note.kind === "code" ? "bg-indigo-50 text-indigo-600" : "bg-violet-50 text-violet-600"
                        )}>
                          {note.kind === "code" ? <Code2 className="size-5" /> : <FileText className="size-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-violet-600 transition-colors">{note.title}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">{note.notebook} • {note.date}</p>
                        </div>
                        <ChevronRight className="size-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
                      </Card>
                    </Link>
                  ))}
                  {filteredNotes.length === 0 && (
                    <p className="text-gray-500 py-10 text-center">No active notes found with this tag.</p>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="py-20 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-100">
                <Tag className="size-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-1">Select a tag</h3>
                <p className="text-gray-500 text-sm">Click a tag on the left to see all related notes.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
