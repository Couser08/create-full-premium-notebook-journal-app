import { motion } from "framer-motion";
import { 
  Users, 
  Share2, 
  UserPlus, 
  Search, 
  Clock, 
  Shield, 
  MoreHorizontal,
  ChevronRight,
  FileText,
  Code2
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";
import { cn } from "../lib/utils";
import { Card, Badge, Button } from "../components/ui";

export default function CollaborationPage() {
  const { notes } = useAppContext();
  const [activeTab, setActiveTab] = useState("shared-with-me");

  // Mock shared notes
  const sharedWithMe = [
    { id: 'shared-1', title: 'Q3 Marketing Strategy', owner: 'Sarah Chen', date: '2h ago', kind: 'journal' },
    { id: 'shared-2', title: 'Backend API Documentation', owner: 'James Wilson', date: 'Yesterday', kind: 'code' },
  ];

  const myShared = notes.slice(0, 1).map(n => ({ ...n, sharedWith: ['Sarah Chen', 'James Wilson'] }));

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur px-8 max-md:pl-16">
        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Users className="size-5 text-gray-400" />
          Collaboration
        </h1>
        <Button className="h-9 rounded-xl gap-2 bg-violet-600 hover:bg-violet-700 font-bold">
          <UserPlus className="size-4" /> Share Note
        </Button>
      </header>

      <main className="mx-auto max-w-[900px] px-8 py-10">
        <div className="mb-10 flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("shared-with-me")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === "shared-with-me" ? "bg-white text-violet-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Shared with me
          </button>
          <button
            onClick={() => setActiveTab("my-shared")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === "my-shared" ? "bg-white text-violet-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            My shared notes
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {activeTab === "shared-with-me" ? (
            sharedWithMe.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-4 flex items-center gap-4 group" animate={false}>
                  <div className={cn(
                    "size-12 rounded-2xl flex items-center justify-center shrink-0",
                    note.kind === "code" ? "bg-indigo-50 text-indigo-600" : "bg-violet-50 text-violet-600"
                  )}>
                    {note.kind === "code" ? <Code2 className="size-6" /> : <FileText className="size-6" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-gray-900 truncate">{note.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                        Owned by <span className="text-gray-900 font-bold">{note.owner}</span>
                      </span>
                      <span className="size-1 rounded-full bg-gray-200" />
                      <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                        <Clock className="size-3" /> {note.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gray-100 text-gray-600 border-none font-bold">Can View</Badge>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl">
                      <MoreHorizontal className="size-4 text-gray-400" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            myShared.length > 0 ? (
              myShared.map((note, i) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-4 flex items-center gap-4 group" animate={false}>
                     <div className={cn(
                      "size-12 rounded-2xl flex items-center justify-center shrink-0",
                      note.kind === "code" ? "bg-indigo-50 text-indigo-600" : "bg-violet-50 text-violet-600"
                    )}>
                      {note.kind === "code" ? <Code2 className="size-6" /> : <FileText className="size-6" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-gray-900 truncate">{note.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex -space-x-2 mr-2">
                          {note.sharedWith.map((user, j) => (
                            <div key={j} className="size-6 rounded-full bg-violet-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-violet-600 shadow-sm" title={user}>
                              {user.charAt(0)}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs font-medium text-gray-400">Shared with {note.sharedWith.length} people</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-9 rounded-xl border-gray-100 text-xs font-bold gap-2">
                      <Shield className="size-3" /> Manage Access
                    </Button>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="py-20 text-center">
                <Share2 className="size-16 text-gray-100 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-1">No shared notes</h3>
                <p className="text-gray-500">You haven't shared any notes with anyone yet.</p>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
