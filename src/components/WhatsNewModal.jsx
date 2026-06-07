import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Zap, Cloud, Smartphone, Code, Palette, CheckCircle, Rocket,
  ArrowRight, ExternalLink
} from "lucide-react";
import { cn } from "../lib/utils";

export function WhatsNewModal({ isOpen, onClose }) {
  const [currentTab, setCurrentTab] = useState("features");

  const features = [
    {
      icon: Cloud,
      title: "Cross-Device Sync",
      description: "Real-time synchronization across all your devices. Changes appear instantly on web, mobile, and desktop.",
      badge: "NEW",
      badgeColor: "bg-blue-100 text-blue-700"
    },
    {
      icon: Code,
      title: "Enhanced Code Editor",
      description: "Ultra-vibrant syntax highlighting with support for 6+ languages. Sticky headers and dynamic height adjustment.",
      badge: "IMPROVED",
      badgeColor: "bg-purple-100 text-purple-700"
    },
    {
      icon: Smartphone,
      title: "Offline Support",
      description: "Work offline with automatic sync when you're back online. Never lose your changes.",
      badge: "NEW",
      badgeColor: "bg-green-100 text-green-700"
    },
    {
      icon: Zap,
      title: "Bundle Optimization",
      description: "69% faster load times with intelligent code splitting. Main bundle reduced from 805KB to 251KB.",
      badge: "OPTIMIZATION",
      badgeColor: "bg-amber-100 text-amber-700"
    },
    {
      icon: Rocket,
      title: "Vercel Deployment",
      description: "Production-ready deployment configuration. SPA routing fixed for seamless page reloads.",
      badge: "FIXED",
      badgeColor: "bg-red-100 text-red-700"
    },
    {
      icon: Palette,
      title: "Sync Status Indicator",
      description: "Visual feedback showing real-time sync progress. Know exactly when your data is saved.",
      badge: "NEW",
      badgeColor: "bg-pink-100 text-pink-700"
    }
  ];

  const fixes = [
    { issue: "Prism ReferenceError", solution: "Fixed async initialization race condition" },
    { issue: "Vercel 404 on Page Reload", solution: "Added SPA routing rewrites in vercel.json" },
    { issue: "Bundle Size", solution: "Implemented code splitting strategy" },
    { issue: "Hook Initialization Order", solution: "Reordered useCallback and useEffect hooks" }
  ];

  const improvements = [
    { area: "Performance", detail: "Load time improved by 65% (gzip)" },
    { area: "Developer Experience", detail: "Added comprehensive inline documentation" },
    { area: "Build Configuration", detail: "Vite optimizations and chunk management" },
    { area: "Documentation", detail: "Complete README with deployment guide" },
    { area: "Offline Handling", detail: "Automatic retry queue system" },
    { area: "Real-time Updates", detail: "Optimized payload-based subscriptions" }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-gradient-to-r from-violet-50 to-blue-50 px-8 py-6">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-1 hover:bg-gray-200 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-2">
                <span className="inline-block px-3 py-1 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full">
                  NEW UPDATE
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                What's New in Notebook 📔
              </h1>
              <p className="mt-2 text-gray-600">We've been working hard to make your note-taking experience even better.</p>
              <div className="mt-4 flex items-center gap-6 text-sm">
                <span className="font-semibold text-gray-700">Version 0.8.0</span>
                <span className="text-gray-500">Released: June 7, 2026</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="sticky top-20 z-9 border-b border-gray-200 bg-white px-8">
              <div className="flex gap-8">
                {[
                  { id: "features", label: "✨ Features", icon: Zap },
                  { id: "fixes", label: "🐛 Fixes", icon: CheckCircle },
                  { id: "improvements", label: "📈 Improvements", icon: Rocket }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id)}
                    className={cn(
                      "py-4 px-1 border-b-2 font-medium text-sm transition",
                      currentTab === tab.id
                        ? "border-violet-600 text-violet-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto px-8 py-6" style={{ maxHeight: "calc(85vh - 200px)" }}>
              {/* Features Tab */}
              {currentTab === "features" && (
                <div className="space-y-4">
                  {features.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex gap-4 p-4 rounded-lg border border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition group cursor-pointer"
                      >
                        <div className="flex-shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-blue-100">
                            <Icon className="h-5 w-5 text-violet-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                            <span className={cn("text-xs font-bold px-2 py-0.5 rounded", feature.badgeColor)}>
                              {feature.badge}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{feature.description}</p>
                        </div>
                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                          <ArrowRight className="h-4 w-4 text-violet-600" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Fixes Tab */}
              {currentTab === "fixes" && (
                <div className="space-y-3">
                  {fixes.map((fix, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex gap-3 p-3 rounded-lg bg-green-50 border border-green-200"
                    >
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">{fix.issue}</p>
                        <p className="text-sm text-green-700">{fix.solution}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Improvements Tab */}
              {currentTab === "improvements" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {improvements.map((imp, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200"
                    >
                      <p className="font-semibold text-blue-900">{imp.area}</p>
                      <p className="mt-1 text-sm text-blue-700">{imp.detail}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/Couser08/create-full-premium-notebook-journal-app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on GitHub
                </a>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">Thanks for being part of our journey!</span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition"
              >
                Explore App
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default WhatsNewModal;
