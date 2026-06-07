import { AnimatePresence, motion } from "framer-motion";
import { Palette, Plus, RotateCcw } from "lucide-react";
import { sectionOptions } from "../data/notebookData";
import { Button } from "./ui";

export default function SectionPalette({ open, onToggle, onAdd, onReset }) {
  return (
    <div className="fixed bottom-8 right-8 z-30 flex flex-col items-end gap-3 max-sm:bottom-5 max-sm:right-5">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className="w-[270px] rounded-xl border border-border bg-background p-3 shadow-soft"
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-sm font-bold">Add section</span>
              <button className="rounded-md p-1 text-muted-foreground transition hover:bg-muted" onClick={onReset} aria-label="Reset sections">
                <RotateCcw className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {sectionOptions.map((option) => (
                <button
                  key={option.type}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background p-3 text-left text-xs font-semibold transition hover:border-primary/30 hover:bg-lavender hover:text-primary"
                  onClick={() => onAdd(option.type)}
                >
                  <option.icon className="size-4" />
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <Button className="size-14 rounded-full p-0 shadow-soft" onClick={onToggle} aria-label="Open section palette">
        {open ? <Palette className="size-6" /> : <Plus className="size-7" />}
      </Button>
    </div>
  );
}
