/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { PortfolioData } from "../types";
import { FileText, Award, Calendar, GraduationCap, Briefcase, Mail, Phone, MapPin, BookOpen, Settings, Download, Printer } from "lucide-react";
import { formatDate } from "../utils";

interface PrintPreviewProps {
  data: PortfolioData;
  onClose: () => void;
  printType: "cv" | "full";
}

export default function PrintPreview({ data, onClose, printType }: PrintPreviewProps) {
  const { profile, education, career, additionalTasks = [], developmentEvents, achievements, works, innovations, organizations } = data;

  const isIframe = React.useMemo(() => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }, []);

  React.useEffect(() => {
    // Automatically trigger print on load only if NOT in an iframe
    if (!isIframe) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isIframe]);

  const handleAction = () => {
    if (isIframe) {
      window.open(window.location.origin + "?print=" + printType, "_blank");
    } else {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-900 print:p-0 print:bg-white">
      {isIframe && (
        <div className="max-w-4xl mx-auto mb-6 bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden animate-fade-in shadow-sm">
          <div className="text-left space-y-1">
            <h4 className="font-bold text-amber-800 flex items-center gap-1.5 text-sm">
              <span>⚠️</span> Batasan Pratinjau Editor (Iframe Detected)
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              Browser memblokir pencetakan langsung dari dalam frame editor. Klik tombol di kanan untuk membuka halaman ini di Tab Baru agar Anda dapat langsung Menyimpan sebagai PDF atau Mencetak portofolio secara resmi.
            </p>
          </div>
          <button
            onClick={() => window.open(window.location.origin + "?print=" + printType, "_blank")}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-md transition duration-150 shrink-0 uppercase tracking-wider"
          >
            Buka di Tab Baru untuk PDF/Cetak
          </button>
        </div>
      )}

      {/* Back button for screen viewing */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center bg-slate-100 p-4 rounded-lg border border-slate-200 print:hidden">
        <div className="flex items-center space-x-2">
          <FileText className="text-amber-600" />
          <div className="text-left">
            <h4 className="font-bold text-slate-800">Pratinjau Cetak {printType === "cv" ? "CV Digital" : "Portofolio Lengkap"}</h4>
            <p className="text-xs text-slate-500">
              {isIframe 
                ? "Buka di tab baru terlebih dahulu untuk mencetak/menyimpan PDF secara penuh." 
                : "Dialog pencetakan browser otomatis muncul. Atur orientasi ke Portret, ukuran kertas A4, dan centang 'Cetak background' (Background graphics) agar tata letak warna presisi."}
            </p>
          </div>
        </div>
        <div className="flex space-x-3 shrink-0">
          <button
            onClick={handleAction}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow transition flex items-center space-x-1.5"
            title="Gunakan dialog cetak browser lalu pilih opsi 'Simpan sebagai PDF' (Save as PDF)"
          >
            <Download size={13} />
            <span>Simpan / Download PDF</span>
          </button>
          <button
            onClick={handleAction}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow transition flex items-center space-x-1.5"
          >
            <Printer size={13} />
            <span>Cetak Ulang</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
          >
            Kembali ke Web
          </button>
        </div>
      </div>

      {/* A4 Sheet Container */}
      <div className="max-w-4xl mx-auto border border-slate-200 p-8 shadow-md rounded bg-white print:border-0 print:p-0 print:shadow-none">
        
        {/* CV Header */}
        <div className="border-b-4 border-slate-900 pb-6 mb-6 flex justify-between items-start gap-4">
          <div className="flex items-start space-x-4">
            {profile.photoUrl && (
              <img
                src={profile.photoUrl}
                alt={profile.fullName}
                className="w-24 h-24 object-cover rounded-xl border border-slate-300 shadow-sm shrink-0"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="space-y-2 max-w-xl">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{profile.fullName}</h1>
              <p className="text-base sm:text-lg font-bold text-amber-700">{profile.title}</p>
              <p className="text-xs sm:text-sm font-medium text-slate-600">{profile.position} | {profile.workUnit}</p>
              <p className="text-xs italic text-slate-500">"{profile.motto}"</p>
            </div>
          </div>
          
          <div className="text-right text-xs space-y-1 text-slate-600 border-l border-slate-200 pl-6 shrink-0">
            <p className="flex items-center justify-end"><Mail size={12} className="mr-1.5" /> {profile.email}</p>
            <p className="flex items-center justify-end"><Phone size={12} className="mr-1.5" /> {profile.phone}</p>
            <p className="flex items-center justify-end"><MapPin size={12} className="mr-1.5" /> {profile.address || "Jakarta, Indonesia"}</p>
            <p className="font-mono mt-2">NIP: {profile.nip || "-"}</p>
            <p className="font-mono">Gol: {profile.rank || "-"}</p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mb-6">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">Profil Profesional</h2>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">{profile.bio}</p>
        </div>

        {/* Grid for Education & Career */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          
          {/* Education Section */}
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">Riwayat Pendidikan</h2>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="relative pl-3 border-l-2 border-slate-300">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xs font-bold text-slate-900">{edu.level} - {edu.institution}</h3>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">{edu.startYear}-{edu.endYear}</span>
                  </div>
                  {edu.major && <p className="text-[10px] text-slate-600 font-medium">Jurusan: {edu.major}</p>}
                  {edu.description && <p className="text-[9px] text-slate-500 mt-0.5">{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Career Section */}
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">Pengalaman Karier</h2>
            <div className="space-y-3">
              {career.map((car) => (
                <div key={car.id} className="relative pl-3 border-l-2 border-slate-300">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xs font-bold text-slate-900">{car.position}</h3>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">{car.startYear}-{car.endYear}</span>
                  </div>
                  <p className="text-[10px] font-medium text-amber-700">{car.institution}</p>
                  {car.description && <p className="text-[9px] text-slate-500 mt-0.5">{car.description}</p>}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Tugas Tambahan Section (2 Kolom, Tepat di Atas Prestasi & Penghargaan) */}
        {additionalTasks && additionalTasks.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">Riwayat Tugas Tambahan</h2>
            <div className="grid grid-cols-2 gap-4">
              {additionalTasks.map((task) => (
                <div key={task.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900">{task.taskName}</span>
                    <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded uppercase shrink-0">{task.startYear} - {task.endYear}</span>
                  </div>
                  <p className="text-[10px] font-medium text-amber-700 mt-0.5">{task.institution}</p>
                  {task.description && <p className="text-[9px] text-slate-500 mt-1">{task.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements Section */}
        {achievements.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">Prestasi & Penghargaan</h2>
            <div className="grid grid-cols-2 gap-4">
              {achievements.map((ach) => (
                <div key={ach.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900">{ach.rank} {ach.title}</span>
                    <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded uppercase">{ach.level}</span>
                  </div>
                  <p className="text-[10px] font-medium text-slate-600 mt-0.5">{ach.organizer} ({ach.year})</p>
                  {ach.description && <p className="text-[9px] text-slate-500 mt-1">{ach.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Development & Workshop Events */}
        {developmentEvents.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">Pengembangan Kompetensi / Diklat</h2>
            <div className="space-y-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[9px] font-bold border-b border-slate-300">
                    <th className="py-1.5 px-2">Kategori</th>
                    <th className="py-1.5 px-2">Nama Program / Seminar</th>
                    <th className="py-1.5 px-2">Penyelenggara</th>
                    <th className="py-1.5 px-2 font-mono">Tgl</th>
                    <th className="py-1.5 px-2 text-right">Durasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {developmentEvents.map((event) => (
                    <tr key={event.id} className="text-[10px] text-slate-700">
                      <td className="py-1.5 px-2 font-bold text-slate-900">{event.type}</td>
                      <td className="py-1.5 px-2 font-medium">{event.title}</td>
                      <td className="py-1.5 px-2 text-slate-500">{event.organizer}</td>
                      <td className="py-1.5 px-2 font-mono text-slate-500">{formatDate(event.date)}</td>
                      <td className="py-1.5 px-2 text-right font-semibold">{event.hours ? `${event.hours} JP` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Works & Publications */}
        {works.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">Karya & Publikasi Ilmiah</h2>
            <ul className="space-y-2">
              {works.map((work) => (
                <li key={work.id} className="text-xs list-disc list-inside text-slate-800">
                  <span className="font-bold">[{work.type}]</span> <span className="italic font-medium">"{work.title}"</span> — {work.publisher || "Publikasi Mandiri"}, {work.year}
                  {work.description && <p className="text-[10px] text-slate-500 pl-4 mt-0.5">{work.description}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Innovations / Best Practices if full Portfolio is requested */}
        {printType === "full" && innovations.length > 0 && (
          <div className="page-break-before mt-8">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">Dokumentasi Inovasi Unggulan</h2>
            {innovations.map((inn) => (
              <div key={inn.id} className="space-y-2 text-xs text-slate-700 leading-relaxed mb-6">
                <h3 className="font-bold text-sm text-slate-900">{inn.name}</h3>
                <p><span className="font-semibold text-slate-900">Latar Belakang:</span> {inn.background}</p>
                <p><span className="font-semibold text-slate-900">Permasalahan:</span> {inn.problem}</p>
                <p><span className="font-semibold text-slate-900">Solusi & Sintaks:</span> {inn.solution}</p>
                <ul className="list-decimal list-inside pl-2 space-y-1 mt-1 font-medium">
                  {inn.syntax.map((syn, idx) => (
                    <li key={idx} className="text-[10px]">{syn}</li>
                  ))}
                </ul>
                <p className="mt-1"><span className="font-semibold text-slate-900">Hasil & Dampak:</span> {inn.impact}</p>
              </div>
            ))}
          </div>
        )}

        {/* Organizations & Community */}
        {organizations.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3 font-sans">Organisasi & Keanggotaan</h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {organizations.map((org) => (
                <div key={org.id} className="pl-3 border-l border-amber-500">
                  <span className="font-bold text-slate-950">{org.role}</span>
                  <p className="text-[10px] text-slate-700 font-medium">{org.name}</p>
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">{org.startYear} - {org.endYear}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certification declaration */}
        <div className="mt-10 border-t border-slate-200 pt-6 text-center text-[10px] text-slate-500 flex justify-between items-center">
          <p>Digenerasi secara otomatis melalui Portofolio Digital Guru SMAN 1 Jakarta</p>
          <div className="text-right">
            <p className="font-bold text-slate-800">{profile.fullName}</p>
            <p className="font-mono">NIP. {profile.nip || "-"}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
