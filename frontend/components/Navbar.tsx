"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [initial, setInitial] = useState("U");
  const [profilePicture, setProfilePicture] = useState("");

  useEffect(() => {
    const loadUserData = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.name) {
            setInitial(parsedUser.name.charAt(0).toUpperCase());
          }
          if (parsedUser.profilePicture) {
            setProfilePicture(parsedUser.profilePicture);
          } else {
            setProfilePicture("");
          }
        } catch (e) {
          console.error("Error parsing user data in Navbar", e);
        }
      }
    };

    loadUserData();

    // Listen for custom event from Profile page
    window.addEventListener("profilePictureUpdated", loadUserData);
    return () => window.removeEventListener("profilePictureUpdated", loadUserData);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <nav className="flex justify-between items-center bg-white/10 backdrop-blur-lg border border-white/10 px-6 py-4 shadow-xl rounded-2xl w-full">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 border border-white/20 overflow-hidden">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-white text-xl">{initial}</span>
            )}
          </div>
          <h1 className="font-extrabold text-xl tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Finzy</h1>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <Link 
            href="/" 
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Home
          </Link>
          <Link 
            href="/analytics" 
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Analytics
          </Link>
          <Link 
            href="/profile" 
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Profile
          </Link>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="group flex items-center gap-2 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 text-gray-300 hover:text-red-400 px-4 py-2 rounded-xl transition-all duration-300"
      >
        <span className="text-sm font-medium">Logout</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </nav>
  );
}