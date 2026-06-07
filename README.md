# Premium Notebook & Journal App

A modern, high-performance, and visually stunning Notebook and Journaling application built with React, Tailwind CSS, and Framer Motion. This app features rich-text editing, multi-page notes, and ultra-vibrant code snippets.

![Notebook Preview](notebook-home.png)

## ✨ Features

- **🚀 Professional Code Editor**: 
  - Real-time syntax highlighting with an "Ultra Vibrant" palette.
  - Sticky code headers with language selectors and copy functionality.
  - Dynamic height adjustment as you type.
- **📖 Multi-Page Support**: Organize complex notes into multiple pages within a single entry.
- **🎨 Premium UI/UX**: 
  - Smooth transitions using Framer Motion.
  - Modern, clean aesthetic with customizable Sticky Notes.
  - Sidebar navigation and responsive layout.
- **✍️ Rich Journaling**: 
  - Support for headers, checklists, tables, and bullet points.
  - Content-editable sections for a seamless writing experience.
- **📂 Organization**: 
  - Tagging system for easy search and categorization.
  - Folder-based organization (Notebooks).
  - Favorites and Trash management.

## 🛠️ Tech Stack

- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Syntax Highlighting**: Prism.js
- **State Management**: React Context API
- **Persistence**: Supabase (PostgreSQL) & LocalStorage fallback

## 🗄️ Supabase Database Setup

To enable cloud storage, create the following tables in your Supabase project:

```sql
-- Notes Table
create table notes (
  id text primary key,
  user_id uuid references auth.users not null,
  title text not null,
  body text,
  date text,
  notebook text,
  tags jsonb default '[]'::jsonb,
  content jsonb,
  is_archived boolean default false,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Notebooks Table
create table notebooks (
  id text primary key,
  user_id uuid references auth.users not null,
  label text not null,
  count integer default 0,
  color text
);

-- Favorites Table
create table favorites (
  user_id uuid references auth.users not null,
  note_id text not null,
  primary key (user_id, note_id)
);

-- Enable RLS (Row Level Security)
alter table notes enable row level security;
alter table notebooks enable row level security;
alter table favorites enable row level security;

-- Create policies (simplified)
create policy "Users can manage their own notes" on notes for all using (auth.uid() = user_id);
create policy "Users can manage their own notebooks" on notebooks for all using (auth.uid() = user_id);
create policy "Users can manage their own favorites" on favorites for all using (auth.uid() = user_id);
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Couser08/create-full-premium-notebook-journal-app.git
   ```

2. Navigate to the project directory:
   ```bash
   cd create-full-premium-notebook-journal-app
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📦 Build for Production

To create a production-ready build:
```bash
npm run build
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by premium writing and productivity tools.
- Built with love using the modern React ecosystem.
