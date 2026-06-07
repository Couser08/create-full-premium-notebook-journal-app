import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  Eraser,
  Expand,
  GripVertical,
  Info,
  Lightbulb,
  Palette,
  PenLine,
  Plus,
  Trash2,
  Table2,
  List,
  Heading1,
  Heading2,
  Quote,
  CheckSquare
} from "lucide-react";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import { cn } from "../lib/utils";
import { Badge } from "./ui";

/* ─── Sticky colors ─── */
const stickyStyles = {
  amber:  "border-amber-200 bg-amber-50/80 text-amber-950",
  violet: "border-violet-200 bg-violet-50/80 text-violet-950",
  green:  "border-emerald-200 bg-emerald-50/80 text-emerald-950",
  pink:   "border-pink-200 bg-pink-50/80 text-pink-950",
};

/* ─── Language map for Prism ─── */
const LANG_MAP = {
  JS: "javascript", TS: "typescript", JSX: "jsx",
  PY: "python", CSS: "css", HTML: "markup",
  javascript: "javascript", typescript: "typescript",
  python: "python", css: "css", html: "markup",
};

/* ════════════════════════════════════════════════════════════
   RichText — contentEditable with formatting toolbar support
   Used by TextSection and StickySection
   ════════════════════════════════════════════════════════════ */
function RichText({ value, onChange, className, placeholder, isEditMode = true }) {
  const ref = useRef(null);
  const isFocused = useRef(false);
  const [slashMenu, setSlashMenu] = useState(null); // { x, y }

  /* Sync incoming value only when NOT focused (avoids cursor jump) */
  useEffect(() => {
    if (!isFocused.current && ref.current) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  /* Intercept checkbox clicks inside the RichText content */
  function handleClick(e) {
    if (e.target.tagName === "INPUT" && e.target.type === "checkbox") {
      // Prevent focus or editing behavior
      e.preventDefault();
      e.stopPropagation();
      // Toggle checked attribute explicitly
      if (e.target.hasAttribute("checked")) {
        e.target.removeAttribute("checked");
      } else {
        e.target.setAttribute("checked", "checked");
      }
      // Fire onChange to save
      if (ref.current) onChange(ref.current.innerHTML);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "/") {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSlashMenu({ x: rect.left, y: rect.bottom + window.scrollY });
    } else if (e.key === "Escape" || e.key === "Backspace") {
      setSlashMenu(null);
    }
  }

  function handleFocus() { isFocused.current = true; }
  function handleBlur()  {
    isFocused.current = false;
    onChange(ref.current.innerHTML);
    // Delay hiding menu to allow clicks
    setTimeout(() => setSlashMenu(null), 200);
  }

  const insertCommand = (cmd) => {
    setSlashMenu(null);
    ref.current.focus();
    // Remove the "/"
    document.execCommand("delete", false, null);
    
    if (cmd === "table") {
      document.execCommand("insertHTML", false, `<table style="border-collapse:collapse;width:100%;margin:8px 0"><thead><tr><th style="border:1px solid #e2e8f0;padding:8px 12px;background:#f8fafc;font-weight:700">Header</th><th style="border:1px solid #e2e8f0;padding:8px 12px;background:#f8fafc;font-weight:700">Header</th></tr></thead><tbody><tr><td style="border:1px solid #e2e8f0;padding:8px 12px" contenteditable>Cell</td><td style="border:1px solid #e2e8f0;padding:8px 12px" contenteditable>Cell</td></tr></tbody></table><p><br></p>`);
    } else if (cmd === "h1") {
      document.execCommand("formatBlock", false, "h1");
    } else if (cmd === "h2") {
      document.execCommand("formatBlock", false, "h2");
    } else if (cmd === "quote") {
      document.execCommand("formatBlock", false, "blockquote");
    } else if (cmd === "list") {
      document.execCommand("insertUnorderedList", false, null);
    } else if (cmd === "checklist") {
      document.execCommand("insertHTML", false, `<ul style="list-style:none;padding-left:0"><li style="display:flex;align-items:center;gap:8px"><input type="checkbox" /> <span>Task item</span></li></ul>`);
    }
  };

  return (
    <div className="relative w-full">
      <div
        ref={ref}
        contentEditable={isEditMode}
        suppressContentEditableWarning
        data-placeholder={placeholder || "Start writing…"}
        onFocus={isEditMode ? handleFocus : undefined}
        onBlur={isEditMode ? handleBlur : undefined}
        onKeyDown={isEditMode ? handleKeyDown : undefined}
        onClick={handleClick}
        className={cn(
          "rich-text-editable w-full min-h-[1.5em] rounded-md border border-transparent bg-transparent outline-none transition",
          "focus:border-primary/20 focus:bg-background/60 focus:px-2 focus:py-1",
          "[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-400 [&:empty]:before:pointer-events-none",
          className
        )}
      />
      
      {slashMenu && isEditMode && (
        <div 
          className="fixed z-[100] w-48 rounded-xl border border-border bg-white shadow-2xl p-1.5 flex flex-col gap-0.5"
          style={{ left: slashMenu.x, top: slashMenu.y + 5 }}
        >
          <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Commands</p>
          <button onClick={() => insertCommand("h1")} className="slash-item"><Heading1 className="size-4" /> Heading 1</button>
          <button onClick={() => insertCommand("h2")} className="slash-item"><Heading2 className="size-4" /> Heading 2</button>
          <button onClick={() => insertCommand("list")} className="slash-item"><List className="size-4" /> Bullet List</button>
          <button onClick={() => insertCommand("checklist")} className="slash-item"><CheckSquare className="size-4" /> Checklist</button>
          <button onClick={() => insertCommand("table")} className="slash-item"><Table2 className="size-4" /> Table</button>
          <button onClick={() => insertCommand("quote")} className="slash-item"><Quote className="size-4" /> Quote</button>
        </div>
      )}
    </div>
  );
}

/* ─── Plain text input (for non-rich fields) ─── */
function EditableText({ value, onChange, className, placeholder, isEditMode = true }) {
  if (!isEditMode) {
    return <span className={cn("inline-block py-1", className)}>{value || placeholder}</span>;
  }
  return (
    <input
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full resize-none rounded-md border border-transparent bg-transparent outline-none transition focus:border-primary/25 focus:bg-background focus:px-2 focus:py-1",
        className
      )}
    />
  );
}

