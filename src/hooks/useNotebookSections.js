import { useEffect, useMemo, useState, useRef } from "react";

function createSection(type, overrides = {}) {
  const base = {
    id: `${type}-${Date.now()}-${Math.round(Math.random() * 10000)}`,
    type,
    label: "New Section",
    custom: true
  };

  const byType = {
    text: {
      label: "New Text Section",
      text: "Start writing a new thought, plan, or reflection here."
    },
    sticky: {
      label: "New Sticky Note",
      variant: "amber",
      text: "Important note here..."
    },
    drawing: {
      label: "Drawing Area",
      color: "#7c5cff",
      strokes: []
    },
    code: {
      label: "New Code Snippet",
      language: "JS",
      filename: "snippet.js",
      code: `/**
 * JavaScript Utility
 */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}`
    },
    checklist: {
      label: "New Checklist",
      items: [
        { text: "First task", done: true },
        { text: "Second task", done: false },
        { text: "Third task", done: false }
      ]
    },
    table: {
      label: "New Table",
      headers: ["Name", "Notes", "Status"],
      rows: [
        ["Research", "Collect references", "Done"],
        ["Draft", "Prepare first version", "In Progress"]
      ]
    },
    callout: {
      label: "Objective",
      text: "Deliver a modern, fast, and user-friendly website that increases engagement and conversions."
    },
    bullets: {
      label: "Goals",
      items: ["Add a goal", "Track progress", "Review weekly"]
    },
    info: {
      label: "Info",
      text: "Add a concise technical explanation here."
    },
    "split-code": {
      label: "Example",
      html: "<input type=\"text\" id=\"search\" placeholder=\"Type to search...\" />\n<p id=\"output\"></p>",
      js: "input.addEventListener('input', debounce(() => {\n  output.textContent = 'Searching for: ' + input.value;\n}, 500));",
      output: "Searching for: notebook"
    }
  };

  return { ...base, ...(byType[type] || byType.text), ...overrides };
}

function createPage(title, sections = []) {
  return {
    id: `page-${Date.now()}-${Math.round(Math.random() * 10000)}`,
    title: title || "New Page",
    sections
  };
}

function hydrateDefaults(defaults) {
  return defaults.map((section) => createSection(section.type, { ...section, custom: false }));
}

/**
 * useNotebookSections
 * @param {object} options
 * @param {string} options.storageKey - Optional fallback for LocalStorage
 * @param {object} options.initialData - The full content object { activePageId, pages }
 * @param {array} options.defaults - Default sections if no data exists
 * @param {function} options.onSync - Callback to save data back to master state
 */
export function useNotebookSections({ storageKey, initialData, defaults, onSync }) {
  const initialSections = useMemo(() => hydrateDefaults(defaults || []), [defaults]);
  
  const [data, setData] = useState(() => {
    // 1. Use initialData if provided (from AppContext)
    if (initialData && initialData.pages) return initialData;

    // 2. Fallback to LocalStorage if storageKey is provided
    if (storageKey) {
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const firstPage = createPage("Page 1", parsed);
            return { activePageId: firstPage.id, pages: [firstPage] };
          }
          if (parsed && parsed.pages) return parsed;
        }
      } catch (e) {
        console.warn("Failed to parse notebook sections from localStorage", e);
      }
    }

    // 3. Default state
    const firstPage = createPage("Page 1", initialSections);
    return { activePageId: firstPage.id, pages: [firstPage] };
  });

  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    
    // Sync to LocalStorage fallback
    if (storageKey) {
      window.localStorage.setItem(storageKey, JSON.stringify(data));
    }
    
    // Sync to Master State (Supabase/AppContext)
    if (onSync) {
      onSync(data);
    }
  }, [data, storageKey, onSync]);

  const activePage = data.pages.find(p => p.id === data.activePageId) || data.pages[0];
  const sections = activePage?.sections || [];

  function addSection(type) {
    setData((current) => ({
      ...current,
      pages: current.pages.map(p => 
        p.id === current.activePageId 
          ? { ...p, sections: [...p.sections, createSection(type)] }
          : p
      )
    }));
  }

  function removeSection(id) {
    setData((current) => ({
      ...current,
      pages: current.pages.map(p => 
        p.id === current.activePageId 
          ? { ...p, sections: p.sections.filter(s => s.id !== id) }
          : p
      )
    }));
  }

  function updateSection(id, patch) {
    setData((current) => ({
      ...current,
      pages: current.pages.map(p => 
        p.id === current.activePageId 
          ? { ...p, sections: p.sections.map(s => s.id === id ? { ...s, ...patch } : s) }
          : p
      )
    }));
  }

  function moveSection(id, direction) {
    setData((current) => {
      const page = current.pages.find(p => p.id === current.activePageId);
      if (!page) return current;
      const index = page.sections.findIndex((section) => section.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= page.sections.length) return current;
      const copy = [...page.sections];
      const [item] = copy.splice(index, 1);
      copy.splice(nextIndex, 0, item);
      
      return {
        ...current,
        pages: current.pages.map(p => p.id === current.activePageId ? { ...p, sections: copy } : p)
      };
    });
  }

  function resetSections() {
    setData((current) => ({
      ...current,
      pages: current.pages.map(p => 
        p.id === current.activePageId ? { ...p, sections: initialSections } : p
      )
    }));
  }

  function addPage(title) {
    const newPage = createPage(title || `Page ${data.pages.length + 1}`, initialSections);
    setData(current => ({
      ...current,
      pages: [...current.pages, newPage],
      activePageId: newPage.id
    }));
  }

  function removePage(pageId) {
    if (data.pages.length <= 1) return;
    setData(current => {
      const nextPages = current.pages.filter(p => p.id !== pageId);
      return {
        ...current,
        pages: nextPages,
        activePageId: current.activePageId === pageId ? nextPages[0].id : current.activePageId
      };
    });
  }

  function renamePage(pageId, newTitle) {
    setData(current => ({
      ...current,
      pages: current.pages.map(p => p.id === pageId ? { ...p, title: newTitle } : p)
    }));
  }

  function switchPage(pageId) {
    setData(current => ({ ...current, activePageId: pageId }));
  }

  return { 
    sections, 
    addSection, 
    removeSection, 
    updateSection, 
    moveSection, 
    resetSections,
    pages: data.pages,
    activePageId: data.activePageId,
    addPage,
    removePage,
    renamePage,
    switchPage
  };
}
