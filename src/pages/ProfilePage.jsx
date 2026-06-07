import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  MapPin, 
  Globe, 
  Shield, 
  Bell, 
  LogOut, 
  Camera,
  ChevronRight,
  Sparkles,
  Settings as SettingsIcon,
  CreditCard,
  Smartphone,
  CheckCircle2,
  Trash2,
  Lock
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";
import { cn } from "../lib/utils";
import { Card, Button, Separator, Badge } from "../components/ui";
import { useToast } from "../components/Toast";

export default function ProfilePage() {
  const { user, logout, notes, notebooks } = useAppContext();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("general");
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    fullName: user?.user_metadata?.full_name || "Alex Johnson",
    email: user?.email || "alex.johnson@example.com",
    bio: "Productivity enthusiast, minimalist, and lifelong learner.",
    location: "San Francisco, CA",
    website: "https://alexjohnson.dev"
  });

  const handleLogout = async () => {
    try {
      await logout();
      addToast("Logged out successfully");
      navigate("/login");
    } catch (err) {
      addToast("Logout failed", "error");
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    addToast("Profile updated successfully!");
  };

  const initial = profileData.fullName.charAt(0).toUpperCase();

  const tabs = [
    { id: "general", label: "General", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Billing", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="h-64 bg-gradient-to-br from-violet-600 via-violet-500 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 size-40 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-20 size-60 rounded-full bg-white blur-3xl" />
        </div>
        
        <div className="mx-auto max-w-[1000px] px-8 h-full flex items-end pb-12">
          <div className="flex items-center gap-8 w-full">
            <div className="relative group">
              <div className="size-32 rounded-3xl bg-white p-1.5 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full rounded-[1.2rem] bg-violet-100 flex items-center justify-center text-4xl font-black text-violet-600">
                  {initial}
                </div>
              </div>
              <button className="absolute -bottom-2 -right-2 size-10 rounded-2xl bg-white border border-gray-100 shadow-xl flex items-center justify-center text-gray-500 hover:text-violet-600 transition-all hover:scale-110 active:scale-95">
                <Camera className="size-5" />
              </button>
            </div>
            
            <div className="flex-1 text-white mb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight">{profileData.fullName}</h1>
                <Badge className="bg-white/20 text-white border-none backdrop-blur-md px-3 font-bold">Pro Member</Badge>
              </div>
              <p className="text-violet-100 font-medium opacity-80 mt-1">{profileData.email}</p>
            </div>

            <div className="flex gap-3 mb-2">
              <Button 
                variant="soft" 
                className="bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-md rounded-2xl px-6"
                onClick={handleLogout}
              >
                <LogOut className="size-4 mr-2" /> Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-[1000px] px-8 py-12 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[240px,1fr] gap-16">
          
          {/* Sidebar Nav */}
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-3">Account</p>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all group",
                  activeTab === tab.id 
                    ? "bg-violet-50 text-violet-600 shadow-sm" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <tab.icon className={cn("size-4", activeTab === tab.id ? "text-violet-600" : "text-gray-300 group-hover:text-gray-500")} />
                {tab.label}
              </button>
            ))}
            
            <Separator className="my-6 opacity-50" />
            
            <div className="bg-violet-50 rounded-3xl p-6 relative overflow-hidden group border border-violet-100">
               <Sparkles className="absolute -right-4 -top-4 size-16 text-violet-200 opacity-50 group-hover:rotate-12 transition-transform" />
               <p className="text-xs font-black text-violet-600 uppercase tracking-widest mb-2">Premium</p>
               <h3 className="text-sm font-black text-violet-900 leading-tight">Unlimited <br/>Capabilities</h3>
               <p className="text-xs text-violet-700/60 mt-2 font-medium">Your current plan includes all pro features.</p>
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-w-0">
            {activeTab === "general" && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Profile Settings</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage your public information and presence.</p>
                  </div>
                  <Button 
                    className={cn("rounded-2xl px-8 font-black transition-all shadow-lg shadow-violet-100", isEditing ? "bg-emerald-600 hover:bg-emerald-700" : "bg-violet-600 hover:bg-violet-700")}
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                  >
                    {isEditing ? "Save Changes" : "Edit Profile"}
                  </Button>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-300 group-focus-within:text-violet-500" />
                        <input 
                          disabled={!isEditing}
                          value={profileData.fullName}
                          onChange={e => setProfileData({...profileData, fullName: e.target.value})}
                          className="h-14 w-full rounded-2xl border border-gray-100 bg-gray-50/50 pl-12 pr-4 text-sm font-bold outline-none transition focus:bg-white focus:border-violet-200 focus:ring-4 focus:ring-violet-50 disabled:opacity-50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-300 group-focus-within:text-violet-500" />
                        <input 
                          disabled={!isEditing}
                          value={profileData.email}
                          onChange={e => setProfileData({...profileData, email: e.target.value})}
                          className="h-14 w-full rounded-2xl border border-gray-100 bg-gray-50/50 pl-12 pr-4 text-sm font-bold outline-none transition focus:bg-white focus:border-violet-200 focus:ring-4 focus:ring-violet-50 disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Bio</label>
                      <span className="text-[10px] font-bold text-gray-300">{profileData.bio.length}/160</span>
                    </div>
                    <textarea 
                      disabled={!isEditing}
                      value={profileData.bio}
                      onChange={e => setProfileData({...profileData, bio: e.target.value})}
                      className="min-h-[120px] w-full rounded-3xl border border-gray-100 bg-gray-50/50 p-6 text-sm font-bold outline-none transition focus:bg-white focus:border-violet-200 focus:ring-4 focus:ring-violet-50 disabled:opacity-50 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Location</label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-300 group-focus-within:text-violet-500" />
                        <input 
                          disabled={!isEditing}
                          value={profileData.location}
                          onChange={e => setProfileData({...profileData, location: e.target.value})}
                          className="h-14 w-full rounded-2xl border border-gray-100 bg-gray-50/50 pl-12 pr-4 text-sm font-bold outline-none transition focus:bg-white focus:border-violet-200 focus:ring-4 focus:ring-violet-50 disabled:opacity-50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Website</label>
                      <div className="relative group">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-300 group-focus-within:text-violet-500" />
                        <input 
                          disabled={!isEditing}
                          value={profileData.website}
                          onChange={e => setProfileData({...profileData, website: e.target.value})}
                          className="h-14 w-full rounded-2xl border border-gray-100 bg-gray-50/50 pl-12 pr-4 text-sm font-bold outline-none transition focus:bg-white focus:border-violet-200 focus:ring-4 focus:ring-violet-50 disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-8">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Notes Created</p>
                        <p className="text-2xl font-black text-gray-900">{notes.length}</p>
                      </div>
                      <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Notebooks</p>
                        <p className="text-2xl font-black text-gray-900">{notebooks.length}</p>
                      </div>
                      <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Streak</p>
                        <p className="text-2xl font-black text-gray-900">12 Days</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Security & Privacy</h2>
                <p className="text-gray-500 text-sm mb-10">Keep your account secure and manage access.</p>
                
                <div className="space-y-6">
                   <button className="w-full flex items-center justify-between p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:bg-white hover:border-violet-100 transition-all group">
                     <div className="flex items-center gap-4 text-left">
                       <div className="size-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-violet-600 transition-colors">
                         <Lock className="size-6" />
                       </div>
                       <div>
                         <p className="text-sm font-black text-gray-900">Change Password</p>
                         <p className="text-xs text-gray-500 mt-0.5 font-medium">Update your password regularly to stay safe.</p>
                       </div>
                     </div>
                     <ChevronRight className="size-5 text-gray-300" />
                   </button>

                   <button className="w-full flex items-center justify-between p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:bg-white hover:border-violet-100 transition-all group">
                     <div className="flex items-center gap-4 text-left">
                       <div className="size-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-violet-600 transition-colors">
                         <Smartphone className="size-6" />
                       </div>
                       <div>
                         <p className="text-sm font-black text-gray-900">Two-Factor Authentication</p>
                         <p className="text-xs text-gray-500 mt-0.5 font-medium">Add an extra layer of security to your account.</p>
                       </div>
                     </div>
                     <Badge className="bg-gray-200 text-gray-500 border-none font-bold">Disabled</Badge>
                   </button>

                   <Separator className="my-10 opacity-50" />

                   <div className="p-8 rounded-3xl border-2 border-red-50 bg-red-50/20">
                     <h3 className="text-lg font-black text-red-900 mb-1">Danger Zone</h3>
                     <p className="text-sm text-red-700/60 font-medium mb-6">These actions are permanent and cannot be undone.</p>
                     
                     <div className="flex flex-col gap-4">
                        <button className="flex items-center justify-between p-4 rounded-2xl border border-red-100 bg-white hover:bg-red-50 transition-all group">
                          <div className="flex items-center gap-3">
                            <Trash2 className="size-4 text-red-400" />
                            <span className="text-sm font-bold text-red-600">Delete all note data</span>
                          </div>
                          <ChevronRight className="size-4 text-red-200" />
                        </button>
                        <button className="flex items-center justify-between p-4 rounded-2xl bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-100">
                          <span className="text-sm font-black text-white px-1">Permanently Delete Account</span>
                          <CheckCircle2 className="size-4 text-white/50" />
                        </button>
                     </div>
                   </div>
                </div>
              </motion.div>
            )}

            {/* Other tabs placeholders */}
            {(activeTab === "notifications" || activeTab === "billing") && (
              <div className="h-[400px] flex flex-col items-center justify-center text-center">
                 <div className="size-20 rounded-3xl bg-gray-50 flex items-center justify-center mb-6">
                    <SettingsIcon className="size-10 text-gray-200" />
                 </div>
                 <h3 className="text-xl font-black text-gray-900 mb-1">{tabs.find(t => t.id === activeTab).label} Settings</h3>
                 <p className="text-gray-500 text-sm max-w-xs">This feature is part of the upcoming Pro update. Stay tuned!</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
