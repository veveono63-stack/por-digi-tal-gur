/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Profile {
  id?: string;
  fullName: string;
  title: string;
  position: string;
  workUnit: string;
  motto: string;
  photoUrl: string;
  cvUrl?: string;
  nip: string;
  nuptk: string;
  rank: string; // Pangkat/Golongan
  bio: string;
  email: string;
  phone: string;
  address: string;
  birthPlace?: string;
  birthDate?: string;
  socials: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    twitter?: string;
  };
}

export interface Education {
  id: string;
  level: "SD" | "SMP" | "SMA" | "S1" | "S2" | "S3" | "PPG";
  institution: string;
  major?: string;
  startYear: string;
  endYear: string;
  description?: string;
  fileUrl?: string;
}

export interface Career {
  id: string;
  position: string;
  institution: string;
  startYear: string;
  endYear: string; // "Sekarang" atau tahun
  description?: string;
  fileUrl?: string;
}

export interface DevelopmentEvent {
  id: string;
  type: "Workshop" | "Seminar/Webinar" | "Diklat" | "Bimtek" | "Pelatihan" | "Sertifikasi" | "Narasumber";
  title: string;
  organizer: string;
  year: string;
  date?: string; // Optional for backwards compatibility
  hours?: number; // JP (Jam Pelajaran)
  certificateUrl?: string;
  showOnFront?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  rank: string; // Juara 1, Best Practice, dll.
  level: "Sekolah" | "Kecamatan" | "Kabupaten" | "Provinsi" | "Nasional" | "Internasional";
  year: string;
  organizer: string;
  description?: string;
  certificateUrl?: string;
}

export interface WorkAndPublication {
  id: string;
  type: "Modul Ajar" | "LKPD" | "PTK" | "Artikel" | "Ebook" | "Buku" | "Media Pembelajaran" | "Video Pembelajaran" | "Best Practice";
  title: string;
  year: string;
  publisher?: string;
  url?: string;
  description?: string;
  coverUrl?: string;
}

export interface Innovation {
  id: string;
  name: string;
  logoIcon: string; // Lucide icon name
  background: string;
  problem: string;
  solution: string;
  objective: string;
  syntax: string[]; // Step-by-step
  diagramDescription?: string;
  implementation: string;
  documentationUrls: string[];
  impact: string;
  statsLabel?: string;
  statsValue?: string;
  videoUrl?: string;
  documentUrl?: string;
}

export interface BestPractice {
  id: string;
  title: string;
  situation: string;
  challenge: string;
  action: string;
  reflection: string;
  impact: string;
  supportingEvidenceUrls: string[];
  videoUrl?: string;
  pdfUrl?: string;
}

export interface StudentImpact {
  id: string;
  title: string;
  initialCondition: string;
  intervention: string;
  finalCondition: string;
  chartLabels: string[];
  chartInitialValues: number[];
  chartFinalValues: number[];
  documentationUrls: string[];
  fileUrl?: string;
}

export interface TeacherCompetency {
  id: "pedagogik" | "profesional" | "sosial" | "kepribadian";
  name: string;
  score: number; // 0 - 100
  description: string;
  evidences: string[];
}

export interface Organization {
  id: string;
  name: string;
  role: string;
  startYear: string;
  endYear: string; // "Sekarang" atau tahun
  documentUrl?: string;
  photoUrl?: string;
}

export interface Gallery {
  id: string;
  category: "Mengajar" | "Seminar" | "Workshop" | "Literasi" | "Pramuka" | "AGP" | "Guru Penggerak";
  title: string;
  description?: string;
  imageUrl: string;
  date: string;
}

export interface Certificate {
  id: string;
  name: string;
  category: string;
  number?: string;
  issuer: string;
  date: string;
  fileUrl?: string;
}

export interface Document {
  id: string;
  name: string;
  category: string;
  description?: string;
  fileUrl?: string;
  uploadDate: string;
  linkType?: "pdf" | "external";
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string; // Markdown / Text
  category: string;
  date: string;
  imageUrl?: string;
  isVisible: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  isRead: boolean;
}

export interface WebsiteSettings {
  siteTitle: string;
  seoTitle: string;
  seoDescription: string;
  accentColor: string; // Tailwind color class
  isDarkMode: boolean;
  menuVisibility: {
    beranda: boolean;
    profil: boolean;
    pendidikan: boolean;
    karier: boolean;
    tugasTambahan?: boolean;
    pengembanganDiri: boolean;
    prestasi: boolean;
    karya: boolean;
    inovasi: boolean;
    bestPractice: boolean;
    dampakSiswa: boolean;
    kompetensi: boolean;
    organisasi: boolean;
    galeri: boolean;
    sertifikat: boolean;
    dokumen: boolean;
    artikel: boolean;
    kontak: boolean;
  };
  pdfVisibility?: {
    profil?: boolean;
    pendidikan?: boolean;
    karier?: boolean;
    tugasTambahan?: boolean;
    pengembanganDiri?: boolean;
    prestasi?: boolean;
    karya?: boolean;
    inovasi?: boolean;
    bestPractice?: boolean;
    dampakSiswa?: boolean;
    kompetensi?: boolean;
    organisasi?: boolean;
    sertifikat?: boolean;
    dokumen?: boolean;
  };
}

export interface AdditionalTask {
  id: string;
  taskName: string;
  institution: string;
  startYear: string;
  endYear: string;
  description?: string;
  fileUrl?: string;
}

export interface PortfolioData {
  profile: Profile;
  education: Education[];
  career: Career[];
  additionalTasks?: AdditionalTask[]; // Riwayat Tugas Tambahan
  developmentEvents: DevelopmentEvent[];
  achievements: Achievement[];
  works: WorkAndPublication[];
  innovations: Innovation[];
  bestPractices: BestPractice[];
  studentImpacts: StudentImpact[];
  competencies: TeacherCompetency[];
  organizations: Organization[];
  gallery: Gallery[];
  certificates: Certificate[];
  documents: Document[];
  articles: Article[];
  contactMessages: ContactMessage[];
  settings: WebsiteSettings;
}
