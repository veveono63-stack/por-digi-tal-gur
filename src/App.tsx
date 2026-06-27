/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { auth, isFirebaseConnected } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { dbService } from "./dbService";
import { PortfolioData } from "./types";
import PublicView from "./components/PublicView";
import AdminDashboard from "./components/AdminDashboard";
import LoginModal from "./components/LoginModal";
import PrintPreview from "./components/PrintPreview";

export default function App() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(dbService.getPortfolioData());
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem("admin_session") === "true";
  });
  const [showAdminDashboard, setShowAdminDashboard] = useState<boolean>(() => {
    return localStorage.getItem("admin_session") === "true";
  });
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [printView, setPrintView] = useState<{ active: boolean; type: "cv" | "full" }>({ active: false, type: "cv" });
  const [logoClicks, setLogoClicks] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme_mode");
    return saved !== "light"; // Default is true (dark mode)
  });

  const handleToggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem("theme_mode", next ? "dark" : "light");
      return next;
    });
  };

  // Sync data on boot, listen for Auth state, and handle ?print= query parameter
  useEffect(() => {
    // 0. Auto-open print preview if ?print= param is present (for printing from iframe fallback)
    const params = new URLSearchParams(window.location.search);
    const printParam = params.get("print");
    if (printParam === "cv" || printParam === "full") {
      setPrintView({ active: true, type: printParam });
    }

    // 1. Initial Load from Firebase if connected
    const loadFirebaseData = async () => {
      if (isFirebaseConnected) {
        const success = await dbService.loadFromFirebase();
        if (success) {
          setPortfolioData(dbService.getPortfolioData());
        }
      }
    };
    loadFirebaseData();

    // 2. Auth State listener
    if (isFirebaseConnected && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setIsAdmin(true);
          localStorage.setItem("admin_session", "true");
          setShowAdminDashboard(true);
        } else {
          setIsAdmin(false);
          localStorage.removeItem("admin_session");
          setShowAdminDashboard(false);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // 3. Dynamic SEO and Title Update
  useEffect(() => {
    if (portfolioData?.settings) {
      document.title = portfolioData.settings.seoTitle || "Portofolio Digital Guru";
      
      // Update SEO description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", portfolioData.settings.seoDescription || "");
    }
  }, [portfolioData]);

  // 4. Keyboard Shortcut for Hidden Login (Ctrl + Shift + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        const hasSession = localStorage.getItem("admin_session") === "true";
        if (hasSession || isAdmin) {
          setIsAdmin(true);
          setShowAdminDashboard(true);
        } else {
          setIsLoginOpen(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAdmin]);

  // Handle click on logo 5 times to open login
  const handleLogoClick = () => {
    const nextCount = logoClicks + 1;
    if (nextCount >= 5) {
      const hasSession = localStorage.getItem("admin_session") === "true";
      if (hasSession || isAdmin) {
        setIsAdmin(true);
        setShowAdminDashboard(true);
      } else {
        setIsLoginOpen(true);
      }
      setLogoClicks(0);
    } else {
      setLogoClicks(nextCount);
      // Auto-reset clicks after 4 seconds of inactivity
      const timer = setTimeout(() => setLogoClicks(0), 4000);
      return () => clearTimeout(timer);
    }
  };

  const refreshData = () => {
    setPortfolioData({ ...dbService.getPortfolioData() });
  };

  const handleLoginSuccess = (status: boolean) => {
    setIsAdmin(status);
    if (status) {
      localStorage.setItem("admin_session", "true");
      setShowAdminDashboard(true);
    } else {
      localStorage.removeItem("admin_session");
      setShowAdminDashboard(false);
    }
    triggerSync();
  };

  const handleLogout = async () => {
    localStorage.removeItem("admin_session");
    if (isFirebaseConnected && auth) {
      try {
        await auth.signOut();
      } catch (e) {
        console.error("Signout error:", e);
      }
    }
    setIsAdmin(false);
    setShowAdminDashboard(false);
    triggerSync();
  };

  const triggerSync = async () => {
    if (isFirebaseConnected) {
      await dbService.syncToFirebase();
    }
  };

  // If Print View is active, render print page instead of main shell
  if (printView.active) {
    return (
      <PrintPreview
        data={portfolioData}
        printType={printView.type}
        onClose={() => setPrintView({ active: false, type: "cv" })}
      />
    );
  }

  return (
    <div className={`relative ${isDarkMode ? "dark" : "light"}`}>
      {isAdmin && showAdminDashboard ? (
        <AdminDashboard
          portfolioData={portfolioData}
          onLogout={handleLogout}
          onRefreshData={refreshData}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          onBackToPreview={() => setShowAdminDashboard(false)}
        />
      ) : (
        <PublicView
          data={portfolioData}
          onOpenLogin={() => {
            const hasSession = localStorage.getItem("admin_session") === "true";
            if (hasSession || isAdmin) {
              setIsAdmin(true);
              setShowAdminDashboard(true);
            } else {
              setIsLoginOpen(true);
            }
          }}
          onOpenPrint={(type) => setPrintView({ active: true, type })}
          logoClickCount={logoClicks}
          onLogoClick={handleLogoClick}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          isAdminLoggedIn={isAdmin}
          onReturnToAdmin={() => setShowAdminDashboard(true)}
        />
      )}

      {/* Hidden login overlay dialog */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => { setIsLoginOpen(false); setLogoClicks(0); }}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
