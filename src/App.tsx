import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Features from "./components/Features";
import Roadmap from "./components/Roadmap";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Register from "./components/Register";
import Login from "./components/Login";
import StudentDashboard from "./components/StudentDashboard";
import AdminDashboard from "./components/AdminDashboard";
import FloatingAssistant from "./components/FloatingAssistant";

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      window.scrollTo({ top: 0, behavior: "smooth" }); // Smoothly scroll to top on page change
    };

    window.addEventListener("popstate", handleLocationChange);
    
    // Polyfill pushState to notify current path changes
    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };

    const originalReplaceState = window.history.replaceState;
    window.history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  // Simple state router
  if (currentPath === "/register") {
    return (
      <div className="relative min-h-screen bg-brand-black text-gray-200 antialiased overflow-x-hidden selection:bg-brand-cyan/30 selection:text-white">
        <div className="fixed inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none z-0"></div>
        <Navbar />
        <main className="relative z-10">
          <Register />
        </main>
      </div>
    );
  }

  if (currentPath === "/login") {
    return (
      <div className="relative min-h-screen bg-brand-black text-gray-200 antialiased overflow-x-hidden selection:bg-brand-cyan/30 selection:text-white">
        <div className="fixed inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none z-0"></div>
        <Navbar />
        <main className="relative z-10">
          <Login />
        </main>
      </div>
    );
  }

  if (currentPath === "/student-dashboard") {
    return (
      <div className="relative min-h-screen bg-brand-black text-gray-200 antialiased overflow-x-hidden selection:bg-brand-cyan/30 selection:text-white">
        <div className="fixed inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none z-0"></div>
        <Navbar />
        <main className="relative z-10">
          <StudentDashboard />
        </main>
        <FloatingAssistant userType="student" />
      </div>
    );
  }

  if (currentPath === "/admin-dashboard") {
    return (
      <div className="relative min-h-screen bg-brand-black text-gray-200 antialiased overflow-x-hidden selection:bg-brand-cyan/30 selection:text-white">
        <div className="fixed inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none z-0"></div>
        <main className="relative z-10 animate-fadeIn">
          <AdminDashboard />
        </main>
        <FloatingAssistant userType="admin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-brand-black text-gray-200 antialiased overflow-x-hidden selection:bg-brand-cyan/30 selection:text-white">
      {/* Premium background grain overlay simulation */}
      <div className="fixed inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none z-0"></div>
      
      {/* 1. Navigation */}
      <Navbar />

      {/* Main Sections */}
      <main className="relative z-10">
        {/* 2. Hero Section */}
        <Hero />

        {/* 3. About NapPy Section */}
        <About />

        {/* 4. Features Section */}
        <Features />

        {/* 5. Learning Roadmap Section */}
        <Roadmap />

        {/* 6. Contact Section */}
        <Contact />
      </main>

      {/* 7. Footer Section */}
      <Footer />
    </div>
  );
}
