/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  GraduationCap, Briefcase, Award, BookOpen, Compass, FileCheck2, 
  TrendingUp, Users, Image, FileText, Mail, Phone, MapPin, 
  Download, ExternalLink, Menu, X, ChevronRight, Lock, 
  BookOpenCheck, MessageSquare, ChevronDown, CheckCircle2,
  Facebook, Instagram, Youtube, Music, Globe, Sparkles,
  School, Sun, Moon, Printer, ClipboardList, Eye, Play, Maximize2
} from "lucide-react";
import { PortfolioData, ContactMessage } from "../types";
import { dbService } from "../dbService";
import { formatDate, getEmbedUrl, getDirectImageUrl } from "../utils";

interface PublicViewProps {
  data: PortfolioData;
  onOpenLogin: () => void;
  onOpenPrint: (type: "cv" | "full") => void;
  logoClickCount: number;
  onLogoClick: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isAdminLoggedIn?: boolean;
  onReturnToAdmin?: () => void;
}

export default function PublicView({ 
  data, 
  onOpenLogin, 
  onOpenPrint, 
  logoClickCount, 
  onLogoClick,
  isDarkMode,
  onToggleTheme,
  isAdminLoggedIn,
  onReturnToAdmin
}: PublicViewProps) {
  const { profile, education, career, additionalTasks = [], developmentEvents, achievements, works, innovations, bestPractices, studentImpacts, competencies, organizations, gallery, certificates, documents, articles, settings } = data;

  const [activeSection, setActiveSection] = useState("beranda");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const bgMain = isDarkMode ? "bg-[#070d19] text-slate-100" : "bg-slate-50 text-slate-800";
  const bgCard = isDarkMode ? "bg-[#0c1322]/85 border-slate-800/80" : "bg-white border-slate-200/80 shadow-md shadow-slate-100/60";
  const bgProfileCard = isDarkMode ? "bg-gradient-to-b from-[#111c30] to-[#0a1221] border-slate-800/80" : "bg-white border-slate-200 shadow-md shadow-slate-100/60";
  const bgCardSecondary = isDarkMode ? "bg-[#121c2e]/60 border-slate-800/80" : "bg-slate-100/60 border-slate-200/70";
  const textTitle = isDarkMode ? "text-white" : "text-slate-900 font-bold";
  const textHeading = isDarkMode ? "text-white" : "text-slate-900";
  const textMotto = isDarkMode ? "bg-slate-950/40 border-slate-800/60 text-slate-300" : "bg-slate-50 border-slate-200/80 text-slate-650";
  const bgBadge = isDarkMode ? "bg-[#0c1524] border-slate-800/60 text-slate-300" : "bg-slate-50 text-slate-700 border border-slate-200";
  const textDesc = isDarkMode ? "text-slate-300" : "text-slate-650";
  const textLabel = isDarkMode ? "text-slate-400" : "text-slate-500";
  const borderCol = isDarkMode ? "border-slate-800/80" : "border-slate-200/80";
  const borderDivider = isDarkMode ? "border-slate-850" : "border-slate-200";
  const bgInput = isDarkMode ? "bg-slate-850 text-white border-slate-700 focus:border-amber-500/50" : "bg-white text-slate-900 border-slate-300 focus:border-amber-500";
  
  // Contact state
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Gallery filter state
  const [galleryFilter, setGalleryFilter] = useState("Semua");
  
  // Active article state
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  // Selected gallery image for lightbox
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<any>(null);

  // Dynamic preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("");
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const handleOpenPreview = (url: string | undefined, title: string, e?: React.MouseEvent, forceType?: string) => {
    if (e) e.preventDefault();
    if (!url) return;
    setPreviewUrl(url);
    setPreviewTitle(title);
    setPreviewType(forceType || null);
  };

  useEffect(() => {
    // Record page view on load
    dbService.incrementView();
  }, []);

  // Filter out sections that are either hidden in settings OR have no data
  const isSectionVisible = (key: string): boolean => {
    // Check settings visibility first
    const visibilityConfig = settings.menuVisibility as any;
    if (visibilityConfig && visibilityConfig[key] === false) {
      return false;
    }

    // Check data availability (Auto-Hide Rule)
    switch (key) {
      case "pendidikan": return education.length > 0;
      case "karier": return career.length > 0;
      case "tugasTambahan": return additionalTasks.length > 0;
      case "pengembanganDiri": return developmentEvents.length > 0;
      case "prestasi": return achievements.length > 0;
      case "karya": return works.length > 0;
      case "inovasi": return innovations.length > 0;
      case "bestPractice": return bestPractices.length > 0;
      case "dampakSiswa": return studentImpacts.length > 0;
      case "kompetensi": return competencies.length > 0;
      case "organisasi": return organizations.length > 0;
      case "galeri": return gallery.length > 0;
      case "sertifikat": return certificates.length > 0;
      case "dokumen": return documents.length > 0;
      case "artikel": return articles.length > 0;
      default: return true; // beranda, profil, kontak always visible unless set to false in settings
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);

    const newMessage: ContactMessage = {
      id: "msg_" + Date.now(),
      name: senderName,
      email: senderEmail,
      subject,
      message,
      date: new Date().toISOString().split("T")[0],
      isRead: false
    };

    try {
      await dbService.saveListEntity("contactMessages", newMessage);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setSenderName("");
      setSenderEmail("");
      setSubject("");
      setMessage("");
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  const handleDownloadCV = () => {
    dbService.incrementDownload();
    if (profile.cvUrl && profile.cvUrl.trim() !== "") {
      window.open(profile.cvUrl.trim(), "_blank");
    } else {
      onOpenPrint("cv");
    }
  };

  // Get dynamic unique gallery categories with case-insensitive normalization
  const galleryWithCanonicalCategories = (() => {
    const categoryMap = new Map<string, string>();
    gallery.forEach(item => {
      const rawCat = (item.category || "").trim();
      if (rawCat) {
        const lower = rawCat.toLowerCase();
        if (!categoryMap.has(lower)) {
          categoryMap.set(lower, rawCat);
        }
      }
    });

    return gallery.map(item => {
      const rawCat = (item.category || "").trim();
      const canonical = categoryMap.get(rawCat.toLowerCase()) || rawCat || "Lainnya";
      return {
        ...item,
        category: canonical
      };
    });
  })();

  const galleryCategories = [
    "Semua",
    ...Array.from(new Set(galleryWithCanonicalCategories.map(item => item.category)))
  ];

  const filteredGallery = galleryFilter === "Semua" 
    ? galleryWithCanonicalCategories 
    : galleryWithCanonicalCategories.filter(item => item.category === galleryFilter);

  // List of active navigation items
  const navItems = [
    { id: "beranda", label: "Beranda", icon: Compass },
    { id: "profil", label: "Profil Lengkap", icon: Users },
    { id: "pendidikan", label: "Pendidikan", icon: GraduationCap },
    { id: "karier", label: "Karier", icon: Briefcase },
    { id: "tugasTambahan", label: "Tugas Tambahan", icon: ClipboardList },
    { id: "pengembanganDiri", label: "Pengembangan Diri", icon: FileCheck2 },
    { id: "prestasi", label: "Prestasi", icon: Award },
    { id: "karya", label: "Karya Inovasi dan Publikasi", icon: BookOpen },
    { id: "organisasi", label: "Organisasi", icon: Globe },
    { id: "galeri", label: "Galeri", icon: Image },
    { id: "sertifikat", label: "Lain-Lain", icon: FileText },
    { id: "kontak", label: "Hubungi Saya", icon: Mail }
  ].filter(item => {
    if (item.id === "sertifikat") {
      return isSectionVisible("dokumen");
    }
    return isSectionVisible(item.id);
  });

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 selection:bg-amber-500 selection:text-slate-950 ${bgMain}`}>
      {isAdminLoggedIn && onReturnToAdmin && (
        <div className="bg-slate-900 border-b border-amber-500/20 py-2.5 px-4 text-center text-xs flex items-center justify-center gap-2 relative z-50 animate-fade-in font-medium text-white shadow-sm">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span>Anda sedang masuk sebagai <strong>Admin</strong>. Klik tombol berikut untuk kembali ke panel CMS:</span>
          <button
            onClick={onReturnToAdmin}
            className="ml-2 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[10px] uppercase tracking-wider transition shadow duration-150"
          >
            Kembali ke Dashboard CMS
          </button>
        </div>
      )}
      
      {/* Background ambient glows (extremely subtle in light mode, gorgeous in dark) */}
      <div className={`absolute top-0 left-1/4 w-[40rem] h-[40rem] rounded-full blur-[120px] pointer-events-none ${isDarkMode ? "bg-amber-500/5" : "bg-amber-500/2"}`}></div>
      <div className={`absolute top-[60vh] right-0 w-[30rem] h-[30rem] rounded-full blur-[100px] pointer-events-none ${isDarkMode ? "bg-blue-500/5" : "bg-blue-500/2"}`}></div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-0">
        
        {/* Header / Top Bar (Sticky, beautifully compact, wraps gracefully) */}
        <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${borderDivider} ${isDarkMode ? "bg-[#070d19]/90" : "bg-slate-50/90"} transition-colors py-3 px-4 -mx-4 sm:px-6 sm:-mx-6 lg:px-8 lg:-mx-8 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-3 relative`}>
          <div className="flex items-center justify-between w-full lg:w-auto">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={onLogoClick}>
              <div className={`relative p-2 rounded-xl transition border ${logoClickCount > 0 ? "border-amber-500 bg-amber-500/10 animate-pulse" : isDarkMode ? "border-slate-800 bg-slate-900/60 text-amber-500" : "border-slate-200 bg-white text-amber-600 shadow-sm"}`}>
                <School className="w-5 h-5 text-amber-500" />
                {logoClickCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 text-slate-950 text-[9px] font-extrabold flex items-center justify-center rounded-full">
                    {5 - logoClickCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className={`font-extrabold tracking-tight text-sm sm:text-base ${isDarkMode ? "text-white" : "text-slate-900"}`}>{settings.siteTitle || "Portofolio Digital Guru"}</h1>
                <p className="text-[9px] font-bold uppercase tracking-wider text-amber-500 leading-none mt-0.5">Belajar, Berbagi, Menginspirasi</p>
              </div>
            </div>

            {/* Mobile Menu & Theme Toggle Controls (Middle-aligned and beautifully adjacent) */}
            <div className="flex lg:hidden items-center space-x-2">
              <button
                onClick={onToggleTheme}
                className={`p-1.5 border rounded-lg transition ${isDarkMode ? "bg-slate-900 border-slate-800 text-amber-500 hover:text-amber-400" : "bg-white border-slate-200 text-amber-600 hover:bg-slate-100 shadow-sm"}`}
                title={isDarkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
              >
                {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-1.5 border rounded-lg transition ${isDarkMode ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-white" : "bg-white border-slate-200 text-slate-600 hover:text-slate-950 shadow-sm"}`}
              >
                {mobileMenuOpen ? <X size={15} /> : <Menu size={15} />}
              </button>
            </div>
          </div>

          {/* Desktop Horizontal Navigation (Wraps gracefully if too many items) */}
          <nav className="hidden lg:flex flex-wrap items-center justify-center gap-1.5 max-w-4xl py-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  const el = document.getElementById(`section-${item.id}`);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${activeSection === item.id ? "bg-amber-500 text-slate-950 shadow-sm" : isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-900" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"}`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={handleDownloadCV}
              className="px-2.5 py-1 text-[11px] font-extrabold rounded-lg text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 transition shadow-sm active:scale-95 flex items-center space-x-1 whitespace-nowrap"
            >
              <Printer size={11} />
              <span>Cetak Portofolio</span>
            </button>
          </nav>

          {/* Right side controls: Theme Toggle only (Lock and Download buttons removed from header as requested) */}
          <div className="hidden lg:flex items-center space-x-3">
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border transition ${isDarkMode ? "bg-slate-900/80 border-slate-800 text-amber-500 hover:text-amber-400" : "bg-white border-slate-200 text-amber-600 hover:bg-slate-100 shadow-sm"}`}
              title={isDarkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>

          {/* Mobile Navigation Drawer - Positioned relative to sticky header */}
          {mobileMenuOpen && (
            <div className={`lg:hidden absolute left-4 right-4 top-full mt-2 border rounded-2xl p-4 shadow-2xl z-50 space-y-2 transition-colors ${isDarkMode ? "bg-slate-900/95 border-slate-800" : "bg-white border-slate-200 text-slate-800 shadow-lg"}`}>
              <div className={`grid grid-cols-2 gap-1 pb-4 border-b ${borderDivider}`}>
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setMobileMenuOpen(false);
                      const el = document.getElementById(`section-${item.id}`);
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`flex items-center space-x-2 p-2.5 rounded-lg text-xs font-medium transition ${activeSection === item.id ? "bg-amber-500/10 text-amber-500 border border-amber-500/25" : isDarkMode ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}
                  >
                    <item.icon size={14} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-between pt-2">
                <button
                  onClick={() => { setMobileMenuOpen(false); handleDownloadCV(); }}
                  className="w-full py-2.5 text-center text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl flex items-center justify-center space-x-1.5 shadow"
                >
                  <Printer size={13} />
                  <span>Cetak Portofolio</span>
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Grid Split-Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
          
          {/* LEFT SIDE PANEL: STICKY PROFILE & IDENTITY CARD (1/3 Width) - Exactly 1 rectangular card */}
          <div className="lg:col-span-4 lg:sticky lg:top-[74px] lg:max-h-[calc(100vh-90px)] lg:overflow-y-auto scrollbar-none z-30">
            
            <div className={`border rounded-2xl p-5 sm:p-6 relative overflow-hidden transition-colors ${bgProfileCard}`}>
              {/* Golden trim border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600"></div>
 
              <div className="text-center space-y-3.5">
                {/* Photo with double amber-borders */}
                <div className="relative inline-block mt-1">
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-2xl rotate-3 opacity-30 blur-sm"></div>
                  <img
                    src={getDirectImageUrl(profile.photoUrl) || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=350"}
                    alt={profile.fullName}
                    className="relative w-32 h-32 object-cover rounded-2xl border-2 border-amber-500/40 p-1 bg-slate-900"
                    referrerPolicy="no-referrer"
                  />
                </div>
 
                {/* Identity */}
                <div>
                  <h2 className={`text-xl font-extrabold leading-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>{profile.fullName}</h2>
                  {(profile.birthPlace || profile.birthDate) && (
                    <p className={`text-[11px] mt-1 font-semibold ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                      📍 {profile.birthPlace || ""}{profile.birthPlace && profile.birthDate ? ", " : ""}{profile.birthDate ? formatDate(profile.birthDate) : ""}
                    </p>
                  )}
                  <p className="text-xs font-bold text-amber-500 mt-1 uppercase tracking-wide">{profile.title}</p>
                  <p className={`text-xs mt-0.5 font-medium leading-snug ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{profile.position} {profile.rank ? `(${profile.rank})` : ""}</p>
                  <p className={`text-xs font-semibold font-mono mt-1 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>{profile.workUnit}</p>
                </div>
 
                {/* Motto */}
                <div className={`p-3 rounded-xl italic text-xs leading-relaxed border transition-colors ${textMotto}`}>
                  "{profile.motto}"
                </div>

                {/* Contact details */}
                <div className={`space-y-2 text-left text-xs pt-3 border-t ${borderDivider}`}>
                  <div className="flex items-center space-x-2.5">
                    <Mail size={14} className="text-amber-500 shrink-0" />
                    <span className={`truncate ${isDarkMode ? "text-slate-300" : "text-slate-650"}`}>{profile.email}</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Phone size={14} className="text-amber-500 shrink-0" />
                    <span className={isDarkMode ? "text-slate-300" : "text-slate-655"}>{profile.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <MapPin size={14} className="text-amber-500 shrink-0" />
                    <span className={`line-clamp-1 ${isDarkMode ? "text-slate-300" : "text-slate-655"}`}>{profile.address}</span>
                  </div>
                </div>
 
                {/* Social media links */}
                <div className="flex items-center justify-center space-x-3 pt-3">
                  {profile.socials.facebook && (
                    <a href={profile.socials.facebook} target="_blank" rel="noreferrer" className={`p-2 border rounded-lg transition ${isDarkMode ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-500 hover:border-amber-500/30" : "bg-slate-50 border-slate-200 text-slate-500 hover:text-amber-600 hover:bg-slate-100"}`} title="Facebook">
                      <Facebook size={16} />
                    </a>
                  )}
                  {profile.socials.instagram && (
                    <a href={profile.socials.instagram} target="_blank" rel="noreferrer" className={`p-2 border rounded-lg transition ${isDarkMode ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-500 hover:border-amber-500/30" : "bg-slate-50 border-slate-200 text-slate-500 hover:text-amber-600 hover:bg-slate-100"}`} title="Instagram">
                      <Instagram size={16} />
                    </a>
                  )}
                  {profile.socials.youtube && (
                    <a href={profile.socials.youtube} target="_blank" rel="noreferrer" className={`p-2 border rounded-lg transition ${isDarkMode ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-500 hover:border-amber-500/30" : "bg-slate-50 border-slate-200 text-slate-500 hover:text-amber-600 hover:bg-slate-100"}`} title="YouTube">
                      <Youtube size={16} />
                    </a>
                  )}
                  {profile.socials.tiktok && (
                    <a href={profile.socials.tiktok} target="_blank" rel="noreferrer" className={`p-2 border rounded-lg transition ${isDarkMode ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-500 hover:border-amber-500/30" : "bg-slate-50 border-slate-200 text-slate-500 hover:text-amber-600 hover:bg-slate-100"}`} title="TikTok">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .7.08V9.4a6.27 6.27 0 0 0-3.23-.29 6.25 6.25 0 0 0-5.18 6.13 6.25 6.25 0 0 0 10.64 4.41 6.19 6.19 0 0 0 1.74-4.41V8.66a8.13 8.13 0 0 0 4.73 1.67V6.91a5.58 5.58 0 0 1-.94-.22z"/>
                      </svg>
                    </a>
                  )}
                </div>

              </div>
            </div>

          </div>

          {/* RIGHT SIDE CONTENT PANEL: SCROLLABLE DYNAMIC MODULES (2/3 Width) */}
          <div className="lg:col-span-8 space-y-8 pb-16">
            
            {/* MODULE 1: BERANDA (OVERVIEW & BIODATA) */}
            {isSectionVisible("beranda") && (
              <section id="section-beranda" className="scroll-mt-[90px] bg-[#0c1322]/85 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
                    <Compass size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white uppercase tracking-wider">Beranda</h3>
                    <p className="text-xs text-slate-400">Ringkasan & Informasi Utama</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-2xl font-black text-white leading-tight">
                    Selamat Datang di Portofolio Digital Resmi
                    <span className="block text-amber-500 mt-1.5">{profile.fullName}</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed text-justify">
                    {profile.bio}
                  </p>

                  {/* Highlighted cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                    <div className="bg-[#121c2e] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-amber-500 font-mono uppercase tracking-wider">Kategori Jabatan</span>
                      <span className="text-sm font-bold text-white mt-1">{profile.position}</span>
                    </div>
                    <div className="bg-[#121c2e] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-amber-500 font-mono uppercase tracking-wider">Instansi Induk</span>
                      <span className="text-sm font-bold text-white mt-1">{profile.workUnit}</span>
                    </div>
                    <div className="bg-[#121c2e] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-amber-500 font-mono uppercase tracking-wider">Pangkat / Golongan</span>
                      <span className="text-sm font-bold text-white mt-1">{profile.rank || "Ahli Madya"}</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* MODULE 2: PROFIL LENGKAP */}
            {isSectionVisible("profil") && (
              <section id="section-profil" className="scroll-mt-[90px] bg-[#0c1322]/85 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white uppercase tracking-wider">Profil & Biodata</h3>
                    <p className="text-xs text-slate-400">Arsip Identitas Kepegawaian & Kualifikasi</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                        <th className="py-2.5 pr-4">Identitas Kunci</th>
                        <th className="py-2.5">Keterangan Resmi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      <tr>
                        <td className="py-3 font-semibold text-slate-300 pr-4">Nama Lengkap</td>
                        <td className="py-3 text-white font-bold">{profile.fullName}</td>
                      </tr>
                      {(profile.birthPlace || profile.birthDate) && (
                        <tr>
                          <td className="py-3 font-semibold text-slate-300 pr-4">Tempat, Tanggal Lahir</td>
                          <td className="py-3 text-white">
                            {profile.birthPlace || ""}{profile.birthPlace && profile.birthDate ? ", " : ""}{profile.birthDate ? formatDate(profile.birthDate) : ""}
                          </td>
                        </tr>
                      )}
                      {profile.nip && (
                        <tr>
                          <td className="py-3 font-semibold text-slate-300 pr-4">Nomor Induk Pegawai (NIP)</td>
                          <td className="py-3 text-white font-mono">{profile.nip}</td>
                        </tr>
                      )}
                      {profile.nuptk && (
                        <tr>
                          <td className="py-3 font-semibold text-slate-300 pr-4">NUPTK</td>
                          <td className="py-3 text-white font-mono">{profile.nuptk}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-3 font-semibold text-slate-300 pr-4">Unit Kerja Utama</td>
                        <td className="py-3 text-white font-bold">{profile.workUnit}</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-semibold text-slate-300 pr-4">Jabatan Struktural</td>
                        <td className="py-3 text-white">{profile.position}</td>
                      </tr>
                      {profile.rank && (
                        <tr>
                          <td className="py-3 font-semibold text-slate-300 pr-4">Pangkat / Golongan Ruang</td>
                          <td className="py-3 text-white">{profile.rank}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* MODULE 3: PENDIDIKAN TIMELINE */}
            {isSectionVisible("pendidikan") && (
              <section id="section-pendidikan" className="scroll-mt-[90px] bg-[#0c1322]/85 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white uppercase tracking-wider">Riwayat Pendidikan</h3>
                    <p className="text-xs text-slate-400">Pendidikan Formal SD sampai Pascasarjana</p>
                  </div>
                </div>

                <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
                  {education.map((edu) => (
                    <div key={edu.id} className="relative">
                      {/* Timeline node dot */}
                      <div className="absolute -left-10 top-1 w-8 h-8 rounded-full border border-amber-500 bg-slate-950 flex items-center justify-center">
                        <span className="text-[10px] font-extrabold text-amber-500 font-mono">{edu.level}</span>
                      </div>

                      <div 
                        onClick={() => edu.fileUrl && handleOpenPreview(edu.fileUrl, edu.institution)}
                        className={`bg-[#121c2e]/60 border p-4 rounded-xl shadow transition-all duration-200 ${
                          edu.fileUrl 
                            ? "border-slate-800/80 hover:border-amber-500/50 hover:bg-[#121c2e]/80 cursor-pointer group" 
                            : "border-slate-800/80"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                          <h4 className="text-sm font-extrabold text-white group-hover:text-amber-400 transition-colors">{edu.institution}</h4>
                          <span className="text-[10px] font-mono text-amber-500 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full mt-1 sm:mt-0 max-w-fit shrink-0">
                            {edu.startYear} - {edu.endYear}
                          </span>
                        </div>
                        {edu.major && (
                          <p className="text-xs font-semibold text-amber-600 mt-1">Jurusan: {edu.major}</p>
                        )}
                        {edu.description && (
                          <p className="text-xs text-slate-400 mt-2 text-justify leading-relaxed">{edu.description}</p>
                        )}
                        {edu.fileUrl && (
                          <div className="mt-3 flex justify-end">
                            <span className="text-amber-500 hover:underline flex items-center space-x-1 text-[11px] font-semibold">
                              <Eye size={12} />
                              <span>Lihat Bukti Kelulusan / Ijazah</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* MODULE 4: KARIER TIMELINE */}
            {isSectionVisible("karier") && (
              <section id="section-karier" className="scroll-mt-[90px] bg-[#0c1322]/85 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white uppercase tracking-wider">Perjalanan Karier</h3>
                    <p className="text-xs text-slate-400">Jejak Langkah Profesional Pendidik</p>
                  </div>
                </div>

                <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
                  {career.map((car) => (
                    <div key={car.id} className="relative">
                      {/* dot node */}
                      <div className="absolute -left-10 top-1 w-8 h-8 rounded-full border border-slate-800 bg-[#121c2e] flex items-center justify-center text-slate-400">
                        <Briefcase size={14} />
                      </div>

                      <div 
                        onClick={() => car.fileUrl && handleOpenPreview(car.fileUrl, car.institution)}
                        className={`bg-[#121c2e]/60 border p-4 rounded-xl shadow transition-all duration-200 ${
                          car.fileUrl 
                            ? "border-slate-800/80 hover:border-amber-500/50 hover:bg-[#121c2e]/80 cursor-pointer group" 
                            : "border-slate-800/80"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                          <div>
                            <h4 className="text-sm font-extrabold text-white group-hover:text-amber-400 transition-colors">{car.position}</h4>
                            <p className="text-xs font-bold text-amber-500/80 mt-0.5">{car.institution}</p>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 font-semibold bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full mt-1 sm:mt-0 max-w-fit shrink-0">
                            {car.startYear} - {car.endYear}
                          </span>
                        </div>
                        {car.description && (
                          <p className="text-xs text-slate-400 mt-2 text-justify leading-relaxed">{car.description}</p>
                        )}
                        {car.fileUrl && (
                          <div className="mt-3 flex justify-end">
                            <span className="text-amber-500 hover:underline flex items-center space-x-1 text-[11px] font-semibold">
                              <Eye size={12} />
                              <span>Lihat Bukti SK / Kontrak</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* MODULE: TUGAS TAMBAHAN */}
            {isSectionVisible("tugasTambahan") && (
              <section id="section-tugasTambahan" className={`scroll-mt-[90px] ${bgCard} rounded-2xl p-6 sm:p-8 shadow-lg`}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
                    <ClipboardList size={20} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-extrabold ${textTitle} uppercase tracking-wider`}>Tugas Tambahan</h3>
                    <p className={`text-xs ${textLabel}`}>Tugas Tambahan & Tanggung Jawab Ekstra Pendidik</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {additionalTasks.map((task) => {
                    const hasLink = !!task.fileUrl;
                    return (
                      <div 
                        key={task.id} 
                        onClick={() => hasLink && handleOpenPreview(task.fileUrl, task.taskName)}
                        className={`${bgCardSecondary} p-5 rounded-2xl border ${
                          hasLink 
                            ? "border-slate-800 hover:border-amber-500/50 hover:bg-[#121c2e]/80 cursor-pointer group" 
                            : "border-slate-800/40"
                        } shadow transition-all duration-200 flex gap-4 items-start`}
                      >
                        <div className={`p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl shrink-0 mt-0.5`}>
                          <ClipboardList size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                            <div>
                              <h4 className={`text-sm font-extrabold ${textTitle} group-hover:text-amber-400 transition-colors`}>{task.taskName}</h4>
                              <p className="text-xs font-bold text-amber-500/80 mt-0.5">{task.institution}</p>
                            </div>
                            <span className={`text-[10px] font-mono ${isDarkMode ? "text-slate-400 bg-slate-800 border-slate-700" : "text-slate-600 bg-slate-200 border-slate-300"} border px-2 py-0.5 rounded-full max-w-fit shrink-0`}>
                              {task.startYear} - {task.endYear}
                            </span>
                          </div>
                          {task.description && (
                            <p className={`text-xs ${textDesc} mt-2 text-justify leading-relaxed`}>{task.description}</p>
                          )}
                          {task.fileUrl && (
                            <div className="mt-3 flex justify-end">
                              <span className="text-amber-500 hover:underline flex items-center space-x-1 text-[11px] font-semibold">
                                <Eye size={12} />
                                <span>Lihat Bukti SK / Tugas</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* MODULE 5: PENGEMBANGAN DIRI */}
            {isSectionVisible("pengembanganDiri") && (
              <section id="section-pengembanganDiri" className="scroll-mt-[90px] bg-[#0c1322]/85 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
                    <FileCheck2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white uppercase tracking-wider">Pengembangan Diri</h3>
                    <p className="text-xs text-slate-400">Workshop, Seminar/Webinar, Diklat, Bimtek, Pelatihan, Sertifikasi & Narasumber</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const sortedEvents = developmentEvents;
                    const frontEvents = sortedEvents.filter(e => e.showOnFront !== false);
                    const displayedEvents = showAllEvents ? sortedEvents : frontEvents;
                    
                    return displayedEvents.map((event) => {
                      const hasLink = !!event.certificateUrl;
                      return (
                        <div 
                          key={event.id} 
                          onClick={() => hasLink && handleOpenPreview(event.certificateUrl, event.title)}
                          className={`bg-[#121c2e]/60 border p-4 rounded-xl flex flex-col justify-between transition-all duration-200 ${
                            hasLink 
                              ? "border-slate-800/80 hover:border-amber-500/50 hover:bg-[#121c2e]/85 cursor-pointer group" 
                              : "border-slate-800/80"
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] font-extrabold font-mono tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded uppercase">
                                {event.type}
                              </span>
                              {event.hours && (
                                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                                  {event.hours} JP
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-bold text-white mt-2.5 line-clamp-2 group-hover:text-amber-400 transition-colors">{event.title}</h4>
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{event.organizer}</p>
                          </div>
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
                            <span>{event.year || (event.date ? event.date.substring(0, 4) : "")}</span>
                            {event.certificateUrl && (
                              <span className="text-amber-500 hover:underline flex items-center space-x-0.5 font-bold">
                                <span>Lihat Sertifikat</span>
                                <ExternalLink size={10} />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {(() => {
                  const hiddenCount = developmentEvents.filter(e => e.showOnFront === false).length;
                  if (hiddenCount === 0) return null;
                  return (
                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={() => setShowAllEvents(!showAllEvents)}
                        className="px-5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 hover:border-amber-500/50 rounded-xl font-bold text-xs transition duration-200 flex items-center space-x-2"
                      >
                        <span>
                          {showAllEvents 
                            ? "Sembunyikan pengembangan diri" 
                            : `Lihat ${hiddenCount} pengembangan diri lainnya`}
                        </span>
                        <ChevronDown size={14} className={`transform transition-transform duration-200 ${showAllEvents ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                  );
                })()}
              </section>
            )}

            {/* MODULE 6: PRESTASI */}
            {isSectionVisible("prestasi") && (
              <section id="section-prestasi" className="scroll-mt-[90px] bg-[#0c1322]/85 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white uppercase tracking-wider">Prestasi & Penghargaan</h3>
                    <p className="text-xs text-slate-400">Pemberian Penghargaan Atas Dedikasi Luar Biasa</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {achievements.map((ach) => {
                    const hasLink = !!ach.certificateUrl;
                    return (
                      <div 
                        key={ach.id} 
                        onClick={() => hasLink && handleOpenPreview(ach.certificateUrl, `${ach.rank} ${ach.title}`)}
                        className={`bg-gradient-to-r from-[#121c2e] to-[#0c1322] border p-5 rounded-xl shadow flex items-start space-x-4 transition-all duration-200 ${
                          hasLink 
                            ? "border-slate-800/80 hover:border-amber-500/50 hover:bg-[#121c2e] cursor-pointer group" 
                            : "border-slate-800/80"
                        }`}
                      >
                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl shrink-0">
                          <Award size={22} className="animate-pulse" />
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                            <h4 className="text-sm font-extrabold text-white group-hover:text-amber-400 transition-colors">{ach.rank} {ach.title}</h4>
                            <span className="text-[9px] font-extrabold font-mono bg-amber-500 text-slate-950 px-2 py-0.5 rounded uppercase self-start sm:self-auto shrink-0">
                              {ach.level}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-amber-500/80 font-mono">{ach.organizer} • {ach.year}</p>
                          {ach.description && (
                            <p className="text-xs text-slate-400 text-justify leading-relaxed">{ach.description}</p>
                          )}
                          {ach.certificateUrl && (
                            <div className="pt-2 flex justify-end">
                              <span className="text-amber-500 hover:underline flex items-center space-x-1 text-[11px] font-semibold">
                                <Eye size={12} />
                                <span>Lihat Bukti Sertifikat</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* MODULE 7: KARYA INOVASI DAN PUBLIKASI */}
            {isSectionVisible("karya") && (
              <section id="section-karya" className="scroll-mt-[90px] bg-[#0c1322]/85 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white uppercase tracking-wider">Karya Inovasi dan Publikasi</h3>
                    <p className="text-xs text-slate-400">Buku, Modul, PTK, Artikel, Ebook, LKPD, Video Pembelajaran, dan Karya Inovasi Guru</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {works.map((work) => {
                    const hasLink = !!work.url;
                    return (
                      <div 
                        key={work.id} 
                        onClick={() => hasLink && handleOpenPreview(work.url, work.title)}
                        className={`bg-[#121c2e]/60 border rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200 ${
                          hasLink 
                            ? "border-slate-800/80 hover:border-amber-500/50 hover:bg-[#121c2e]/80 cursor-pointer group" 
                            : "border-slate-800/80"
                        }`}
                      >
                        <div className="p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-extrabold font-mono bg-amber-500/10 text-amber-500 border border-amber-500/25 px-2 py-0.5 rounded uppercase">
                              {work.type}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">{work.year}</span>
                          </div>
                          <h4 className="text-xs font-extrabold text-white line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">{work.title}</h4>
                          {work.publisher && (
                            <p className="text-[11px] font-medium text-amber-600">{work.publisher}</p>
                          )}
                          {work.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">{work.description}</p>
                          )}
                        </div>
                        
                        {/* Action buttons inside card */}
                        {work.url && (
                          <div className="p-3 bg-slate-900/60 border-t border-slate-800 flex justify-end">
                            <span className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[10px] rounded-lg shadow-md transition flex items-center space-x-1">
                              <span>Buka Karya</span>
                              <ExternalLink size={10} />
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

                  {/* MODULE 12: ORGANISASI & KEPEMIMPINAN */}
            {isSectionVisible("organisasi") && (
              <section id="section-organisasi" className="scroll-mt-[90px] bg-[#0c1322]/85 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white uppercase tracking-wider">Organisasi & Kepemimpinan</h3>
                    <p className="text-xs text-slate-400">Keanggotaan & Peran Aktif Di Komunitas Belajar</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {organizations.map((org) => {
                    const hasLink = !!org.documentUrl;
                    return (
                      <div 
                        key={org.id} 
                        onClick={() => hasLink && handleOpenPreview(org.documentUrl, org.name)}
                        className={`bg-[#121c2e]/60 border p-4 rounded-xl flex items-start space-x-3.5 transition-all duration-200 ${
                          hasLink 
                            ? "border-slate-800/80 hover:border-amber-500/50 hover:bg-[#121c2e]/80 cursor-pointer group" 
                            : "border-slate-800/80"
                        }`}
                      >
                        <div className="p-2 bg-slate-950 border border-slate-800 text-amber-500 rounded-lg shrink-0 mt-0.5">
                          <Globe size={18} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white leading-snug group-hover:text-amber-400 transition-colors">{org.name}</h4>
                          <p className="text-[11px] font-bold text-amber-500/85">{org.role}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{org.startYear} - {org.endYear}</p>
                          {org.documentUrl && (
                            <div className="pt-2">
                              <span className="text-amber-500 hover:underline flex items-center space-x-1 text-[10px] font-semibold">
                                <Eye size={10} />
                                <span>Lihat SK / Dokumen</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* MODULE 13: GALERI KEGIATAN */}
            {isSectionVisible("galeri") && (
              <section id="section-galeri" className="scroll-mt-[90px] bg-[#0c1322]/85 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
                    <Image size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white uppercase tracking-wider">Galeri Dokumentasi</h3>
                    <p className="text-xs text-slate-400">Dokumentasi Aksi Nyata Kegiatan Pembelajaran & Seminar</p>
                  </div>
                </div>

                {/* Filters */}
                {galleryCategories.length > 2 && (
                  <div className="flex flex-wrap gap-1.5 mb-5 pb-3 border-b border-slate-800/80">
                    {galleryCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setGalleryFilter(cat)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wide transition ${galleryFilter === cat ? "bg-amber-500 text-slate-950" : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredGallery.map((item) => (
                    <div key={item.id} className="group bg-[#121c2e]/60 border border-slate-800/80 rounded-xl overflow-hidden shadow">
                      <div 
                        onClick={() => setSelectedGalleryImage(item)}
                        className="relative overflow-hidden aspect-video cursor-pointer"
                        title="Klik untuk melihat ukuran penuh"
                      >
                        <img 
                          src={getDirectImageUrl(item.imageUrl)} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                          <span className="p-2 bg-slate-900/80 text-amber-500 rounded-full border border-amber-500/25 backdrop-blur-sm shadow-lg">
                            <Maximize2 size={16} />
                          </span>
                        </div>
                        <span className="absolute bottom-2 left-2 text-[8px] font-mono font-bold bg-slate-950/80 text-amber-500 px-2 py-0.5 rounded border border-amber-500/10 z-10">
                          {item.category}
                        </span>
                      </div>
                      <div className="p-3.5 space-y-1">
                        <h4 className="text-xs font-bold text-white leading-snug">{item.title}</h4>
                        {item.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
                        )}
                        <span className="text-[9px] text-slate-500 font-mono block pt-1.5">{item.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* MODULE 14: LAIN-LAIN */}
            {isSectionVisible("dokumen") && (() => {
              const combinedLainLain = documents.map(d => ({
                id: d.id,
                name: d.name,
                category: d.category || "Dokumen",
                info: d.description || "",
                date: d.uploadDate,
                fileUrl: d.fileUrl,
                linkType: d.linkType || "Tampilkan di Portfolio (PDF / Dokumen)"
              })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

              return (
                <section id="section-sertifikat" className="scroll-mt-[90px] bg-[#0c1322]/85 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-lg">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-white uppercase tracking-wider">Lain-Lain</h3>
                      <p className="text-xs text-slate-400">Unduhan Berkas Pendukung, SK, dan Sertifikat Lainnya</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {combinedLainLain.map((item) => {
                      const hasLink = !!item.fileUrl;
                      const linkType = item.linkType || "";
                      const isExternal = linkType === "Buka di Tab Baru (Website)" || linkType === "Tautan Langsung (Buka di Tab Baru)";
                      const isWebsiteIframe = linkType === "Tampilkan di Portfolio (Website / Iframe)";
                      return (
                        <div 
                          key={item.id} 
                          onClick={(e) => {
                            if (!hasLink) return;
                            if (isExternal) {
                              window.open(item.fileUrl, '_blank', 'noopener,noreferrer');
                            } else if (isWebsiteIframe) {
                              handleOpenPreview(item.fileUrl, item.name, e, "iframe");
                            } else {
                              handleOpenPreview(item.fileUrl, item.name, e);
                            }
                          }}
                          className={`bg-[#121c2e]/60 border p-4 rounded-xl flex flex-col justify-between transition-all duration-200 ${
                            hasLink 
                              ? "border-slate-800/80 hover:border-amber-500/50 hover:bg-[#121c2e]/85 cursor-pointer group" 
                              : "border-slate-800/80"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold text-amber-500 font-mono uppercase tracking-wider">{item.category}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{formatDate(item.date)}</span>
                            </div>
                            <h5 className="text-xs font-bold text-white mt-1.5 group-hover:text-amber-400 transition-colors">{item.name}</h5>
                            {item.info && (
                              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{item.info}</p>
                            )}
                          </div>
                          {item.fileUrl && (
                            <div className="flex justify-end mt-3 pt-3 border-t border-slate-800/60">
                              <span className="text-amber-500 hover:underline flex items-center space-x-0.5 text-[10px] font-bold">
                                <span>{isExternal ? "Kunjungi Website" : isWebsiteIframe ? "Lihat Website" : "Buka Berkas"}</span>
                                <ExternalLink size={10} />
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })()}



            {/* MODULE 16: CONTACT MESSAGE FORM */}
            {isSectionVisible("kontak") && (
              <section id="section-kontak" className="scroll-mt-[90px] bg-[#0c1322]/85 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white uppercase tracking-wider">Kirim Pesan</h3>
                    <p className="text-xs text-slate-400">Hubungi Saya untuk Sinergi atau Penilaian Praktik Baik</p>
                  </div>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {submitSuccess && (
                    <div className="p-3 text-xs bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg flex items-center space-x-2">
                      <CheckCircle2 size={16} />
                      <span>Pesan Anda telah berhasil terkirim ke database admin. Terima kasih!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-300">Nama Lengkap</label>
                      <input
                        type="text"
                        required
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="Masukkan nama Anda..."
                        className="w-full py-2 px-3 text-xs text-white placeholder-slate-500 bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-300">Email Kontak</label>
                      <input
                        type="email"
                        required
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full py-2 px-3 text-xs text-white placeholder-slate-500 bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300">Subjek</label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Contoh: Seleksi Kepala Sekolah / Undangan Narasumber..."
                      className="w-full py-2 px-3 text-xs text-white placeholder-slate-500 bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300">Konten Pesan</label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ketik detail pesan Anda di sini..."
                      className="w-full py-2 px-3 text-xs text-white placeholder-slate-500 bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus:border-amber-500/50 resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 rounded-lg transition shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? "Mengirim..." : "Kirim Pesan"}
                  </button>
                </form>
              </section>
            )}

          </div>

        </div>

        {/* Footer */}
        <footer className="border-t border-slate-900 pt-8 mt-12 text-center text-xs text-slate-500 relative z-10 pb-8">
          <p>© {new Date().getFullYear()} {profile.fullName} • Hak Cipta Dilindungi.</p>
          <p className="mt-1 text-[10px] text-slate-600 font-mono">Dibuat menggunakan React, Tailwind, & Cloud Firestore.</p>
        </footer>

      </div>

      {/* ARTICLE FULL READING MODAL OVERLAY */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
            <div className="relative p-5 border-b border-slate-800 bg-slate-950/60 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase">
                  {selectedArticle.category}
                </span>
                <span className="text-[10px] font-mono text-slate-400 ml-3">{formatDate(selectedArticle.date)}</span>
              </div>
              <button 
                onClick={() => setSelectedArticle(null)}
                className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-300">
              {selectedArticle.imageUrl && (
                <img 
                  src={getDirectImageUrl(selectedArticle.imageUrl)} 
                  alt={selectedArticle.title} 
                  className="w-full h-56 object-cover rounded-xl border border-slate-800"
                  referrerPolicy="no-referrer"
                />
              )}
              <h3 className="text-base sm:text-lg font-black text-white leading-tight">{selectedArticle.title}</h3>
              <div className="whitespace-pre-wrap text-justify text-slate-300">{selectedArticle.content}</div>
            </div>

            <div className="p-4 bg-slate-950/40 border-t border-slate-800 text-right">
              <button 
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition"
              >
                Tutup Bacaan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PRATINJAU BUKTI DUKUNG (JPG / PDF) */}
      {previewUrl && (() => {
        const detect = getEmbedUrl(previewUrl);
        const type = previewType || detect.type;
        const embedUrl = previewType === "iframe" ? previewUrl : detect.embedUrl;
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[85vh]">
              
              {/* Modal Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex justify-between items-center shrink-0">
                <div className="flex items-center space-x-2 truncate">
                  <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">
                    <Eye size={16} />
                  </div>
                  <div className="truncate text-left">
                    <h4 className="text-xs sm:text-sm font-extrabold text-white truncate leading-snug">{previewTitle}</h4>
                    <span className="text-[10px] text-slate-500 block">
                      Tipe: {type === 'image' ? 'Gambar (JPG/PNG)' : type === 'pdf' ? 'Dokumen PDF' : type === 'iframe' ? 'Dokumen Interaktif' : 'Tautan Eksternal'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1.5">
                  <a 
                    href={previewUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                    title="Buka di Tab Baru"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button 
                    onClick={() => { setPreviewUrl(null); setPreviewTitle(""); setPreviewType(null); }}
                    className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition"
                    title="Tutup"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              {type === 'image' && (
                <div className="flex-1 overflow-auto bg-slate-950 p-6 flex items-center justify-center">
                  <img 
                    src={embedUrl} 
                    alt={previewTitle} 
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
              )}

              {type === 'pdf' && (
                <div className="flex-1 bg-slate-950 relative">
                  <iframe 
                    src={embedUrl} 
                    className="w-full h-full border-0" 
                    title={previewTitle} 
                  />
                </div>
              )}

              {type === 'iframe' && (
                <div className="flex-1 bg-slate-950 relative">
                  <iframe 
                    src={embedUrl} 
                    className="w-full h-full border-0" 
                    title={previewTitle} 
                    allow="autoplay"
                  />
                </div>
              )}

              {type === 'generic' && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 text-center space-y-4">
                  <div className="p-4 bg-slate-800/50 rounded-2xl text-slate-400">
                    <FileText size={48} className="mx-auto" />
                  </div>
                  <h4 className="font-extrabold text-white text-base">Pratinjau Tidak Tersedia</h4>
                  <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                    Format berkas atau tautan ini memerlukan akses langsung di browser atau Google Drive. Silakan klik tombol di bawah untuk membukanya secara langsung.
                  </p>
                  <a 
                    href={previewUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-1.5"
                  >
                    <span>Buka Tautan Eksternal</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}

              {/* Modal Footer */}
              <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-right shrink-0">
                <button 
                  onClick={() => { setPreviewUrl(null); setPreviewTitle(""); }}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition"
                >
                  Tutup Pratinjau
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* MODAL: LIGHTBOX GALERI DOKUMENTASI (UKURAN PENUH TANPA TERPOTONG) */}
      {selectedGalleryImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedGalleryImage(null)}
        >
          <div 
            className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2 truncate">
                <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">
                  <Image size={16} />
                </div>
                <div className="truncate text-left">
                  <h4 className="text-xs sm:text-sm font-extrabold text-white truncate leading-snug">{selectedGalleryImage.title}</h4>
                  <span className="text-[10px] text-slate-500 block">
                    Kategori: {selectedGalleryImage.category} • Tanggal: {selectedGalleryImage.date}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedGalleryImage(null)}
                className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition"
                title="Tutup"
              >
                <X size={14} />
              </button>
            </div>

            {/* Image display - using object-contain to display portrait/landscape fully without cropping */}
            <div className="flex-1 overflow-auto bg-slate-950 p-6 flex flex-col items-center justify-center min-h-[40vh]">
              <img 
                src={getDirectImageUrl(selectedGalleryImage.imageUrl)} 
                alt={selectedGalleryImage.title} 
                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-2xl" 
                referrerPolicy="no-referrer" 
              />
              
              {selectedGalleryImage.description && (
                <div className="mt-4 max-w-2xl text-center bg-slate-900/50 p-3 rounded-lg border border-slate-800/40">
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedGalleryImage.description}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-right shrink-0">
              <button 
                onClick={() => setSelectedGalleryImage(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition"
              >
                Tutup Galeri
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
