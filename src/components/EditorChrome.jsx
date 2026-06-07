import { motion } from "framer-motion";
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight,
  Bold, CheckSquare, ChevronLeft, ChevronRight,
  Code2, Image, Italic, Link, List, ListOrdered,
  MoreHorizontal, Redo2, Share2, Star, Strikethrough,
  Table2, Trash2, Underline, Undo2, Type, Highlighter,
  Subscript, Superscript, Minus, Plus, Eye, EyeOff,
  Maximize2, X
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";
import { cn } from "../lib/utils";
import { Badge, IconButton, Button } from "./ui";

export function EditorTopbar({ crumbs, mode = "journal", noteId, onDelete, isEditMode, setIsEditMode }) {
  const { favorites, toggleFavorite, focusMode, setFocusMode } = useAppContext();
  const isFavorite = favorites.includes(noteId);
  const [shared, setShared] = useState(false);

  return (
    <header className={cn(
      "sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-border bg-background/95 px-8 backdrop-blur transition-all duration-500",
      focusMode ? "opacity-0 hover:opacity-100 py-2 h-14" : "max-md:px-5 max-md:pl-16"
    )}>
      <div className="flex min-w-0 items-center gap-3 text-sm font-medium text-muted-foreground">
        <RouterLink to="/" className="rounded-full p-1 transition hover:bg-muted hover:text-primary" aria-label="Back home">
          <ChevronLeft className="size-5" />
        </RouterLink>
        {crumbs.map((crumb, index) => (
          <span key={crumb} className="flex min-w-0 items-center gap-2">
            {index > 0 ? <ChevronRight className="size-4 text-muted-foreground/60" /> : null}
            <span className={cn("truncate", index === crumbs.length - 1 && "text-foreground")}>{crumb}</span>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-xs font-medium text-muted-foreground sm:inline">Saved just now</span>
        
        <IconButton 
          className={cn(focusMode && "bg-lavender text-primary")} 
          aria-label="Focus mode" 
          onClick={() => setFocusMode(!focusMode)}
        >
          {focusMode ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </IconButton>

        {setIsEditMode && (
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 rounded-full border px-3", isEditMode ? "border-violet-200 bg-violet-50 text-violet-700" : "border-gray-200 text-gray-500")}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? "Editing" : "Viewing"}
          </Button>
        )}
        {mode === "code" ? <IconButton className="bg-lavender text-primary" aria-label="Code mode"><Code2 className="size-4" /></IconButton> : null}
        <IconButton className={shared ? "bg-lavender text-primary" : ""} aria-label="Share" onClick={() => setShared(v => !v)}><Share2 className="size-4" /></IconButton>
        <IconButton className={isFavorite ? "bg-amber-50 text-amber-500" : ""} aria-label="Favorite" onClick={() => toggleFavorite(noteId)}><Star className="size-4" /></IconButton>
        <IconButton className="text-red-500 hover:bg-red-50" aria-label="Delete" onClick={onDelete}><Trash2 className="size-4" /></IconButton>
        <IconButton aria-label="More"><MoreHorizontal className="size-5" /></IconButton>
      </div>
    </header>
  );
}

/* ─── execCommand map ─── */
const EXEC = {
  bold:        { cmd: "bold" },
  italic:      { cmd: "italic" },
  underline:   { cmd: "underline" },
  strike:      { cmd: "strikeThrough" },
  undo:        { cmd: "undo" },
  redo:        { cmd: "redo" },
  alignLeft:   { cmd: "justifyLeft" },
  alignCenter: { cmd: "justifyCenter" },
  alignRight:  { cmd: "justifyRight" },
  justify:     { cmd: "justifyFull" },
  list:        { cmd: "insertUnorderedList" },
  ordered:     { cmd: "insertOrderedList" },
  hr:          { cmd: "insertHorizontalRule" },
  superscript: { cmd: "superscript" },
  subscript:   { cmd: "subscript" }
};

/* queryable states */
const QUERYABLE = ["bold", "italic", "underline", "strike", "alignLeft", "alignCenter", "alignRight", "justify"];
const QUERY_CMD = {
  bold: "bold", italic: "italic", underline: "underline", strike: "strikeThrough",
  alignLeft: "justifyLeft", alignCenter: "justifyCenter", alignRight: "justifyRight", justify: "justifyFull",
};

export function FormattingToolbar({ mode = "journal" }) {
  const { focusMode, setFocusMode } = useAppContext();
  const [style, setStyle]           = useState(mode === "code" ? "Normal" : "Paragraph");
  const [activeStates, setActiveStates] = useState({});
  const [moreOpen, setMoreOpen]     = useState(false);
  const moreRef = useRef(null);

  const updateActiveStates = useCallback(() => {
    const states = {};
    QUERYABLE.forEach(id => {
      try { states[id] = document.queryCommandState(QUERY_CMD[id]); } catch { states[id] = false; }
    });
    setActiveStates(states);
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", updateActiveStates);
    return () => document.removeEventListener("selectionchange", updateActiveStates);
  }, [updateActiveStates]);

  /* close more-dropdown on outside click */
  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e) => { if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [moreOpen]);

  function runCommand(id) {
    const activeEl = document.activeElement;
    if (activeEl && activeEl.tagName === "TEXTAREA") {
      const start = activeEl.selectionStart;
      const end = activeEl.selectionEnd;
      const val = activeEl.value;
      const selected = val.substring(start, end);
      
      let wrapper = "";
      if (id === "bold") wrapper = "**";
      else if (id === "italic") wrapper = "*";
      else if (id === "highlight") wrapper = "==";
      else if (id === "strike") wrapper = "~~";
      else if (id === "code") wrapper = "`";
      
      if (wrapper) {
        // Toggle logic: unwrap if already wrapped
        if (
          start >= wrapper.length && end <= val.length - wrapper.length &&
          val.substring(start - wrapper.length, start) === wrapper &&
          val.substring(end, end + wrapper.length) === wrapper
        ) {
          activeEl.setSelectionRange(start - wrapper.length, end + wrapper.length);
          document.execCommand("insertText", false, selected);
          activeEl.setSelectionRange(start - wrapper.length, end - wrapper.length);
        } else {
          document.execCommand("insertText", false, wrapper + selected + wrapper);
          activeEl.setSelectionRange(start + wrapper.length, end + wrapper.length);
        }
        return;
      }
    }

    if (EXEC[id]) {
      document.execCommand(EXEC[id].cmd, false, null);
      updateActiveStates();
      return;
    }
    if (id === "color") {
      const color = window.prompt("Text color (hex or name):", "#7c5cff");
      if (color) { document.execCommand("foreColor", false, color); }
      return;
    }
    if (id === "highlight") {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      const node = sel.anchorNode;
      if (!node) return;
      
      const highlightSpan = node.nodeType === 3 ? node.parentElement.closest("span.bg-yellow-200") : node.closest?.("span.bg-yellow-200");
      if (highlightSpan) {
        const parent = highlightSpan.parentNode;
        while (highlightSpan.firstChild) {
          parent.insertBefore(highlightSpan.firstChild, highlightSpan);
        }
        parent.removeChild(highlightSpan);
      } else {
        const span = document.createElement("span");
        span.className = "bg-yellow-200 text-yellow-900 rounded px-1";
        try {
          range.surroundContents(span);
        } catch (e) {
          const content = range.extractContents();
          span.appendChild(content);
          range.insertNode(span);
        }
      }
      return;
    }
    if (id === "checklist") {
      document.execCommand("insertHTML", false,
        `<ul style="list-style:none;padding-left:0">` +
        `<li style="display:flex;align-items:center;gap:8px"><input type="checkbox" /> <span>Task item</span></li>` +
        `</ul>`
      );
      return;
    }
    if (id === "table") {
      document.execCommand("insertHTML", false,
        `<table style="border-collapse:collapse;width:100%;margin:8px 0">` +
        `<thead><tr>` +
        `<th style="border:1px solid #e2e8f0;padding:8px 12px;background:#f8fafc;font-weight:700">Header 1</th>` +
        `<th style="border:1px solid #e2e8f0;padding:8px 12px;background:#f8fafc;font-weight:700">Header 2</th>` +
        `<th style="border:1px solid #e2e8f0;padding:8px 12px;background:#f8fafc;font-weight:700">Header 3</th>` +
        `</tr></thead>` +
        `<tbody>` +
        `<tr><td style="border:1px solid #e2e8f0;padding:8px 12px" contenteditable>Cell</td><td style="border:1px solid #e2e8f0;padding:8px 12px" contenteditable>Cell</td><td style="border:1px solid #e2e8f0;padding:8px 12px" contenteditable>Cell</td></tr>` +
        `<tr><td style="border:1px solid #e2e8f0;padding:8px 12px" contenteditable>Cell</td><td style="border:1px solid #e2e8f0;padding:8px 12px" contenteditable>Cell</td><td style="border:1px solid #e2e8f0;padding:8px 12px" contenteditable>Cell</td></tr>` +
        `</tbody></table><p><br></p>`
      );
      return;
    }
    if (id === "image") {
      const url = window.prompt("Image URL:");
      if (url) document.execCommand("insertImage", false, url);
      return;
    }
    if (id === "link") {
      const url = window.prompt("URL:", "https://");
      if (url) document.execCommand("createLink", false, url);
      return;
    }
    if (id === "addRow") {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const node = sel.anchorNode;
      const tr = node?.nodeType === 3 ? node.parentElement.closest("tr") : node?.closest("tr");
      if (tr) {
        const newTr = tr.cloneNode(true);
        Array.from(newTr.cells).forEach(cell => cell.innerHTML = "");
        tr.after(newTr);
      }
      return;
    }
  }

  function handleStyleChange(value) {
    setStyle(value);
    const map = { "Heading 1": "h1", "Heading 2": "h2", "Heading 3": "h3", "Paragraph": "p", "Quote": "blockquote", "Code": "pre" };
    if (map[value]) document.execCommand("formatBlock", false, map[value]);
  }

  const btn = (id, Icon, label, active) => (
    <button
      key={id}
      title={label}
      aria-label={label}
      aria-pressed={!!active}
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition hover:bg-lavender hover:text-primary",
        active && "bg-lavender text-primary"
      )}
      onMouseDown={e => { e.preventDefault(); runCommand(id); }}
    >
      <Icon className="size-4" />
    </button>
  );

  const sep = () => <div key={Math.random()} className="h-7 w-px shrink-0 bg-border" />;

  const journalTools = [
    btn("undo", Undo2, "Undo"),
    btn("redo", Redo2, "Redo"),
    sep(),
    btn("bold",      Bold,          "Bold",          activeStates.bold),
    btn("italic",    Italic,        "Italic",         activeStates.italic),
    btn("underline", Underline,     "Underline",      activeStates.underline),
    btn("strike",    Strikethrough, "Strikethrough",  activeStates.strike),
    btn("highlight", Highlighter,   "Highlight"),
    sep(),
    btn("alignLeft",   AlignLeft,    "Align left",   activeStates.alignLeft),
    btn("alignCenter", AlignCenter,  "Center",       activeStates.alignCenter),
    btn("alignRight",  AlignRight,   "Align right",  activeStates.alignRight),
    btn("justify",     AlignJustify, "Justify",      activeStates.justify),
    sep(),
    btn("list",     List,          "Bullet list"),
    btn("ordered",  ListOrdered,   "Numbered list"),
    btn("checklist",CheckSquare,   "Checklist"),
    btn("table",    Table2,        "Insert table"),
    sep(),
    btn("link",  Link,  "Insert link"),
    btn("image", Image, "Insert image"),
  ];

  const codeTools = [
    btn("bold",    Bold,        "Bold",   activeStates.bold),
    btn("italic",  Italic,      "Italic", activeStates.italic),
    btn("highlight", Highlighter, "Highlight"),
    btn("code",    Code2,       "Code"),
    btn("link",    Link,        "Link"),
    btn("list",    List,        "Bullet list"),
    btn("ordered", ListOrdered, "Ordered list"),
    btn("checklist",CheckSquare,"Checklist"),
    btn("table",   Table2,      "Table"),
  ];

  const moreTools = [
    { id: "addRow",      Icon: Plus,        label: "Add Table Row" },
    { id: "superscript", Icon: Superscript, label: "Superscript" },
    { id: "subscript",   Icon: Subscript,   label: "Subscript" },
    { id: "hr",          Icon: Minus,       label: "Horizontal rule" },
  ];

  return (
    <div className={cn(
      "flex min-h-12 items-center gap-1 overflow-x-auto rounded-xl border border-border bg-background px-3 shadow-card transition-all duration-500",
      focusMode && "opacity-0 hover:opacity-100"
    )}>
      <select
        className="shrink-0 rounded-md bg-transparent px-2 py-1.5 text-sm font-medium text-muted-foreground outline-none transition hover:bg-muted"
        value={style}
        onChange={e => handleStyleChange(e.target.value)}
      >
        {(mode === "code"
          ? ["Normal", "Comment", "Code", "Output"]
          : ["Paragraph", "Heading 1", "Heading 2", "Heading 3", "Quote", "Code"]
        ).map(item => <option key={item}>{item}</option>)}
      </select>
      <div className="h-7 w-px shrink-0 bg-border" />

      {mode === "code" ? codeTools : journalTools}

      <div className="h-7 w-px shrink-0 bg-border mx-1" />
      <button
        title={focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition hover:bg-lavender hover:text-primary",
          focusMode && "bg-lavender text-primary"
        )}
        onMouseDown={e => { e.preventDefault(); setFocusMode(!focusMode); }}
      >
        {focusMode ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
      </button>

      {/* More button */}
      <div className="relative ml-auto" ref={moreRef}>
        <button
          className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition hover:bg-muted"
          aria-label="More tools"
          onMouseDown={e => { e.preventDefault(); setMoreOpen(v => !v); }}
        >
          <MoreHorizontal className="size-4" />
        </button>
        {moreOpen && (
          <div className="absolute right-0 top-10 z-50 w-44 rounded-xl border border-border bg-white shadow-xl p-1">
            {moreTools.map(({ id, Icon, label }) => (
              <button
                key={id}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition"
                onMouseDown={e => { e.preventDefault(); runCommand(id); setMoreOpen(false); }}
              >
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function TagRow({ tags, onRemove }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag, index) => (
        <button key={`${tag}-${index}`} onClick={() => onRemove?.(index)} title="Click to remove tag">
          <Badge className="transition hover:bg-red-50 hover:text-red-500">{tag}</Badge>
        </button>
      ))}
    </div>
  );
}

export function PageTabs({ pages, activePageId, onSwitch, onAdd, onRename, onRemove, isEditMode }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide">
      {pages.map((page) => (
        <button
          key={page.id}
          onClick={() => onSwitch(page.id)}
          className={cn(
            "group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300",
            page.id === activePageId
              ? "bg-violet-600 text-white shadow-xl shadow-violet-200 ring-2 ring-violet-600 ring-offset-2"
              : "bg-white text-gray-400 hover:bg-violet-50 hover:text-violet-600"
          )}
        >
          {isEditMode && page.id === activePageId ? (
            <input
              className="w-24 bg-transparent font-bold text-white outline-none placeholder:text-violet-300"
              value={page.title}
              onChange={(e) => onRename(page.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            />
          ) : (
            <span className="truncate max-w-[120px]">{page.title}</span>
          )}
          
          {isEditMode && pages.length > 1 && (
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full transition-all hover:bg-black/10",
                page.id === activePageId ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(page.id);
              }}
            >
              <X className="size-3" />
            </span>
          )}
        </button>
      ))}
      {isEditMode && (
        <button
          onClick={() => onAdd()}
          className="flex items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-400 transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600"
        >
          <Plus className="size-4" /> Add Page
        </button>
      )}
    </div>
  );
}
