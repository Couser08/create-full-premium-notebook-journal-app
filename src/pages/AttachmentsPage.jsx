import { motion } from "framer-motion";
import { 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  Search, 
  Download, 
  ExternalLink,
  Clock,
  MoreVertical
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";
import { cn } from "../lib/utils";
import { Card, Badge, Button } from "../components/ui";

export default function AttachmentsPage() {
  const { notes } = useAppContext();
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const attachments = useMemo(() => {
    const list = [];
    notes.forEach(note => {
      if (note.deletedAt) return;
      
      // Scrape images from note body (simple regex for img src)
      const imgMatches = note.body?.match(/src="([^"]+)"/g);
      if (imgMatches) {
        imgMatches.forEach(match => {
          const url = match.split('"')[1];
          list.push({
            id: `img-${Math.random()}`,
            name: "Image Attachment",
            type: "image",
            url,
            noteTitle: note.title,
            noteId: note.id,
            date: note.date
          });
        });
      }

      // Check for explicit attachments array (future feature)
      if (note.attachments) {
        note.attachments.forEach(a => list.push({ ...a, noteTitle: note.title, noteId: note.id }));
      }
    });
    return list;
  }, [notes]);

  const filtered = attachments.filter(a => {
    const matchesQuery = a.name.toLowerCase().includes(query.toLowerCase()) || 
                        a.noteTitle.toLowerCase().includes(query.toLowerCase());
    const matchesType = selectedType === "all" || a.type === selectedType;
    return matchesQuery && matchesType;
  });

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur px-8 max-md:pl-16">
        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Paperclip className="size-5 text-gray-400" />
          Files
        </h1>
        <label className="flex h-9 w-full max-w-[300px] items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 text-sm shadow-sm">
          <Search className="size-4 text-gray-400 shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search files..."
            className="flex-1 bg-transparent outline-none"
          />
        </label>
      </header>

      <main className="mx-auto max-w-[1200px] px-8 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex gap-2">
            {["all", "image", "pdf", "document"].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition",
                  selectedType === type 
                    ? "bg-violet-600 text-white shadow-md shadow-violet-200" 
                    : "bg-white border border-gray-100 text-gray-400 hover:border-gray-200"
                )}
              >
                {type}
              </button>
            ))}
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{filtered.length} files found</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filtered.map((file, i) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="p-0 overflow-hidden group border-gray-100" animate={false}>
                <div className="aspect-square bg-gray-50 flex items-center justify-center relative overflow-hidden">
                  {file.type === "image" ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <FileText className="size-12 text-gray-200" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="size-9 rounded-full bg-white text-gray-900 flex items-center justify-center hover:bg-violet-50 hover:text-violet-600 transition shadow-lg">
                      <Download className="size-4" />
                    </button>
                    <Link to={`/journal/${file.noteId}`} className="size-9 rounded-full bg-white text-gray-900 flex items-center justify-center hover:bg-violet-50 hover:text-violet-600 transition shadow-lg">
                      <ExternalLink className="size-4" />
                    </Link>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-bold text-gray-800 truncate mb-1">{file.name}</h3>
                  <p className="text-[10px] text-gray-400 font-medium truncate flex items-center gap-1">
                    <Clock className="size-2.5" /> {file.date} • {file.noteTitle}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <ImageIcon className="size-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-1">No files found</h3>
              <p className="text-gray-500">Add images or documents to your notes to see them here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