/* ─── Section frame (header + controls) ─── */
function SectionFrame({ section, onRemove, onMove, onUpdate, isEditMode = true, children }) {
  return (
    <motion.section
      layout
      initial={section.custom ? { opacity: 0, y: 16 } : false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn("group relative rounded-xl transition", isEditMode && "hover:bg-muted/20")}
    >
      {isEditMode ? (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-dashed border-transparent bg-transparent px-2 py-2 transition group-hover:border-border group-hover:bg-muted/40">
          <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-muted-foreground">
            <GripVertical className="size-4 shrink-0" />
            <EditableText
              value={section.label}
              onChange={(label) => onUpdate(section.id, { label })}
              className="font-semibold"
              isEditMode={isEditMode}
            />
          </span>
          <div className="flex shrink-0 items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
            <button className="section-action" onClick={() => onMove(section.id, -1)} aria-label="Move section up"><ArrowUp className="size-4" /></button>
            <button className="section-action" onClick={() => onMove(section.id,  1)} aria-label="Move section down"><ArrowDown className="size-4" /></button>
            <button className="section-action danger" onClick={() => onRemove(section.id)} aria-label="Remove section"><Trash2 className="size-4" /></button>
          </div>
        </div>
      ) : (
        <div className="mb-1 px-2 py-1">
          <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{section.label}</span>
        </div>
      )}
      {children}
    </motion.section>
  );
}

/* ─── Individual section components ─── */

