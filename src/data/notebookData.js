import {
  BookOpen,
  Briefcase,
  CheckSquare,
  Code2,
  FileText,
  Image,
  Lightbulb,
  Mic,
  NotebookTabs,
  Sprout
} from "lucide-react";

export const notebooks = [
  { id: "personal", label: "Personal", count: 24, color: "violet" },
  { id: "work", label: "Work", count: 18, color: "blue" },
  { id: "ideas", label: "Ideas", count: 12, color: "amber" },
  { id: "study", label: "Study", count: 9, color: "green" },
  { id: "journal", label: "Journal", count: 7, color: "pink" }
];

export const quickActions = [
  { label: "New Note", icon: FileText, color: "violet" },
  { label: "New Notebook", icon: NotebookTabs, color: "blue" },
  { label: "Add Image", icon: Image, color: "green" },
  { label: "Voice Note", icon: Mic, color: "orange" }
];

export const pinnedNotes = [
  {
    id: "project-plan",
    title: "Project Plan",
    body: "Outline of the new project, milestones and deliverables.",
    date: "May 20, 2024",
    notebook: "Work",
    route: "/journal/project-plan"
  },
  {
    id: "daily-journal",
    title: "Daily Journal",
    body: "Today was productive. Focused on planning and deep work.",
    date: "May 19, 2024",
    notebook: "Journal",
    route: "/journal/daily-journal"
  },
  {
    id: "ideas-list",
    title: "Ideas List",
    body: "Some ideas to explore further in the future.",
    date: "May 18, 2024",
    notebook: "Ideas",
    route: "/journal/ideas-list"
  }
];

export const recentNotes = [
  {
    id: "debounce",
    title: "Debounce Function",
    body: "JavaScript utility notes with implementation and examples...",
    date: "Today, 10:12 AM",
    notebook: "Work",
    icon: Code2,
    color: "blue",
    route: "/code/debounce"
  },
  {
    id: "meeting",
    title: "Meeting Notes",
    body: "Discussed project progress and next steps...",
    date: "Today, 9:41 AM",
    notebook: "Work",
    icon: Sprout,
    color: "slate",
    route: "/journal/meeting"
  },
  {
    id: "book",
    title: "Book Summary",
    body: "Key takeaways from Atomic Habits...",
    date: "Yesterday",
    notebook: "Study",
    icon: BookOpen,
    color: "pink",
    route: "/journal/book"
  },
  {
    id: "business",
    title: "Business Ideas",
    body: "Marketplace for digital products...",
    date: "May 20, 2024",
    notebook: "Ideas",
    icon: Lightbulb,
    color: "amber",
    route: "/journal/business"
  },
  {
    id: "travel",
    title: "Travel Plan",
    body: "Places to visit and things to do...",
    date: "May 17, 2024",
    notebook: "Personal",
    icon: Image,
    color: "violet",
    route: "/journal/travel"
  },
  {
    id: "grocery",
    title: "Grocery List",
    body: "Milk, Eggs, Bread, Avocado, Chicken...",
    date: "May 16, 2024",
    notebook: "Personal",
    icon: CheckSquare,
    color: "green",
    route: "/journal/grocery"
  }
];

export const journalSections = [
  { id: "overview", type: "text", label: "1. Overview" },
  { id: "objective", type: "callout", label: "Objective" },
  { id: "goals", type: "bullets", label: "2. Goals" },
  { id: "timeline", type: "table", label: "3. Timeline" },
  { id: "deliverables", type: "checklist", label: "4. Key Deliverables" },
  { id: "notes", type: "sticky", label: "5. Notes" }
];

export const codeSections = [
  {
    id: "implementation",
    type: "code",
    label: "Code Snippet",
    language: "JS",
    filename: "debounce.js",
    code: "/**\n * Debounce Utility\n * Delays function execution until after wait time has passed.\n */\nfunction debounce(fn, delay) {\n  let timer;\n  return function (...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), delay);\n  };\n}\n"
  }
];

export const sectionOptions = [
  { type: "text", label: "Text Section", icon: FileText },
  { type: "sticky", label: "Sticky Note", icon: Lightbulb },
  { type: "drawing", label: "Drawing Area", icon: Image },
  { type: "code", label: "Code Block", icon: Code2 },
  { type: "checklist", label: "Checklist", icon: CheckSquare },
  { type: "table", label: "Table", icon: Briefcase }
];
