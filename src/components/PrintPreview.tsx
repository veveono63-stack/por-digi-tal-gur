/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { PortfolioData } from "../types";
import { FileText, Award, Calendar, GraduationCap, Briefcase, Mail, Phone, MapPin, BookOpen, Settings, Download, Printer } from "lucide-react";
import { formatDate, getDirectImageUrl } from "../utils";

interface PrintPreviewProps {
  data: PortfolioData;
  onClose: () => void;
  printType: "cv" | "full";
}

export default function PrintPreview({ data, onClose, printType }: PrintPreviewProps) {
  const { profile, education, career, additionalTasks = [], developmentEvents, achievements, works, innovations, organizations, settings } = data;
  const [paperSize, setPaperSize] = React.useState<"asli" | "A4" | "F4">("asli");

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
  }, [isIframe, paperSize]);

  const handleAction = () => {
    if (isIframe) {
      window.open(window.location.origin + "?print=" + printType, "_blank");
    } else {
      window.print();
    }
  };

  const getPageStyle = () => {
    switch (paperSize) {
      case "asli":
        return `
          @media print {
            @page {
              size: 210mm 4000mm;
              margin: 15mm;
            }
            body, html, #root {
              height: auto !important;
              background-color: white !important;
            }
            .print-section {
              page-break-inside: auto !important;
              break-inside: auto !important;
            }
          }
        `;
      case "A4":
        return `
          @media print {
            @page {
              size: A4;
              margin: 15mm;
            }
            body, html, #root {
              height: auto !important;
              background-color: white !important;
            }
            .print-section {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          }
        `;
      case "F4":
        return `
          @media print {
            @page {
              size: 215mm 330mm;
              margin: 15mm;
            }
            body, html, #root {
              height: auto !important;
              background-color: white !important;
            }
            .print-section {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          }
        `;
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-900 print:p-0 print:bg-white">
      {/* Inject Dynamic CSS Stylesheet berdasarkan ukuran kertas yang dipilih */}
      <style dangerouslySetInnerHTML={{ __html: getPageStyle() }} />

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

      {/* Back button and paper size controls for screen viewing */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-100 p-4 rounded-lg border border-slate-200 print:hidden text-left">
        <div className="flex items-center space-x-2.5">
          <FileText className="text-amber-600 shrink-0" size={20} />
          <div className="text-left">
            <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm leading-tight">Pratinjau Cetak {printType === "cv" ? "CV Digital" : "Portofolio Lengkap"}</h4>
            <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
              {isIframe 
                ? "Buka di tab baru terlebih dahulu untuk mencetak/menyimpan PDF secara penuh." 
                : paperSize === "asli"
                  ? "Sangat cocok untuk PDF digital agar portofolio tidak terpotong garis halaman."
                  : `Menyesuaikan kertas fisik ${paperSize}. Atur ukuran kertas di dialog cetak browser ke ${paperSize === "A4" ? "A4" : "US Legal / Folio (215x330mm)"}.`}
            </p>
          </div>
        </div>

        {/* Paper Size selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600">Ukuran Kertas:</span>
          <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-white shadow-sm">
            <button
              onClick={() => setPaperSize("asli")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                paperSize === "asli" 
                  ? "bg-amber-600 text-white shadow-sm" 
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Ukuran Asli
            </button>
            <button
              onClick={() => setPaperSize("A4")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                paperSize === "A4" 
                  ? "bg-amber-600 text-white shadow-sm" 
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              A4
            </button>
            <button
              onClick={() => setPaperSize("F4")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                paperSize === "F4" 
                  ? "bg-amber-600 text-white shadow-sm" 
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              F4
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleAction}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow transition flex items-center space-x-1.5"
            title="Gunakan dialog cetak browser lalu pilih opsi 'Simpan sebagai PDF' (Save as PDF)"
          >
            <Download size={13} />
            <span>Simpan PDF</span>
          </button>
          <button
            onClick={handleAction}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow transition flex items-center space-x-1.5"
          >
            <Printer size={13} />
            <span>Cetak</span>
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition"
          >
            Kembali
          </button>
        </div>
      </div>

      {/* Sheet Container */}
      <div className="max-w-4xl mx-auto border border-slate-200 p-8 shadow-md rounded bg-white print:border-0 print:p-0 print:shadow-none">
        
        {/* CV Header */}
        <div className="border-b-4 border-slate-900 pb-6 mb-6 flex justify-between items-start gap-4">
          <div className="flex items-start space-x-4">
            {profile.photoUrl && (
              <img
                src={getDirectImageUrl(profile.photoUrl)}
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
            {(profile.birthPlace || profile.birthDate) && (
              <p className="flex items-center justify-end">
                <Calendar size={12} className="mr-1.5" />
                Lahir: {profile.birthPlace || ""}{profile.birthPlace && profile.birthDate ? ", " : ""}{profile.birthDate ? formatDate(profile.birthDate) : ""}
              </p>
            )}
            <p className="font-mono mt-2">NIP: {profile.nip || "-"}</p>
            <p className="font-mono">Gol: {profile.rank || "-"}</p>
          </div>
        </div>

        {/* Executive Summary */}
        {settings.pdfVisibility?.profil !== false && (
          <div className="mb-6 print-section">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">Profil Profesional</h2>
            <p className="text-xs text-slate-700 leading-relaxed text-justify">{profile.bio}</p>
          </div>
        )}

        {/* Grid for Education & Career */}
        {((settings.pdfVisibility?.pendidikan !== false && education.length > 0) || 
          (settings.pdfVisibility?.karier !== false && career.length > 0)) && (
          <div className="grid grid-cols-2 gap-6 mb-6 print-section">
            
            {/* Education Section */}
            {settings.pdfVisibility?.pendidikan !== false && education.length > 0 ? (
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
            ) : <div />}

            {/* Career Section */}
            {settings.pdfVisibility?.karier !== false && career.length > 0 ? (
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
            ) : <div />}

          </div>
        )}

        {/* Tugas Tambahan Section (2 Kolom, Tepat di Atas Prestasi & Penghargaan) */}
        {settings.pdfVisibility?.tugasTambahan !== false && additionalTasks && additionalTasks.length > 0 && (
          <div className="mb-6 print-section">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">Tugas Tambahan</h2>
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
        {settings.pdfVisibility?.prestasi !== false && achievements.length > 0 && (
          <div className="mb-6 print-section">
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
        {settings.pdfVisibility?.pengembanganDiri !== false && (() => {
          const sortedEvents = developmentEvents;
          const shownEvents = sortedEvents.filter(e => e.showOnFront !== false);
          const hiddenCount = sortedEvents.filter(e => e.showOnFront === false).length;

          if (shownEvents.length === 0 && hiddenCount === 0) return null;

          return (
            <div className="mb-6 print-section">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">Pengembangan Kompetensi / Diklat</h2>
              <div className="space-y-2">
                {shownEvents.length > 0 ? (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[9px] font-bold border-b border-slate-300">
                        <th className="py-1.5 px-2">Kategori</th>
                        <th className="py-1.5 px-2">Nama Program / Seminar</th>
                        <th className="py-1.5 px-2">Penyelenggara</th>
                        <th className="py-1.5 px-2">Tahun</th>
                        <th className="py-1.5 px-2 text-right">Durasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {shownEvents.map((event) => (
                        <tr key={event.id} className="text-[10px] text-slate-700">
                          <td className="py-1.5 px-2 font-bold text-slate-900">{event.type}</td>
                          <td className="py-1.5 px-2 font-medium">{event.title}</td>
                          <td className="py-1.5 px-2 text-slate-500">{event.organizer}</td>
                          <td className="py-1.5 px-2 font-mono text-slate-500">{event.year || (event.date ? event.date.substring(0, 4) : "")}</td>
                          <td className="py-1.5 px-2 text-right font-semibold">{event.hours ? `${event.hours} JP` : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-[10px] text-slate-500 italic">Tidak ada pengembangan diri yang ditandai untuk ditampilkan.</p>
                )}
                
                {hiddenCount > 0 && (
                  <p className="text-[10px] text-slate-600 font-semibold italic text-right mt-2">
                    Dan {hiddenCount} pengembangan diri lainnya
                  </p>
                )}
              </div>
            </div>
          );
        })()}

        {/* Works & Publications */}
        {settings.pdfVisibility?.karya !== false && works.length > 0 && (
          <div className="mb-6 print-section">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">Karya Inovasi dan Publikasi</h2>
            <ul className="list-disc list-outside pl-5 space-y-2">
              {works.map((work) => (
                <li key={work.id} className="text-xs text-slate-800">
                  <div>
                    <span className="font-bold">[{work.type}]</span> <span className="italic font-medium">"{work.title}"</span> — {work.publisher || "Publikasi Mandiri"}, {work.year}
                    {work.description && <p className="text-[10px] text-slate-500 mt-0.5">{work.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Organizations & Community */}
        {settings.pdfVisibility?.organisasi !== false && organizations.length > 0 && (
          <div className="mb-6 print-section">
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