function TextSection({ section, onUpdate, isEditMode }) {
  return (
    <div className="px-2 pb-2">
      <RichText
        value={section.text}
        onChange={(text) => onUpdate(section.id, { text })}
        placeholder="Start typing your notes..."
        isEditMode={isEditMode}
      />
    </div>
  );
}

function BulletsSection({ section, onUpdate, isEditMode }) {
  const items = section.items || [];
  const handleUpdate = (idx, val) => {
    const next = [...items];
    next[idx] = val;
    onUpdate(section.id, { items: next });
  };
  const add = () => onUpdate(section.id, { items: [...items, ""] });
  const remove = (idx) => onUpdate(section.id, { items: items.filter((_, i) => i !== idx) });

  return (
    <div className="flex flex-col gap-1.5 px-2 pb-2">
      {items.map((it, idx) => (
        <div key={idx} className="flex items-start gap-2">
          <span className="mt-2.5 size-1 rounded-full bg-violet-400 shrink-0" />
          <EditableText
            value={it}
            onChange={(v) => handleUpdate(idx, v)}
            placeholder="List item..."
            className="flex-1"
            isEditMode={isEditMode}
          />
          {isEditMode && <button onClick={() => remove(idx)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="size-3" /></button>}
        </div>
      ))}
      {isEditMode && <button onClick={add} className="flex items-center gap-1.5 text-xs font-bold text-violet-500 hover:text-violet-600 mt-1"><Plus className="size-3" /> Add item</button>}
    </div>
  );
}

function ChecklistSection({ section, onUpdate, isEditMode }) {
  const items = section.items || [];
  const handleUpdate = (idx, patch) => {
    const next = [...items];
    next[idx] = { ...next[idx], ...patch };
    onUpdate(section.id, { items: next });
  };
  const add = () => onUpdate(section.id, { items: [...items, { text: "", done: false }] });
  const remove = (idx) => onUpdate(section.id, { items: items.filter((_, i) => i !== idx) });

  return (
    <div className="flex flex-col gap-1 px-2 pb-2">
      {items.map((it, idx) => (
        <div key={idx} className="flex items-start gap-2.5 py-0.5">
          <input
            type="checkbox"
            checked={it.done}
            onChange={(e) => handleUpdate(idx, { done: e.target.checked })}
            className="mt-1 size-4 rounded-md border-gray-300 text-violet-600 focus:ring-violet-500 disabled:opacity-50"
            disabled={!isEditMode}
          />
          <EditableText
            value={it.text}
            onChange={(v) => handleUpdate(idx, { text: v })}
            placeholder="Task..."
            className={cn("flex-1", it.done && "text-gray-400 line-through")}
            isEditMode={isEditMode}
          />
          {isEditMode && <button onClick={() => remove(idx)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="size-3" /></button>}
        </div>
      ))}
      {isEditMode && <button onClick={add} className="flex items-center gap-1.5 text-xs font-bold text-violet-500 hover:text-violet-600 mt-1"><Plus className="size-3" /> Add task</button>}
    </div>
  );
}

function CodeSection({ section, onUpdate, isEditMode }) {
  const taRef = useRef(null);
  const preRef = useRef(null);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const highlightedCode = useMemo(() => {
    const lang = LANG_MAP[section.language] || "javascript";
    const grammar = Prism.languages[lang] || Prism.languages.javascript;
    return Prism.highlight(section.code || "", grammar, lang);
  }, [section.code, section.language]);

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.target;
      const { selectionStart, selectionEnd, value } = ta;
      const next = value.slice(0, selectionStart) + "  " + value.slice(selectionEnd);
      onUpdate(section.id, { code: next });
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = selectionStart + 2;
      });
    }
  };

  const handleTextareaInput = (e) => {
    onUpdate(section.id, { code: e.target.value });
  };

  const handleScroll = (e) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.target.scrollTop;
      preRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  useEffect(() => {
    if (taRef.current) {
      const el = taRef.current;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
      if (preRef.current) {
        preRef.current.style.height = el.style.height;
      }
    }
  }, [section.code, isEditMode]);

  return (
    <div className="px-2 pb-6">
      <div className="relative group rounded-2xl border-2 border-gray-100 bg-[#0f111a] shadow-2xl shadow-indigo-500/10">
        <div className="sticky top-[76px] z-20 flex items-center justify-between gap-4 rounded-t-2xl bg-[#161b22]/95 px-6 py-3 border-b border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative" ref={langRef}>
              <button
                onClick={() => isEditMode && setLangOpen(!langOpen)}
                className={cn(
                  "flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-blue-100 outline-none transition",
                  isEditMode ? "hover:bg-white/20 cursor-pointer" : "cursor-default"
                )}
              >
                {section.language || "JS"}
                {isEditMode && <ChevronDown className={cn("size-3 text-blue-300 transition-transform", langOpen && "rotate-180")} />}
              </button>

              <AnimatePresence>
                {langOpen && isEditMode && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-10 z-[100] w-32 overflow-hidden rounded-xl border border-white/10 bg-[#1e2230] p-1 shadow-2xl backdrop-blur-xl"
                  >
                    {Object.keys(LANG_MAP).filter(k => k === k.toUpperCase()).map(lang => (
                      <button
                        key={lang}
                        onClick={() => {
                          onUpdate(section.id, { language: lang });
                          setLangOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition",
                          section.language === lang
                            ? "bg-violet-600 text-white"
                            : "text-blue-200 hover:bg-white/10"
                        )}
                      >
                        {lang}
                        {section.language === lang && <Check className="size-3" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <EditableText
              value={section.filename}
              onChange={(filename) => onUpdate(section.id, { filename })}
              placeholder="filename.js"
              className="text-[10px] font-black uppercase tracking-widest text-blue-300/40"
              isEditMode={isEditMode}
            />
          </div>
          
          <button
            onClick={() => {
              navigator.clipboard.writeText(section.code || "");
            }}
            className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 transition hover:bg-white/10 hover:text-white active:scale-95"
            aria-label="Copy code"
          >
            <Copy className="size-3" /> Copy
          </button>
        </div>

        <div className="relative w-full overflow-hidden rounded-b-2xl" style={{ lineHeight: '1.8' }}>
          <pre
            ref={preRef}
            className={cn(
              "code-highlight m-0 w-full p-6 font-mono text-sm",
              isEditMode ? "pointer-events-none overflow-hidden" : "overflow-auto"
            )}
            style={{ lineHeight: '1.8' }}
            dangerouslySetInnerHTML={{ __html: highlightedCode + "\n" }}
          />
          {isEditMode && (
            <textarea
              ref={taRef}
              value={section.code || ""}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              placeholder="// Type or paste your code here..."
              className="absolute inset-0 z-10 block w-full resize-none overflow-hidden border-none bg-transparent p-6 font-mono text-sm text-transparent caret-blue-400 outline-none"
              style={{ lineHeight: '1.8' }}
              spellCheck="false"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function StickySection({ section, onUpdate, isEditMode }) {
  const variant = section.variant || "amber";
  const variants = Object.keys(stickyStyles);

  return (
    <div className="px-2 pb-2">
      <div className={cn("rounded-2xl border p-5 shadow-sm transition-colors duration-300", stickyStyles[variant])}>
        <div className="mb-4 flex items-center justify-between">
          <Lightbulb className="size-5 opacity-50" />
          {isEditMode && (
            <div className="flex gap-1.5">
              {variants.map(v => (
                <button
                  key={v}
                  onClick={() => onUpdate(section.id, { variant: v })}
                  className={cn("size-4 rounded-full border border-black/5 ring-offset-2 transition-all", 
                    v === "amber" ? "bg-amber-300" : v === "violet" ? "bg-violet-300" : v === "green" ? "bg-emerald-300" : "bg-pink-300",
                    variant === v && "ring-2 ring-black/20 scale-125"
                  )}
                />
              ))}
            </div>
          )}
        </div>
        <RichText
          value={section.text}
          onChange={(text) => onUpdate(section.id, { text })}
          placeholder="Important note here..."
          isEditMode={isEditMode}
          className={cn("placeholder:text-black/30", 
            variant === "amber" ? "text-amber-950" : 
            variant === "violet" ? "text-violet-950" : 
            variant === "green" ? "text-emerald-950" : "text-pink-950"
          )}
        />
      </div>
    </div>
  );
}

function TableSection({ section, onUpdate, isEditMode }) {
  const headers = section.headers || ["Header 1", "Header 2"];
  const rows = section.rows || [["", ""]];

  const updateHeader = (idx, val) => {
    const next = [...headers];
    next[idx] = val;
    onUpdate(section.id, { headers: next });
  };

  const updateCell = (rIdx, cIdx, val) => {
    const next = rows.map((r, i) => i === rIdx ? r.map((c, j) => j === cIdx ? val : c) : r);
    onUpdate(section.id, { rows: next });
  };

  const addRow = () => onUpdate(section.id, { rows: [...rows, Array(headers.length).fill("")] });
  const addCol = () => {
    onUpdate(section.id, {
      headers: [...headers, `Header ${headers.length + 1}`],
      rows: rows.map(r => [...r, ""])
    });
  };

  return (
    <div className="px-2 pb-2">
      <div className="overflow-x-auto rounded-xl border border-border bg-background shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-muted/30">
              {headers.map((h, i) => (
                <th key={i} className="border-b border-border p-3 font-bold text-muted-foreground">
                  <EditableText value={h} onChange={(v) => updateHeader(i, v)} isEditMode={isEditMode} />
                </th>
              ))}
              {isEditMode && <th className="border-b border-border p-3 w-10"><button onClick={addCol} className="grid size-6 place-items-center rounded bg-muted hover:bg-border transition"><Plus className="size-3" /></button></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="group/row">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="border-b border-border p-3">
                    <EditableText value={cell} onChange={(v) => updateCell(rIdx, cIdx, v)} isEditMode={isEditMode} />
                  </td>
                ))}
                {isEditMode && <td className="border-b border-border p-3"></td>}
              </tr>
            ))}
          </tbody>
        </table>
        {isEditMode && (
          <button onClick={addRow} className="flex w-full items-center justify-center gap-2 p-3 text-xs font-bold text-muted-foreground hover:bg-muted/20 transition border-t border-border">
            <Plus className="size-3" /> Add row
          </button>
        )}
      </div>
    </div>
  );
}

const sectionMap = {
  text:      TextSection,
  bullets:   BulletsSection,
  checklist: ChecklistSection,
  code:      CodeSection,
  sticky:    StickySection,
  table:     TableSection
};

/* ════════════════════════════════════════════════════════════
   SectionsRenderer — lists and renders each section
   ════════════════════════════════════════════════════════════ */
export function SectionsRenderer({ sections, onRemove, onMove, onUpdate, isEditMode = true }) {
  return (
    <AnimatePresence initial={false}>
      {sections.map((section) => (
        <SectionFrame
          key={section.id}
          section={section}
          onRemove={onRemove}
          onMove={onMove}
          onUpdate={onUpdate}
          isEditMode={isEditMode}
        >
          {sectionMap[section.type] ? (
            React.createElement(sectionMap[section.type], { section, onUpdate, isEditMode })
          ) : (
            <div className="p-4 text-xs text-red-500">Unknown section type: {section.type}</div>
          )}
        </SectionFrame>
      ))}
    </AnimatePresence>
  );
}

export function JournalSectionRenderer(props) { return <SectionsRenderer {...props} />; }
export function CodeSectionRenderer(props)    { return <SectionsRenderer {...props} />; }
