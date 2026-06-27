/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Compass, Users, GraduationCap, Briefcase, FileCheck2, Award, 
  BookOpen, BookOpenCheck, TrendingUp, Globe, Image, FileText, 
  Mail, Settings, ShieldAlert, CheckCircle2, Trash2, Edit2, 
  Plus, Search, Download, Upload, LogOut, Check, X, Sun, Moon, Eye, ClipboardList,
  ArrowUp, ArrowDown
} from "lucide-react";
import { PortfolioData, Profile, Education, Career, AdditionalTask, DevelopmentEvent, Achievement, 
  WorkAndPublication, Innovation, BestPractice, StudentImpact, TeacherCompetency, 
  Organization, Gallery, Certificate, Document, Article, WebsiteSettings 
} from "../types";
import { dbService } from "../dbService";
import { formatDate, getDirectImageUrl } from "../utils";

interface AdminDashboardProps {
  onLogout: () => void;
  portfolioData: PortfolioData;
  onRefreshData: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onBackToPreview?: () => void;
}

export default function AdminDashboard({ 
  onLogout, 
  portfolioData, 
  onRefreshData, 
  isDarkMode, 
  onToggleTheme,
  onBackToPreview
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");

  // Statistics
  const [stats, setStats] = useState({ totalViews: 0, todayViews: 0, monthlyViews: 0, downloads: 0 });

  useEffect(() => {
    setStats(dbService.getAnalytics());
  }, []);

  const triggerToast = (text: string, isError: boolean = false) => {
    setStatusMessage({ text, isError });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleBackupExport = () => {
    const backupJson = dbService.exportBackup();
    const blob = new Blob([backupJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `backup_portofolio_guru_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    triggerToast("Backup data berhasil diexport!");
  };

  const handleBackupImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = await dbService.importBackup(content);
      if (success) {
        triggerToast("Data portofolio berhasil direstore/diimport!");
        onRefreshData();
      } else {
        triggerToast("Gagal mengimport file backup. Format JSON tidak sesuai.", true);
      }
    };
    reader.readAsText(file);
  };

  // ----------------------------------------------------
  // SUB-EDITORS FOR DIFFERENT SECTIONS
  // ----------------------------------------------------
  
  // 1. Profile Editor
  const ProfileEditor = () => {
    const [profile, setProfile] = useState<Profile>({ 
      ...portfolioData.profile,
      socials: portfolioData.profile.socials || {}
    });
    const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await dbService.updateProfile(profile);
        onRefreshData();
        triggerToast("Profil berhasil diperbarui!");
      } catch (err) {
        triggerToast("Gagal memperbarui profil.", true);
      }
    };

    return (
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5">
        <h4 className="text-sm font-extrabold uppercase tracking-wider text-amber-500 pb-2 border-b border-slate-800">Edit Profil & Biodata</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold">Nama Lengkap & Gelar</label>
            <input 
              type="text" 
              required
              value={profile.fullName} 
              onChange={e => setProfile({ ...profile, fullName: e.target.value })}
              className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold">Tempat Lahir (Opsional)</label>
            <input 
              type="text" 
              value={profile.birthPlace || ""} 
              onChange={e => setProfile({ ...profile, birthPlace: e.target.value })}
              placeholder="Contoh: Jakarta"
              className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold">Tanggal Lahir (Opsional)</label>
            <input 
              type="date" 
              value={profile.birthDate || ""} 
              onChange={e => setProfile({ ...profile, birthDate: e.target.value })}
              className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold">Gelar & Sertifikasi Singkat (Title)</label>
            <input 
              type="text" 
              required
              value={profile.title} 
              onChange={e => setProfile({ ...profile, title: e.target.value })}
              className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold">Jabatan / Guru Mapel</label>
            <input 
              type="text" 
              required
              value={profile.position} 
              onChange={e => setProfile({ ...profile, position: e.target.value })}
              className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold">Unit Kerja (Sekolah)</label>
            <input 
              type="text" 
              required
              value={profile.workUnit} 
              onChange={e => setProfile({ ...profile, workUnit: e.target.value })}
              className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold">NIP Pegawai</label>
            <input 
              type="text" 
              value={profile.nip} 
              onChange={e => setProfile({ ...profile, nip: e.target.value })}
              className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold">NUPTK</label>
            <input 
              type="text" 
              value={profile.nuptk} 
              onChange={e => setProfile({ ...profile, nuptk: e.target.value })}
              className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold">Pangkat / Golongan</label>
            <input 
              type="text" 
              value={profile.rank} 
              onChange={e => setProfile({ ...profile, rank: e.target.value })}
              placeholder="Contoh: Pembina, IV/a"
              className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold">Email Kontak Resmi</label>
            <input 
              type="email" 
              required
              value={profile.email} 
              onChange={e => setProfile({ ...profile, email: e.target.value })}
              className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold">No. Telp / HP</label>
            <input 
              type="text" 
              required
              value={profile.phone} 
              onChange={e => setProfile({ ...profile, phone: e.target.value })}
              className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold">Foto URL (Unsplash / Google Drive / Foto Profil)</label>
            <div className="flex items-center gap-3">
              {profile.photoUrl && (
                <img 
                  src={getDirectImageUrl(profile.photoUrl)} 
                  alt="Pratinjau Foto" 
                  className="w-12 h-12 object-cover rounded-lg border border-slate-700 shrink-0 bg-slate-950"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=350";
                  }}
                  referrerPolicy="no-referrer"
                />
              )}
              <input 
                type="text" 
                required
                value={profile.photoUrl} 
                onChange={e => setProfile({ ...profile, photoUrl: e.target.value })}
                placeholder="Contoh: /nama-file.jpg atau link Google Drive"
                className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50 text-sm"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              * Tips: Bisa pakai file yang diupload ke folder <strong>public/</strong> (contoh: <code>/foto-saya.jpg</code>) atau link <strong>Google Drive</strong>.
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold">Alamat Lengkap</label>
            <input 
              type="text" 
              required
              value={profile.address || ""} 
              onChange={e => setProfile({ ...profile, address: e.target.value })}
              className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold">Tautan File CV / Portofolio Eksternal (cvUrl)</label>
            <input 
              type="text" 
              value={profile.cvUrl || ""} 
              onChange={e => setProfile({ ...profile, cvUrl: e.target.value })}
              placeholder="https://drive.google.com/..."
              className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
        
        <div className="space-y-1.5 text-xs">
          <label className="text-slate-300 font-bold">Motto Hidup / Slogan Pendidik</label>
          <input 
            type="text" 
            required
            value={profile.motto} 
            onChange={e => setProfile({ ...profile, motto: e.target.value })}
            className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="space-y-1.5 text-xs">
          <label className="text-slate-300 font-bold">Biografi Ringkas</label>
          <textarea 
            rows={3}
            value={profile.bio} 
            onChange={e => setProfile({ ...profile, bio: e.target.value })}
            className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50 resize-none"
          ></textarea>
        </div>

        {/* Social Media Links Section */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h5 className="text-xs font-extrabold uppercase tracking-wider text-amber-500 font-mono">Tautan Media Sosial</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold">Facebook Link</label>
              <input 
                type="text" 
                value={profile.socials?.facebook || ""} 
                onChange={e => setProfile({ 
                  ...profile, 
                  socials: { ...(profile.socials || {}), facebook: e.target.value } 
                })}
                placeholder="https://facebook.com/username"
                className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold">Instagram Link</label>
              <input 
                type="text" 
                value={profile.socials?.instagram || ""} 
                onChange={e => setProfile({ 
                  ...profile, 
                  socials: { ...(profile.socials || {}), instagram: e.target.value } 
                })}
                placeholder="https://instagram.com/username"
                className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold">YouTube Channel Link</label>
              <input 
                type="text" 
                value={profile.socials?.youtube || ""} 
                onChange={e => setProfile({ 
                  ...profile, 
                  socials: { ...(profile.socials || {}), youtube: e.target.value } 
                })}
                placeholder="https://youtube.com/c/channelname"
                className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold">TikTok Profile Link</label>
              <input 
                type="text" 
                value={profile.socials?.tiktok || ""} 
                onChange={e => setProfile({ 
                  ...profile, 
                  socials: { ...(profile.socials || {}), tiktok: e.target.value } 
                })}
                placeholder="https://www.tiktok.com/@username"
                className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-slate-300 font-bold">Twitter / X Link</label>
              <input 
                type="text" 
                value={profile.socials?.twitter || ""} 
                onChange={e => setProfile({ 
                  ...profile, 
                  socials: { ...(profile.socials || {}), twitter: e.target.value } 
                })}
                placeholder="https://twitter.com/username"
                className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button 
            type="submit"
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-lg shadow-md transition"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    );
  };

  // 2. Settings Editor (Website Settings & Visibilities)
  const SettingsEditor = () => {
    const [settings, setSettings] = useState<WebsiteSettings>(() => {
      const initial = { ...portfolioData.settings };
      if (!initial.menuVisibility) {
        initial.menuVisibility = {} as any;
      }
      if (initial.menuVisibility.tugasTambahan === undefined) {
        initial.menuVisibility.tugasTambahan = true;
      }
      if (!initial.pdfVisibility) {
        initial.pdfVisibility = {
          profil: true,
          pendidikan: true,
          karier: true,
          tugasTambahan: true,
          pengembanganDiri: true,
          prestasi: true,
          karya: true,
          inovasi: true,
          bestPractice: true,
          dampakSiswa: true,
          kompetensi: true,
          organisasi: true,
          sertifikat: true,
          dokumen: true
        };
      }
      return initial;
    });

    const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await dbService.updateSettings(settings);
        onRefreshData();
        triggerToast("Pengaturan CMS berhasil diperbarui!");
      } catch (err) {
        triggerToast("Gagal menyimpan pengaturan.", true);
      }
    };

    const toggleMenu = (key: string) => {
      const vis = { ...settings.menuVisibility } as any;
      vis[key] = !vis[key];
      setSettings({ ...settings, menuVisibility: vis });
    };

    const togglePdf = (key: string) => {
      const vis = { ...(settings.pdfVisibility || {}) } as any;
      vis[key] = !vis[key];
      setSettings({ ...settings, pdfVisibility: vis });
    };

     const menuLabels: Record<string, string> = {
      beranda: "Beranda / Banner Utama",
      profil: "Profil & Biodata Lengkap",
      pendidikan: "Riwayat Pendidikan",
      karier: "Pengalaman Karier",
      tugasTambahan: "Tugas Tambahan",
      pengembanganDiri: "Pengembangan Diri / Diklat",
      prestasi: "Prestasi & Penghargaan",
      karya: "Karya Inovasi dan Publikasi",
      bestPractice: "Best Practice STAR",
      dampakSiswa: "Dampak Peserta Didik",
      kompetensi: "Kompetensi Guru",
      organisasi: "Organisasi & Profesi",
      galeri: "Galeri Dokumentasi Foto",
      dokumen: "Lain-Lain",
      artikel: "Artikel & Blog",
      kontak: "Hubungi / Formulir Kontak",
    };

    const pdfLabels: Record<string, string> = {
      profil: "Profil & Bio Profesional",
      pendidikan: "Riwayat Pendidikan",
      karier: "Pengalaman Karier",
      tugasTambahan: "Tugas Tambahan",
      pengembanganDiri: "Pengembangan Diri / Diklat",
      prestasi: "Prestasi & Penghargaan",
      karya: "Karya Inovasi dan Publikasi",
      bestPractice: "Best Practice STAR",
      dampakSiswa: "Dampak Peserta Didik",
      kompetensi: "Kompetensi Guru",
      organisasi: "Organisasi & Keanggotaan",
      dokumen: "Daftar Tautan Lain-Lain",
    };

    return (
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
        <h4 className="text-sm font-extrabold uppercase tracking-wider text-amber-500 pb-2 border-b border-slate-800">Pengaturan Website & SEO</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold">Judul Situs (Site Title)</label>
            <input 
              type="text" 
              required
              value={settings.siteTitle} 
              onChange={e => setSettings({ ...settings, siteTitle: e.target.value })}
              className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold">Meta Title (SEO)</label>
            <input 
              type="text" 
              required
              value={settings.seoTitle} 
              onChange={e => setSettings({ ...settings, seoTitle: e.target.value })}
              className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <label className="text-slate-300 font-bold">Meta Description (SEO)</label>
          <textarea 
            rows={2}
            value={settings.seoDescription} 
            onChange={e => setSettings({ ...settings, seoDescription: e.target.value })}
            className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50 resize-none"
          ></textarea>
        </div>

        {/* Website Visibility Toggles */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block font-mono">Visibilitas Menu Utama (Halaman Website)</span>
          <p className="text-[10px] text-slate-500">Tentukan modul mana saja yang ingin Anda tampilkan secara publik di website (Public View).</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {Object.keys(menuLabels).map((key) => (
              <label key={key} className="flex items-center space-x-2.5 p-2.5 bg-slate-800/40 rounded-xl cursor-pointer hover:bg-slate-800 border border-slate-800/80 transition">
                <input 
                  type="checkbox" 
                  checked={!!(settings.menuVisibility as any)[key]} 
                  onChange={() => toggleMenu(key)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/20 bg-slate-900"
                />
                <span className="font-semibold text-slate-300">{menuLabels[key]}</span>
              </label>
            ))}
          </div>
        </div>

        {/* PDF Printing Visibility Toggles */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block font-mono">Visibilitas Hasil Cetak PDF</span>
          <p className="text-[10px] text-slate-500">Tentukan modul mana saja yang ingin Anda cetak dan tampilkan pada lembar hasil ekspor PDF / Cetak CV.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {Object.keys(pdfLabels).map((key) => (
              <label key={key} className="flex items-center space-x-2.5 p-2.5 bg-slate-800/40 rounded-xl cursor-pointer hover:bg-slate-800 border border-slate-800/80 transition">
                <input 
                  type="checkbox" 
                  checked={settings.pdfVisibility ? !!(settings.pdfVisibility as any)[key] : true} 
                  onChange={() => togglePdf(key)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/20 bg-slate-900"
                />
                <span className="font-semibold text-slate-300">{pdfLabels[key]}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button 
            type="submit"
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-lg shadow-md transition"
          >
            Simpan Konfigurasi
          </button>
        </div>
      </form>
    );
  };

  // 3. Generic Entity CRUD Table Manager
  const ListEntityManager = ({ 
    entityKey, 
    title, 
    fields, 
    blankItem 
  }: { 
    entityKey: keyof Omit<PortfolioData, "profile" | "settings" | "contactMessages">; 
    title: string; 
    fields: { key: string; label: string; type: "text" | "number" | "select" | "textarea" | "checkbox"; options?: string[]; optional?: boolean }[];
    blankItem: any;
  }) => {
    const list = (portfolioData[entityKey] || []) as any[];
    const [editorItem, setEditorItem] = useState<any | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editorItem) return;

      try {
        await dbService.saveListEntity(entityKey, editorItem);
        onRefreshData();
        triggerToast(`Data ${title} berhasil disimpan!`);
        setEditorItem(null);
        setIsAdding(false);
      } catch (err) {
        triggerToast("Gagal menyimpan data.", true);
      }
    };

    const handleDelete = async (id: string) => {
      try {
        await dbService.deleteListEntity(entityKey, id);
        onRefreshData();
        setDeleteConfirmId(null);
        triggerToast("Data berhasil dihapus!");
      } catch (err) {
        triggerToast("Gagal menghapus data.", true);
      }
    };

    const handleMoveUp = async (index: number) => {
      if (index <= 0) return;
      const newList = [...list];
      const temp = newList[index];
      newList[index] = newList[index - 1];
      newList[index - 1] = temp;
      try {
        await dbService.saveFullList(entityKey, newList);
        onRefreshData();
        triggerToast("Urutan berhasil dinaikkan!");
      } catch (err) {
        triggerToast("Gagal mengubah urutan.", true);
      }
    };

    const handleMoveDown = async (index: number) => {
      if (index >= list.length - 1) return;
      const newList = [...list];
      const temp = newList[index];
      newList[index] = newList[index + 1];
      newList[index + 1] = temp;
      try {
        await dbService.saveFullList(entityKey, newList);
        onRefreshData();
        triggerToast("Urutan berhasil diturunkan!");
      } catch (err) {
        triggerToast("Gagal mengubah urutan.", true);
      }
    };

    // Filter list based on search term
    const filteredList = list.filter((item: any) => {
      if (!searchTerm) return true;
      return Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    return (
      <div className="space-y-6">
        {/* Editor Modal / Panel */}
        {editorItem && (
          <form onSubmit={handleSave} className="bg-slate-900 border border-amber-500/20 p-5 rounded-2xl space-y-4 shadow-xl text-left">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-500 pb-2 border-b border-slate-800">
              {isAdding ? `Tambah ${title}` : `Edit ${title}`}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-left">
              {fields.map((f) => {
                const isCheckbox = f.type === "checkbox";
                return (
                  <div key={f.key} className={`space-y-1.5 text-left ${f.type === "textarea" || isCheckbox ? "sm:col-span-2" : ""}`}>
                    {!isCheckbox && (
                      <label className="text-slate-300 font-bold block">
                        {f.label} {f.optional && <span className="text-[10px] text-slate-500 font-normal italic">(Opsional)</span>}
                      </label>
                    )}
                    {f.type === "textarea" ? (
                      <textarea 
                        required={!f.optional}
                        rows={3}
                        value={editorItem[f.key] || ""} 
                        onChange={e => setEditorItem({ ...editorItem, [f.key]: e.target.value })}
                        className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50"
                      />
                    ) : f.type === "checkbox" ? (
                      <label className="flex items-center space-x-3 bg-slate-800/40 p-3 rounded-lg border border-slate-800 cursor-pointer hover:bg-slate-800 transition mt-2">
                        <input 
                          type="checkbox"
                          checked={!!editorItem[f.key]} 
                          onChange={e => setEditorItem({ ...editorItem, [f.key]: e.target.checked })}
                          className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/20 bg-slate-900 h-5 w-5 cursor-pointer shrink-0"
                        />
                        <div className="text-left">
                          <span className="text-slate-200 font-bold block">{f.label}</span>
                          <span className="text-[10px] text-slate-500">Jika diaktifkan, data akan otomatis muncul langsung di halaman utama.</span>
                        </div>
                      </label>
                    ) : (entityKey === "gallery" && f.key === "category") ? (
                      <div className="space-y-2">
                        <select
                          value={(() => {
                            const val = (editorItem[f.key] || "").trim();
                            if (!val) return "";
                            const defaultOpts = ["Mengajar", "Seminar", "Workshop", "Literasi", "Pramuka", "AGP", "Guru Penggerak"];
                            const existingOpts = Array.from(new Set(list.map(item => (item.category || "").trim()).filter(Boolean)));
                            const allOpts = Array.from(new Set([...defaultOpts, ...existingOpts]));
                            const found = allOpts.find(opt => opt.toLowerCase() === val.toLowerCase());
                            return found || "";
                          })()}
                          onChange={e => {
                            if (e.target.value) {
                              setEditorItem({ ...editorItem, [f.key]: e.target.value });
                            }
                          }}
                          className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50 text-xs"
                        >
                          <option value="">-- Pilih Kategori yang Ada --</option>
                          {(() => {
                            const defaultOpts = ["Mengajar", "Seminar", "Workshop", "Literasi", "Pramuka", "AGP", "Guru Penggerak"];
                            const existingOpts = Array.from(new Set(list.map(item => (item.category || "").trim()).filter(Boolean)));
                            return Array.from(new Set([...defaultOpts, ...existingOpts])).map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ));
                          })()}
                        </select>
                        <input 
                          type="text"
                          required={!f.optional}
                          placeholder="Atau ketik kategori baru di sini..."
                          value={editorItem[f.key] || ""} 
                          onChange={e => setEditorItem({ ...editorItem, [f.key]: e.target.value })}
                          className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50 text-xs"
                        />
                      </div>
                    ) : f.type === "select" ? (
                      <select
                        required={!f.optional}
                        value={editorItem[f.key] || ""}
                        onChange={e => setEditorItem({ ...editorItem, [f.key]: e.target.value })}
                        className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50"
                      >
                        <option value="">-- Pilih {f.label} --</option>
                        {f.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input 
                        type={f.type} 
                        required={!f.optional}
                        value={editorItem[f.key] || ""} 
                        onChange={e => {
                          const val = f.type === "number" 
                            ? (e.target.value === "" ? "" : (isNaN(parseFloat(e.target.value)) ? "" : parseFloat(e.target.value))) 
                            : e.target.value;
                          setEditorItem({ ...editorItem, [f.key]: val });
                        }}
                        className="w-full py-2 px-3 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500/50"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end space-x-2 pt-2 text-xs">
              <button 
                type="button"
                onClick={() => { setEditorItem(null); setIsAdding(false); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition"
              >
                Simpan
              </button>
            </div>
          </form>
        )}

        {/* Data List Table */}
        <div className="bg-[#0b1220]/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-white">Kelola Arsip {title}</h4>
            <button
              onClick={() => {
                setEditorItem({ ...blankItem, id: "item_" + Date.now() });
                setIsAdding(true);
              }}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-lg flex items-center space-x-1 self-start sm:self-auto shadow-md transition"
            >
              <Plus size={14} />
              <span>Tambah Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-2.5 pl-3 w-12 text-center">No.</th>
                  <th className="py-2.5">
                    {entityKey === "additionalTasks" ? "Nama Tugas Tambahan" : "Arsip Data"}
                  </th>
                  <th className="py-2.5">Rincian Singkat</th>
                  <th className="py-2.5 text-right pr-3">Prioritas / Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredList.map((item) => {
                  const originalIndex = list.indexOf(item);
                  return (
                    <tr key={item.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3 pl-3 text-center font-mono font-bold text-amber-500/90 text-xs">
                        {originalIndex + 1}
                      </td>
                      <td className="py-3">
                        <span className="font-bold text-white block">
                          {item.taskName || item.title || item.name || item.position || item.level}
                        </span>
                        {item.type && (
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="text-[10px] font-mono text-amber-500 font-bold">{item.type}</span>
                            {item.showOnFront !== undefined && (
                              <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold border ${
                                item.showOnFront 
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                  : "bg-slate-800 text-slate-500 border-slate-700"
                              }`}>
                                {item.showOnFront ? "TAMPIL DI DEPAN" : "DISEMBUNYIKAN"}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 text-slate-400 max-w-sm truncate">
                        {item.organizer || item.institution || item.publisher || item.problem || item.situation || item.description || "-"}
                      </td>
                      <td className="py-3 text-right pr-3">
                        <div className="inline-flex space-x-2 items-center">
                          {/* Reordering priority buttons */}
                          <div className="flex space-x-1 border-r border-slate-800/60 pr-2 mr-1">
                            <button
                              type="button"
                              disabled={originalIndex === 0 || !!searchTerm}
                              onClick={() => handleMoveUp(originalIndex)}
                              className={`p-1 rounded transition ${
                                originalIndex === 0 || !!searchTerm
                                  ? "text-slate-600 cursor-not-allowed opacity-30" 
                                  : "bg-slate-800/60 hover:bg-slate-800 text-amber-500 hover:text-amber-400"
                              }`}
                              title={!!searchTerm ? "Bersihkan pencarian untuk mengurutkan" : "Geser ke Atas (Prioritas Utama)"}
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              type="button"
                              disabled={originalIndex === list.length - 1 || !!searchTerm}
                              onClick={() => handleMoveDown(originalIndex)}
                              className={`p-1 rounded transition ${
                                originalIndex === list.length - 1 || !!searchTerm
                                  ? "text-slate-600 cursor-not-allowed opacity-30" 
                                  : "bg-slate-800/60 hover:bg-slate-800 text-amber-500 hover:text-amber-400"
                              }`}
                              title={!!searchTerm ? "Bersihkan pencarian untuk mengurutkan" : "Geser ke Bawah (Prioritas Akhir)"}
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>

                          <button
                            onClick={() => { setEditorItem(item); setIsAdding(false); }}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={12} />
                          </button>
                          {deleteConfirmId === item.id ? (
                            <div className="inline-flex items-center space-x-1 animate-pulse">
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] rounded transition-all"
                                title="Konfirmasi Hapus"
                              >
                                Yakin?
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="p-1 bg-slate-800 text-slate-400 hover:text-white rounded"
                                title="Batal"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setDeleteConfirmId(item.id);
                                setTimeout(() => setDeleteConfirmId(prev => prev === item.id ? null : prev), 4000);
                              }}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                              title="Hapus"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      Tidak ada arsip data {title} ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Inbox Reader
  const InboxMessagesManager = () => {
    const list = portfolioData.contactMessages || [];
    const [msgConfirmId, setMsgConfirmId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
      try {
        await dbService.deleteListEntity("contactMessages", id);
        onRefreshData();
        setMsgConfirmId(null);
        triggerToast("Pesan berhasil dihapus.");
      } catch (e) {
        triggerToast("Gagal menghapus.", true);
      }
    };

    return (
      <div className="bg-[#0b1220]/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h4 className="text-sm font-extrabold uppercase tracking-wider text-white">Hubungi Saya (Pesan Masuk)</h4>
        
        <div className="space-y-4 text-xs">
          {list.map((msg) => (
            <div key={msg.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 relative text-left">
              {msgConfirmId === msg.id ? (
                <div className="absolute top-4 right-4 flex items-center space-x-1 bg-slate-950 p-1 rounded border border-red-500/30">
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[9px] rounded transition"
                  >
                    Hapus
                  </button>
                  <button
                    onClick={() => setMsgConfirmId(null)}
                    className="p-0.5 text-slate-400 hover:text-white"
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMsgConfirmId(msg.id);
                    setTimeout(() => setMsgConfirmId(prev => prev === msg.id ? null : prev), 3000);
                  }}
                  className="absolute top-4 right-4 p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition"
                  title="Hapus"
                >
                  <Trash2 size={12} />
                </button>
              )}
              <div className="flex justify-between items-start pr-8">
                <div>
                  <h5 className="font-bold text-white text-sm">{msg.subject}</h5>
                  <p className="text-slate-400 font-medium mt-0.5">{msg.name} ({msg.email})</p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{formatDate(msg.date)}</span>
              </div>
              <p className="text-slate-300 leading-relaxed pt-1 whitespace-pre-wrap">{msg.message}</p>
            </div>
          ))}

          {list.length === 0 && (
            <p className="py-6 text-center text-slate-500">Tidak ada pesan masuk dari pengunjung.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen font-sans p-4 sm:p-6 lg:p-8 transition-colors duration-200 ${isDarkMode ? "bg-[#070d19] text-slate-100" : "bg-slate-50 text-slate-800"}`}>
      
      {/* Toast Alert */}
      {statusMessage && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center space-x-3 text-xs border ${statusMessage.isError ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-green-500/10 border-green-500/30 text-green-400"}`}>
          {statusMessage.isError ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Admin Layout Grid */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header bar */}
        <div className={`flex flex-col sm:flex-row justify-between sm:items-center p-5 rounded-2xl gap-4 border transition-colors ${isDarkMode ? "bg-[#0b1220] border-slate-800/80 text-white" : "bg-white border-slate-200 text-slate-800 shadow-sm"}`}>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
              <Settings size={20} className="animate-spin-slow" />
            </div>
            <div>
              <h2 className={`text-lg font-black ${isDarkMode ? "text-white" : "text-slate-900"}`}>Dashboard CMS Pendidik</h2>
              <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Kelola konten, kelola arsip, dan backup portfolio Anda secara instan</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-lg border transition ${isDarkMode ? "bg-slate-850 border-slate-700 text-amber-500 hover:text-amber-400" : "bg-slate-100 border-slate-200 text-amber-650 hover:bg-slate-200"}`}
              title={isDarkMode ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            {onBackToPreview && (
              <button
                onClick={onBackToPreview}
                className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center space-x-1 border transition duration-150 ${
                  isDarkMode 
                    ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white" 
                    : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                }`}
                title="Kembali ke halaman portofolio tanpa logout"
              >
                <Eye size={14} />
                <span>Lihat Preview</span>
              </button>
            )}
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 text-xs font-semibold rounded-lg flex items-center space-x-1 transition duration-150"
            >
              <LogOut size={14} />
              <span>Keluar CMS</span>
            </button>
          </div>
        </div>

        {/* Analytics row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="block text-[9px] font-bold text-slate-500 uppercase font-mono">Total Kunjungan</span>
            <span className="text-2xl font-black text-white font-mono block mt-1">{stats.totalViews}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="block text-[9px] font-bold text-slate-500 uppercase font-mono">Kunjungan Hari Ini</span>
            <span className="text-2xl font-black text-amber-500 font-mono block mt-1">{stats.todayViews}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="block text-[9px] font-bold text-slate-500 uppercase font-mono">Bulan Ini</span>
            <span className="text-2xl font-black text-white font-mono block mt-1">{stats.monthlyViews}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="block text-[9px] font-bold text-slate-500 uppercase font-mono">CV Diunduh</span>
            <span className="text-2xl font-black text-white font-mono block mt-1">{stats.downloads}</span>
          </div>
        </div>

        {/* Split Grid for Admin Tabs (Left: Sidebar, Right: Area) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider px-3 mb-2 font-mono">Menu CMS</span>
            
            {[
              { id: "dashboard", label: "Dashboard Ringkas", icon: Compass },
              { id: "profile", label: "Profil & Biodata", icon: Users },
              { id: "education", label: "Pendidikan", icon: GraduationCap },
              { id: "career", label: "Arsip Karier", icon: Briefcase },
              { id: "additionalTasks", label: "Tugas Tambahan", icon: ClipboardList },
              { id: "development", label: "Pengembangan Diri", icon: FileCheck2 },
              { id: "achievements", label: "Prestasi", icon: Award },
              { id: "works", label: "Karya Inovasi dan Publikasi", icon: BookOpen },
              { id: "bestPractices", label: "Best Practice STAR", icon: BookOpenCheck },
              { id: "studentImpact", label: "Dampak Siswa", icon: TrendingUp },
              { id: "organization", label: "Organisasi", icon: Globe },
              { id: "gallery", label: "Galeri Foto", icon: Image },
              { id: "documents", label: "Lain-Lain", icon: FileText },
              { id: "articles", label: "Artikel / Blog", icon: BookOpen },
              { id: "inbox", label: "Pesan Masuk", icon: Mail },
              { id: "settings", label: "Pengaturan Website", icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchTerm(""); }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold rounded-lg transition ${activeTab === tab.id ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}
              >
                <tab.icon size={14} className={activeTab === tab.id ? "text-amber-500" : "text-slate-500"} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Main Content Workspace */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Standard Search Bar (Not shown in dashboard/settings/profile) */}
            {["education", "career", "additionalTasks", "development", "achievements", "works", "innovations", "bestPractices", "studentImpact", "organization", "gallery", "documents", "articles"].includes(activeTab) && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Search size={14} />
                </div>
                <input
                  type="text"
                  placeholder="Cari arsip data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2.5 pl-9 pr-4 text-xs text-white placeholder-slate-500 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-amber-500/50 shadow-md"
                />
              </div>
            )}

            {/* TAB CONTENT: DASHBOARD HOME */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-amber-500 pb-1 border-b border-slate-800">Manajemen Database & Backup</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Arsip data tersimpan secara lokal dan sinkron secara real-time ke Cloud Firestore jika terhubung. Lakukan ekspor/cadangan berkala untuk mengamankan portofolio Anda.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                    <button
                      onClick={handleBackupExport}
                      className="p-4 bg-slate-800/40 hover:bg-slate-800 rounded-xl border border-slate-800 transition flex items-center space-x-3"
                    >
                      <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg">
                        <Download size={16} />
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-white block">Download Backup JSON</span>
                        <span className="text-[10px] text-slate-500">Export semua arsip portofolio sekali klik</span>
                      </div>
                    </button>

                    <label className="p-4 bg-slate-800/40 hover:bg-slate-800 rounded-xl border border-slate-800 transition flex items-center space-x-3 cursor-pointer">
                      <input 
                        type="file" 
                        accept=".json" 
                        onChange={handleBackupImport}
                        className="hidden" 
                      />
                      <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-450 rounded-lg">
                        <Upload size={16} />
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-white block">Restore / Import JSON</span>
                        <span className="text-[10px] text-slate-500">Muat berkas backup yang tersimpan</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Guidelines */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">Panduan Ringkas Penggunaan CMS</h4>
                  <ul className="space-y-2 text-xs text-slate-400 list-disc list-inside">
                    <li>Edit data biografi Anda di tab <strong className="text-white">Profil & Biodata</strong> untuk memperbarui halaman depan.</li>
                    <li>Sistem otomatis menyembunyikan menu/tab di halaman publik jika tidak ada data (<strong className="text-amber-500">Auto-Hide Rule</strong>).</li>
                    <li>Untuk merender CV yang rapi, buka web dan pilih tombol <strong className="text-white">Cetak CV</strong> untuk dialog cetak browser (Save as PDF).</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PROFILE EDITOR */}
            {activeTab === "profile" && <ProfileEditor />}

            {/* TAB CONTENT: SETTINGS EDITOR */}
            {activeTab === "settings" && <SettingsEditor />}

            {/* TAB CONTENT: PENDIDIKAN */}
            {activeTab === "education" && (
              <ListEntityManager
                entityKey="education"
                title="Pendidikan"
                blankItem={{ level: "S1", institution: "", major: "", startYear: "2020", endYear: "2024", description: "", fileUrl: "" }}
                fields={[
                  { key: "level", label: "Tingkatan", type: "select", options: ["SD", "SMP", "SMA", "S1", "S2", "S3", "PPG"] },
                  { key: "institution", label: "Nama Sekolah / Universitas", type: "text" },
                  { key: "major", label: "Jurusan / Program Studi", type: "text", optional: true },
                  { key: "startYear", label: "Tahun Masuk", type: "text" },
                  { key: "endYear", label: "Tahun Lulus", type: "text" },
                  { key: "description", label: "Keterangan Tambahan", type: "textarea", optional: true },
                  { key: "fileUrl", label: "Tautan Bukti Kelulusan / Ijazah (Opsional)", type: "text", optional: true }
                ]}
              />
            )}

            {/* TAB CONTENT: KARIER */}
            {activeTab === "career" && (
              <ListEntityManager
                entityKey="career"
                title="Karier"
                blankItem={{ position: "", institution: "", startYear: "2020", endYear: "Sekarang", description: "", fileUrl: "" }}
                fields={[
                  { key: "position", label: "Jabatan Pekerjaan", type: "text" },
                  { key: "institution", label: "Nama Instansi / Sekolah", type: "text" },
                  { key: "startYear", label: "Tahun Mulai", type: "text" },
                  { key: "endYear", label: "Tahun Selesai / Sekarang", type: "text" },
                  { key: "description", label: "Keterangan Tugas / Kontribusi (Opsional)", type: "textarea", optional: true },
                  { key: "fileUrl", label: "Tautan Bukti SK / Kontrak Kerja (Opsional)", type: "text", optional: true }
                ]}
              />
            )}

            {/* TAB CONTENT: TUGAS TAMBAHAN */}
            {activeTab === "additionalTasks" && (
              <ListEntityManager
                entityKey="additionalTasks"
                title="Tugas Tambahan"
                blankItem={{ taskName: "", institution: "", startYear: "2020", endYear: "Sekarang", description: "", fileUrl: "" }}
                fields={[
                  { key: "taskName", label: "Nama Tugas Tambahan (Misal: Kepala Perpustakaan, Wali Kelas, Pembina OSIS)", type: "text" },
                  { key: "institution", label: "Nama Instansi / Sekolah", type: "text" },
                  { key: "startYear", label: "Tahun Mulai", type: "text" },
                  { key: "endYear", label: "Tahun Selesai / Sekarang", type: "text" },
                  { key: "description", label: "Keterangan Tugas / Tanggung Jawab (Opsional)", type: "textarea", optional: true },
                  { key: "fileUrl", label: "Tautan Bukti SK / Tugas (Opsional)", type: "text", optional: true }
                ]}
              />
            )}

            {/* TAB CONTENT: PENGEMBANGAN DIRI */}
            {activeTab === "development" && (
              <ListEntityManager
                entityKey="developmentEvents"
                title="Pengembangan Diri"
                blankItem={{ type: "Workshop", title: "", organizer: "", year: new Date().getFullYear().toString(), hours: 32, certificateUrl: "", showOnFront: true }}
                fields={[
                  { key: "type", label: "Kategori Kegiatan", type: "select", options: ["Workshop", "Seminar/Webinar", "Diklat", "Bimtek", "Pelatihan", "Sertifikasi", "Narasumber"] },
                  { key: "title", label: "Nama Seminar / Pelatihan", type: "text" },
                  { key: "organizer", label: "Penyelenggara Resmi", type: "text" },
                  { key: "year", label: "Tahun Pelaksanaan", type: "text" },
                  { key: "hours", label: "Jumlah Jam Pelajaran (JP) (Opsional)", type: "number", optional: true },
                  { key: "certificateUrl", label: "Tautan File Sertifikat (Opsional)", type: "text", optional: true },
                  { key: "showOnFront", label: "Tampilkan di Halaman Utama", type: "checkbox", optional: true }
                ]}
              />
            )}

            {/* TAB CONTENT: PRESTASI */}
            {activeTab === "achievements" && (
              <ListEntityManager
                entityKey="achievements"
                title="Prestasi & Penghargaan"
                blankItem={{ title: "", rank: "Juara 1", level: "Kabupaten", year: "2024", organizer: "", description: "", certificateUrl: "" }}
                fields={[
                  { key: "title", label: "Nama Prestasi / Bidang Lomba", type: "text" },
                  { key: "rank", label: "Peringkat / Juara", type: "text" },
                  { key: "level", label: "Tingkat Prestasi", type: "select", options: ["Sekolah", "Kecamatan", "Kabupaten", "Provinsi", "Nasional", "Internasional"] },
                  { key: "year", label: "Tahun Penghargaan", type: "text" },
                  { key: "organizer", label: "Lembaga Penyelenggara", type: "text" },
                  { key: "description", label: "Detail Penjelasan Prestasi (Opsional)", type: "textarea", optional: true },
                  { key: "certificateUrl", label: "Tautan Bukti Sertifikat / Penghargaan (Opsional)", type: "text", optional: true }
                ]}
              />
            )}

            {/* TAB CONTENT: KARYA INOVASI DAN PUBLIKASI */}
            {activeTab === "works" && (
              <ListEntityManager
                entityKey="works"
                title="Karya Inovasi dan Publikasi"
                blankItem={{ type: "Buku", title: "", year: "2024", publisher: "", url: "", description: "" }}
                fields={[
                  { key: "type", label: "Jenis Karya", type: "select", options: ["Karya Inovasi", "Modul Ajar", "LKPD", "PTK", "Artikel", "Ebook", "Buku", "Media Pembelajaran", "Video Pembelajaran", "Best Practice"] },
                  { key: "title", label: "Judul Karya Inovasi / Publikasi", type: "text" },
                  { key: "year", label: "Tahun Terbit", type: "text" },
                  { key: "publisher", label: "Penerbit / Media Publikasi (Opsional)", type: "text", optional: true },
                  { key: "url", label: "Tautan/Link Karya (Opsional)", type: "text", optional: true },
                  { key: "description", label: "Ringkasan Singkat Karya (Opsional)", type: "textarea", optional: true }
                ]}
              />
            )}

            {/* TAB CONTENT: BEST PRACTICE STAR */}
            {activeTab === "bestPractices" && (
              <ListEntityManager
                entityKey="bestPractices"
                title="Best Practice STAR"
                blankItem={{ title: "", situation: "", challenge: "", action: "", reflection: "", impact: "", pdfUrl: "", videoUrl: "" }}
                fields={[
                  { key: "title", label: "Judul Praktik Baik", type: "text" },
                  { key: "situation", label: "Situation (Situasi)", type: "textarea" },
                  { key: "challenge", label: "Challenge (Tantangan)", type: "textarea" },
                  { key: "action", label: "Action (Aksi Nyata)", type: "textarea" },
                  { key: "reflection", label: "Reflection (Refleksi)", type: "textarea" },
                  { key: "impact", label: "Dampak / Hasil Akhir", type: "textarea" },
                  { key: "pdfUrl", label: "Tautan Bukti Dokumen STAR (Opsional)", type: "text", optional: true },
                  { key: "videoUrl", label: "Tautan Bukti Video Presentasi / Praktik (Opsional)", type: "text", optional: true }
                ]}
              />
            )}

            {/* TAB CONTENT: DAMPAK SISWA */}
            {activeTab === "studentImpact" && (
              <ListEntityManager
                entityKey="studentImpacts"
                title="Dampak Peserta Didik"
                blankItem={{ title: "", initialCondition: "", intervention: "", finalCondition: "", fileUrl: "" }}
                fields={[
                  { key: "title", label: "Judul Pembanding", type: "text" },
                  { key: "initialCondition", label: "Kondisi Awal (Sebelum)", type: "textarea" },
                  { key: "intervention", label: "Intervensi / Metode Guru", type: "textarea" },
                  { key: "finalCondition", label: "Kondisi Akhir (Sesudah)", type: "textarea" },
                  { key: "fileUrl", label: "Tautan Bukti Laporan Analisis Dampak / Nilai (Opsional)", type: "text", optional: true }
                ]}
              />
            )}

            {/* TAB CONTENT: ORGANISASI */}
            {activeTab === "organization" && (
              <ListEntityManager
                entityKey="organizations"
                title="Organisasi"
                blankItem={{ name: "", role: "", startYear: "2020", endYear: "Sekarang", documentUrl: "" }}
                fields={[
                  { key: "name", label: "Nama Organisasi Profesi / Komunitas", type: "text" },
                  { key: "role", label: "Peran / Jabatan", type: "text" },
                  { key: "startYear", label: "Tahun Mulai", type: "text" },
                  { key: "endYear", label: "Tahun Selesai / Sekarang", type: "text" },
                  { key: "documentUrl", label: "Tautan Bukti Dokumen SK / Sertifikat (Opsional)", type: "text", optional: true }
                ]}
              />
            )}

            {/* TAB CONTENT: GALERI FOTO */}
            {activeTab === "gallery" && (
              <ListEntityManager
                entityKey="gallery"
                title="Galeri Dokumentasi"
                blankItem={{ category: "Mengajar", title: "", description: "", imageUrl: "", date: new Date().toISOString().split("T")[0] }}
                fields={[
                  { key: "category", label: "Kategori Galeri", type: "select", options: ["Mengajar", "Seminar", "Workshop", "Literasi", "Pramuka", "AGP", "Guru Penggerak"] },
                  { key: "title", label: "Judul Foto / Kegiatan", type: "text" },
                  { key: "imageUrl", label: "Link URL Foto", type: "text" },
                  { key: "date", label: "Tanggal Pengambilan", type: "text" },
                  { key: "description", label: "Keterangan Foto (Opsional)", type: "textarea" }
                ]}
              />
            )}

            {/* TAB CONTENT: LAIN-LAIN */}
            {activeTab === "documents" && (
              <ListEntityManager
                entityKey="documents"
                title="Lain-Lain"
                blankItem={{ name: "", category: "Sertifikat", description: "", fileUrl: "", uploadDate: new Date().toISOString().split("T")[0], linkType: "Tampilkan di Portfolio (PDF / Dokumen)" }}
                fields={[
                  { key: "name", label: "Nama Berkas / Sertifikat / Tautan", type: "text" },
                  { key: "category", label: "Kategori (Contoh: Sertifikat, SK, Dokumen, Hasil Karya)", type: "text" },
                  { key: "linkType", label: "Jenis Tautan", type: "select", options: ["Tampilkan di Portfolio (PDF / Dokumen)", "Tampilkan di Portfolio (Website / Iframe)", "Buka di Tab Baru (Website)"] },
                  { key: "fileUrl", label: "Tautan URL (PDF / Google Drive / Website)", type: "text" },
                  { key: "description", label: "Keterangan / Nomor SK / Penerbit (Opsional)", type: "textarea", optional: true },
                  { key: "uploadDate", label: "Tanggal Terbit / Unggah", type: "text" }
                ]}
              />
            )}

            {/* TAB CONTENT: ARTIKEL */}
            {activeTab === "articles" && (
              <ListEntityManager
                entityKey="articles"
                title="Artikel & Blog"
                blankItem={{ title: "", slug: "", content: "", category: "Inovasi", date: new Date().toISOString().split("T")[0], isVisible: true }}
                fields={[
                  { key: "title", label: "Judul Artikel", type: "text" },
                  { key: "category", label: "Kategori Tulisan", type: "text" },
                  { key: "content", label: "Konten Artikel (Teks Lengkap)", type: "textarea" }
                ]}
              />
            )}

            {/* TAB CONTENT: INBOX */}
            {activeTab === "inbox" && <InboxMessagesManager />}

          </div>

        </div>

      </div>

    </div>
  );
}
