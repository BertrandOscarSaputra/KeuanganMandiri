"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import api from "@/services/api";

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; profilePicture?: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const isLogin = localStorage.getItem("isLogin");
    if (!isLogin) {
      router.push("/login");
    } else {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser({
            name: parsedUser.name || "Unknown User",
            email: parsedUser.email || "No email provided",
            profilePicture: parsedUser.profilePicture || "",
          });
        } catch (e) {
          console.error("Error parsing user data", e);
        }
      }
    }
  }, [router]);

  if (!mounted) return null;

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  const handleLogout = () => {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      alert("File size should be less than 2MB");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      
      try {
        await api.put("/users/profile-picture", { base64Image: base64String });
        
        // Update local state and localStorage
        if (user) {
          const updatedUser = { ...user, profilePicture: base64String };
          setUser(updatedUser);
          
          const rawLocalUser = localStorage.getItem("user");
          if (rawLocalUser) {
            const localUserObj = JSON.parse(rawLocalUser);
            localUserObj.profilePicture = base64String;
            localStorage.setItem("user", JSON.stringify(localUserObj));
            // Dispatch a custom event so Navbar can update instantly
            window.dispatchEvent(new Event("profilePictureUpdated"));
          }
        }
      } catch (error) {
        console.error("Failed to upload profile picture", error);
        alert("Failed to update profile picture");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        <Navbar />

        <div className="mt-12 max-w-3xl mx-auto animate-fade-in-up">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden group">
            {/* Decorative background glow for card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-blue-500/20 transition-colors duration-500"></div>
            
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="relative group/avatar cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 border-4 border-white/10 relative z-10 overflow-hidden">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl font-extrabold text-white shadow-sm">
                      {user ? getInitial(user.name) : "?"}
                    </span>
                  )}
                  {/* Hover overlay for changing picture */}
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300">
                    {uploading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-xs text-white font-medium">Change</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 blur-xl opacity-40 animate-pulse"></div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                  {user?.name || "Loading..."}
                </h2>
                <p className="text-gray-400 text-lg flex items-center justify-center sm:justify-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {user?.email || "Loading..."}
                </p>
                
                <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => alert("Edit profile feature coming soon!")}
                    className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Profile
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
            
            {/* Extra Account Status Section */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50">
                <p className="text-gray-400 text-sm mb-1">Account Status</p>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  <span className="text-white font-medium">Active</span>
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50">
                <p className="text-gray-400 text-sm mb-1">Plan</p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">PREMIUM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
