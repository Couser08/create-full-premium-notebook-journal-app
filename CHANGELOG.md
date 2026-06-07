# Changelog

All notable changes to this project will be documented in this file.

## [0.8.0] - 2026-06-07

### ✨ New Features
- **Cross-Device Sync**: Real-time synchronization across all devices with Supabase real-time subscriptions
- **Offline Support**: Automatic queuing of changes when offline, with auto-sync when reconnected
- **Sync Status Indicator**: Visual badge showing sync progress (syncing, synced, offline, error)
- **Device Awareness**: Display number of synchronized devices in UI
- **Enhanced Real-Time Subscriptions**: Optimized payloads tracking INSERT, UPDATE, DELETE events

### 🐛 Bug Fixes
- Fixed Prism ReferenceError caused by async initialization race condition
- Fixed Vercel 404 errors on page reload by configuring SPA routing
- Fixed ReferenceError for syncToSupabase by reordering hook initialization
- Fixed hook initialization order to prevent temporal dead zone issues

### 📈 Improvements
- **Performance**: 69% bundle size reduction (805KB → 251KB main bundle)
- **Bundle Optimization**: Gzip size reduced 65% (228KB → 80.7KB)
- **Code Splitting**: Implemented intelligent vendor splitting across 5 chunks
- **Build Time**: Consistent 1.4-1.6s build times
- **Offline Handling**: Automatic retry queue system with 5-second intervals
- **Documentation**: Complete README with Vercel deployment guide

### 🔧 Build & Deployment
- Created `vercel.json` for SPA routing configuration
- Added `.vercelignore` for deployment optimization
- Configured smart cache headers (1-year for assets, no-cache for HTML)
- Production-ready Vite build configuration

### 📦 New Files
- `src/components/WhatsNewModal.jsx` - Changelog/update modal
- `src/components/SyncStatus.jsx` - Real-time sync indicator
- `vercel.json` - Vercel SPA routing configuration
- `.vercelignore` - Deployment exclusions
- `LICENSE` - MIT License

### 🎯 Technical Details
- **Real-time Channels**: User-scoped subscriptions prevent cross-user data leaks
- **Sync States**: syncing, synced, offline, error with visual feedback
- **Change Detection**: Prevents redundant syncs by tracking data changes
- **Memory Refs**: Prevents sync loops using ref tracking
- **Auto-Retry**: Failed syncs automatically retry every 5 seconds

## [0.7.0] - Previous Release
- Initial release with basic notebook and journal features

## Version History

### v0.8.0 (Current)
- Release Date: June 7, 2026
- Status: Production Ready ✅
- Features: 6 major features, 3 bug fixes, 6+ improvements
- Bundle: 251KB (80.7KB gzip)

---

### What's Next?
- TypeScript migration for type safety
- Enhanced collaboration features
- Advanced search capabilities
- Mobile app version
- Performance monitoring and analytics

---

For detailed information about each update, see the WhatsNewModal in the app or visit the [GitHub repository](https://github.com/Couser08/create-full-premium-notebook-journal-app).
