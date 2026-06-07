import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  FileText,
  Code2,
  Clock,
  Sparkles
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";
import { cn } from "../lib/utils";
import { Card, Badge, Button } from "../components/ui";

export default function CalendarPage() {
  const { notes } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(new Date(year, month, i));
    return days;
  }, [currentDate]);

  const notesByDateMap = useMemo(() => {
    const map = new Map(); // "YYYY-MM-DD" -> Note[]
    notes.forEach(note => {
      if (note.deletedAt || note.isArchived) return;
      
      const date = note.createdAt ? new Date(note.createdAt) : null;
      if (!date) return;
      
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(note);
    });
    return map;
  }, [notes]);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const prevMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));

  const selectedKey = selectedDate ? `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}` : null;
  const dayNotes = selectedKey ? (notesByDateMap.get(selectedKey) || []) : [];

  // Calculate streak
  const streak = useMemo(() => {
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (notesByDateMap.has(key)) count++;
      else break;
    }
    return count;
  }, [notesByDateMap]);

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-50 bg-white/80 backdrop-blur px-8 max-md:pl-16">
        <div className="flex items-center gap-3">
           <div className="size-10 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600">
              <CalendarIcon className="size-5" />
           </div>
           <div>
             <h1 className="text-lg font-black text-gray-900 leading-none">Calendar</h1>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Timeline Discovery</p>
           </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-white hover:shadow-sm" onClick={prevMonth}><ChevronLeft className="size-4" /></Button>
            <span className="text-xs font-black min-w-[100px] text-center uppercase tracking-widest">{monthName} {year}</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-white hover:shadow-sm" onClick={nextMonth}><ChevronRight className="size-4" /></Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-16">
          
          {/* Calendar Grid */}
          <div className="space-y-8">
            <div className="grid grid-cols-7 gap-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] py-2">
                  {d}
                </div>
              ))}
              {daysInMonth.map((date, i) => {
                if (!date) return <div key={`empty-${i}`} className="aspect-square" />;
                
                const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                const notesCount = notesByDateMap.get(key)?.length || 0;
                const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                const isToday = new Date().toDateString() === date.toDateString();

                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "relative aspect-square flex flex-col items-center justify-center rounded-[2rem] transition-all duration-300",
                      isSelected ? "bg-violet-600 text-white shadow-2xl shadow-violet-200 z-10" : 
                      isToday ? "bg-violet-50 text-violet-600 font-black border-2 border-violet-100" : "hover:bg-gray-50 text-gray-800 border-2 border-transparent"
                    )}
                  >
                    <span className="text-sm font-bold">{date.getDate()}</span>
                    {notesCount > 0 && (
                      <div className="absolute bottom-3 flex gap-0.5">
                        {Array.from({ length: Math.min(notesCount, 3) }).map((_, idx) => (
                          <div key={idx} className={cn(
                            "size-1 rounded-full",
                            isSelected ? "bg-white/60" : "bg-violet-400"
                          )} />
                        ))}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="pt-8 grid grid-cols-2 gap-6">
               <Card className="p-8 border-none bg-gray-50 shadow-none rounded-[2.5rem]" animate={false}>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Monthly Notes</p>
                  <p className="text-4xl font-black text-gray-900">
                    {Array.from(notesByDateMap.values()).flat().filter(n => {
                      const d = new Date(n.createdAt);
                      return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
                    }).length}
                  </p>
               </Card>
               <Card className="p-8 border-none bg-violet-600 text-white shadow-xl shadow-violet-100 rounded-[2.5rem]" animate={false}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="size-4 text-violet-200" />
                    <p className="text-[10px] font-black text-violet-200 uppercase tracking-widest">Writing Streak</p>
                  </div>
                  <p className="text-4xl font-black">{streak} Days</p>
               </Card>
            </div>
          </div>

          {/* Side Panel */}
          <div className="min-w-0">
            <div className="sticky top-28">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900">
                  {selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
                <p className="text-gray-500 text-sm mt-1 font-medium">
                  {dayNotes.length > 0 ? `You captured ${dayNotes.length} ideas on this day.` : "No notes found for this date."}
                </p>
              </div>
              
              <div className="flex flex-col gap-4">
                {dayNotes.map((note, i) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link to={note.route || `/journal/${note.id}`}>
                      <Card className="p-6 flex items-center gap-5 group hover:border-violet-200 transition-all rounded-3xl" animate={false}>
                        <div className={cn(
                          "size-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                          note.kind === "code" ? "bg-indigo-50 text-indigo-600" : "bg-violet-50 text-violet-600"
                        )}>
                          {note.kind === "code" ? <Code2 className="size-7" /> : <FileText className="size-7" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-black text-gray-900 truncate group-hover:text-violet-600 transition-colors">
                            {note.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1.5">
                            <Badge className="bg-gray-50 text-gray-500 border-none font-bold text-[10px]">{note.notebook}</Badge>
                            <span className="text-[10px] font-bold text-gray-300 uppercase flex items-center gap-1">
                              <Clock className="size-3" />
                              {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}

                {dayNotes.length === 0 && (
                  <div className="py-20 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
                    <div className="size-16 rounded-3xl bg-white shadow-sm flex items-center justify-center mb-4 text-gray-200">
                      <FileText className="size-8" />
                    </div>
                    <p className="text-sm font-bold text-gray-400">Silence is creative too.</p>
                    <button className="mt-6 text-xs font-black text-violet-600 uppercase tracking-widest hover:text-violet-700 transition-colors">
                      + Create Note
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
