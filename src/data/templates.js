import { 
  FileText, 
  Users, 
  BookOpen, 
  Code2, 
  Calendar, 
  CheckSquare, 
  Briefcase,
  Lightbulb
} from "lucide-react";

export const templates = [
  {
    id: "meeting-notes",
    title: "Meeting Notes",
    desc: "Capture agenda, decisions, and action items from your team meetings.",
    icon: Users,
    color: "blue",
    sections: [
      { id: "agenda", type: "text", label: "Agenda", text: "1. \n2. \n3." },
      { id: "attendees", type: "text", label: "Attendees", text: "" },
      { id: "decisions", type: "callout", label: "Key Decisions", text: "Write the main outcomes here." },
      { id: "action-items", type: "checklist", label: "Action Items", items: [
        { text: "Follow up with...", done: false },
        { text: "Send recap email", done: false }
      ]}
    ]
  },
  {
    id: "study-notes",
    title: "Study Notes",
    desc: "Organize your learning with key concepts, summaries, and review questions.",
    icon: BookOpen,
    color: "green",
    sections: [
      { id: "summary", type: "text", label: "Summary", text: "Main takeaways from the lecture/book." },
      { id: "concepts", type: "bullets", label: "Key Concepts", items: ["Concept 1", "Concept 2"] },
      { id: "questions", type: "sticky", label: "Review Questions", variant: "amber", items: ["What is...?", "How does...?"] }
    ]
  },
  {
    id: "daily-journal",
    title: "Daily Journal",
    desc: "Reflect on your day, track your mood, and plan for tomorrow.",
    icon: Calendar,
    color: "pink",
    sections: [
      { id: "gratitude", type: "text", label: "What I'm grateful for", text: "1. \n2. \n3." },
      { id: "wins", type: "bullets", label: "Today's Wins", items: [""] },
      { id: "reflection", type: "text", label: "Reflection", text: "How did today go?" },
      { id: "tomorrow", type: "checklist", label: "Focus for Tomorrow", items: [] }
    ]
  },
  {
    id: "project-plan",
    title: "Project Plan",
    desc: "Break down your project into phases, tasks, and milestones.",
    icon: Briefcase,
    color: "violet",
    sections: [
      { id: "overview", type: "text", label: "Project Overview", text: "" },
      { id: "milestones", type: "table", label: "Milestones", headers: ["Phase", "Deadline", "Status"], rows: [
        ["Phase 1", "June 15", "Not Started"],
        ["Phase 2", "June 30", "Not Started"]
      ]},
      { id: "tasks", type: "checklist", label: "Task List", items: [] }
    ]
  },
  {
    id: "code-documentation",
    title: "Code Documentation",
    desc: "Document your code snippets with implementation details and examples.",
    icon: Code2,
    color: "indigo",
    sections: [
      { id: "purpose", type: "text", label: "Purpose", text: "What does this code do?" },
      { id: "snippet", type: "code", label: "Implementation", language: "JS", filename: "script.js", code: "// Your code here" },
      { id: "usage", type: "text", label: "Usage Examples", text: "How to use this snippet." }
    ]
  },
  {
    id: "grocery-list",
    title: "Grocery List",
    desc: "A simple, organized way to track what you need from the store.",
    icon: CheckSquare,
    color: "amber",
    sections: [
      { id: "produce", type: "checklist", label: "Produce", items: [] },
      { id: "dairy", type: "checklist", label: "Dairy & Eggs", items: [] },
      { id: "pantry", type: "checklist", label: "Pantry", items: [] }
    ]
  }
];
