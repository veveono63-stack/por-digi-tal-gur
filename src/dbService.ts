/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db, isFirebaseConnected } from "./firebase";
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  deleteDoc, query, orderBy, limit, addDoc 
} from "firebase/firestore";
import { PortfolioData, Profile, Education, Career, AdditionalTask, DevelopmentEvent, Achievement, 
  WorkAndPublication, Innovation, BestPractice, StudentImpact, TeacherCompetency, 
  Organization, Gallery, Certificate, Document, Article, ContactMessage, WebsiteSettings 
} from "./types";

// Helper function to handle Firestore errors conforming to the system skill
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    timestamp: new Date().toISOString()
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------------------------------------------
// DUMMY DATA SEED
// ----------------------------------------------------
const INITIAL_PROFILE: Profile = {
  fullName: "Asnadi Kuncoro, S.Pd",
  title: "Guru Penggerak & Pendidik Ahli Madya",
  position: "Guru Kelas / Pembina Kurikulum",
  workUnit: "SD Negeri",
  motto: "Menuntun kodrat alam dan kodrat zaman peserta didik agar selamat dan bahagia setinggi-tingginya sebagai manusia dan anggota masyarakat.",
  photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=350", // High quality profile photo
  cvUrl: "",
  nip: "19840212 201001 1 005",
  nuptk: "4325762664130122",
  rank: "Pembina, IV/a",
  bio: "Saya adalah seorang pendidik profesional yang berdedikasi tinggi dengan pengalaman di bidang pendidikan dasar dan menengah. Sebagai alumni Program Guru Penggerak, saya berfokus pada inovasi pembelajaran berdiferensiasi, pemanfaatan teknologi pendidikan, dan pengimbasan praktik baik kepada komunitas belajar praktisi.",
  email: "asnadi.kuncoro@admin.sch.id",
  phone: "+62 812-3456-7890",
  address: "Indonesia",
  socials: {
    facebook: "https://facebook.com/asnadi.kuncoro",
    instagram: "https://instagram.com/asnadi_kuncoro",
    youtube: "https://youtube.com/c/AsnadiKuncoroChannel",
    tiktok: "https://www.tiktok.com/@asnadi_kuncoro"
  }
};

const INITIAL_EDUCATION: Education[] = [
  {
    id: "edu_1",
    level: "SD",
    institution: "SD Negeri Menteng 01 Jakarta",
    startYear: "1990",
    endYear: "1996"
  },
  {
    id: "edu_2",
    level: "SMP",
    institution: "SMP Negeri 1 Jakarta",
    startYear: "1996",
    endYear: "1999"
  },
  {
    id: "edu_3",
    level: "SMA",
    institution: "SMA Negeri 1 Jakarta (IPA)",
    startYear: "1999",
    endYear: "2002"
  },
  {
    id: "edu_4",
    level: "S1",
    institution: "Universitas Negeri Jakarta",
    major: "Pendidikan Fisika",
    startYear: "2002",
    endYear: "2006",
    description: "Lulus dengan Predikat Pujian (Cum Laude). Aktif dalam Himpunan Mahasiswa Pendidikan Fisika."
  },
  {
    id: "edu_5",
    level: "S2",
    institution: "Universitas Indonesia",
    major: "Magister Manajemen Pendidikan",
    startYear: "2015",
    endYear: "2017",
    description: "Fokus tesis: 'Implementasi Kepemimpinan Pembelajaran Kepala Sekolah pada Sekolah Berprestasi Tinggi di DKI Jakarta'."
  }
];

const INITIAL_CAREER: Career[] = [
  {
    id: "car_1",
    position: "Guru Fisika Honor",
    institution: "SMA Swasta Sumbangsih Jakarta",
    startYear: "2006",
    endYear: "2010",
    description: "Mengajar Fisika untuk kelas X, XI, dan XII. Membina Ekstrakurikuler Kelompok Ilmiah Remaja (KIR)."
  },
  {
    id: "car_2",
    position: "Guru Fisika Pegawai Negeri Sipil (PNS)",
    institution: "SMAN 1 Jakarta",
    startYear: "2010",
    endYear: "Sekarang",
    description: "Mengampu mata pelajaran Fisika Fase E & F. Merancang kurikulum tingkat satuan pendidikan dan media pembelajaran berbasis digital."
  },
  {
    id: "car_3",
    position: "Guru Penggerak (Angkatan 5)",
    institution: "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi",
    startYear: "2022",
    endYear: "2023",
    description: "Menyelesaikan pendidikan 9 bulan dengan fokus kepemimpinan pembelajaran, pembelajaran sosial emosional (PSE), dan coaching praktis."
  },
  {
    id: "car_4",
    position: "Wakil Kepala Sekolah Bidang Kurikulum",
    institution: "SMAN 1 Jakarta",
    startYear: "2023",
    endYear: "Sekarang",
    description: "Memimpin implementasi Kurikulum Merdeka, menyusun Kalender Akademik, mengoordinasi Projek Penguatan Profil Pelajar Pancasila (P5), serta memimpin evaluasi pembelajaran berbasis data."
  }
];

const INITIAL_ADDITIONAL_TASKS: AdditionalTask[] = [
  {
    id: "add_1",
    taskName: "Kepala Laboratorium Fisika",
    institution: "SMAN 1 Jakarta",
    startYear: "2018",
    endYear: "Sekarang",
    description: "Mengelola sarana dan prasarana laboratorium fisika, mengoordinasikan praktikum, serta melaksanakan program keselamatan kerja laboratorium."
  },
  {
    id: "add_2",
    taskName: "Wali Kelas XII MIPA 1",
    institution: "SMAN 1 Jakarta",
    startYear: "2021",
    endYear: "Sekarang",
    description: "Membimbing perkembangan akademik, sosial-emosional, serta administrasi kelas bagi 36 siswa kelas XII MIPA 1."
  }
];

const INITIAL_EVENTS: DevelopmentEvent[] = [
  {
    id: "dev_pdf_1",
    type: "Seminar/Webinar",
    title: "Webinar Kelas Berkualitas Bukan Kebetulan, Rahasia Praktik Pembelajaran Mendalam",
    organizer: "Kelas Pengajar",
    year: "2026",
    hours: 32,
    showOnFront: true
  },
  {
    id: "dev_pdf_2",
    type: "Bimtek",
    title: "BIMBINGAN TEKNIS TATA KELOLA PERSURATAN, KEARSIPAN DAN PELAYANAN PUBLIK",
    organizer: "Dinas Pendidikan Kabupaten Tulungagung",
    year: "2025",
    hours: 3,
    showOnFront: true
  },
  {
    id: "dev_pdf_3",
    type: "Diklat",
    title: "Diklat Pembelajaran Mendalam (Deep Learning) bagi Kepala Sekolah dan Guru Sekolah Dasar Negeri/Swasta Se-Kecamatan Karangrejo",
    organizer: "Kelompok Kerja Kepala Sekolah (K3S) Kec. Karangrejo",
    year: "2025",
    hours: 32,
    showOnFront: true
  },
  {
    id: "dev_pdf_4",
    type: "Diklat",
    title: "Diklat Proyek Pintar Menggunakan Coding dan Micro:bit untuk Mendorong Berpikir Komputasional Siswa",
    organizer: "Guru Mengajar",
    year: "2025",
    hours: 32,
    showOnFront: true
  },
  {
    id: "dev_pdf_5",
    type: "Diklat",
    title: "Diklat Coding & AI : Praktis Mengenalkan Kecerdasan Artifisial di Kelas",
    organizer: "Guru Mengajar",
    year: "2025",
    hours: 32,
    showOnFront: true
  },
  {
    id: "dev_pdf_6",
    type: "Diklat",
    title: "Diklat Pembelajaran Interaktif dengan Quizizz Terintegrasi Belajar.id",
    organizer: "Guru Mengajar",
    year: "2024",
    hours: 32,
    showOnFront: true
  },
  {
    id: "dev_pdf_7",
    type: "Diklat",
    title: "Diklat Asesmen Awal Masa Transisi PAUD ke SD Menyambut Tahun Ajaran Baru",
    organizer: "GURU MENGAJAR",
    year: "2024",
    hours: 32,
    showOnFront: true
  },
  {
    id: "dev_pdf_8",
    type: "Bimtek",
    title: "Bimtek Penguatan Implementasi Kurikulum Merdeka bagi Guru Kelas III, VI, dan Mapel Sekolah Dasar",
    organizer: "Dinas Pendidikan Kabupaten Tulungagung",
    year: "2024",
    hours: 32,
    showOnFront: true
  },
  {
    id: "dev_pdf_9",
    type: "Diklat",
    title: "Diklat Pembelajaran STEM pada Implementasi Kurikulum Merdeka",
    organizer: "GURUMENGAJAR.ID",
    year: "2024",
    hours: 32,
    showOnFront: true
  },
  {
    id: "dev_pdf_10",
    type: "Diklat",
    title: "Diklat Pengelolaan Kinerja Guru dan Kepala Sekolah pada Platform Merdeka Mengajar",
    organizer: "Belajar Era Digital",
    year: "2024",
    hours: 32,
    showOnFront: true
  },
  {
    id: "dev_pdf_11",
    type: "Pelatihan",
    title: "Strategi Efektif: Peningkatan Keterampilan Guru Dengan Memaksimalkan Penggunaan Platform Merdeka Mengajar",
    organizer: "Guru Juara dan edukarya",
    year: "2024",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_12",
    type: "Seminar/Webinar",
    title: "Kunci Sukses Sekolah: Implementasi & Optimalisasi Kurikulum Merdeka Tahun 2024 di Satuan Pendidikan",
    organizer: "UNNES",
    year: "2024",
    hours: 40,
    showOnFront: false
  },
  {
    id: "dev_pdf_13",
    type: "Pelatihan",
    title: "Pelatihan Mandiri dalam Platform Merdeka Mengajar dengan Topik Kurikulum Merdeka",
    organizer: "Ditjen GTK KEMDIKBUDRISTEK",
    year: "2023",
    hours: 30,
    showOnFront: false
  },
  {
    id: "dev_pdf_14",
    type: "Diklat",
    title: "Diklat Nasional \"Cepat dan Mudah Kuasai AI: Pemanfaatan Quizizz dalam Pembelajaran Menuju Kelas Masa Depan\"",
    organizer: "Belajar Bersama, Guru Juara, edukarya",
    year: "2023",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_15",
    type: "Diklat",
    title: "Diklat Nasional \"Era Digital Guru: Artificial Intelligence sebagai Solusi Administrasi Pendidikan\"",
    organizer: "Belajar Bersama, Edu Karya, dan UNNES",
    year: "2023",
    hours: 40,
    showOnFront: false
  },
  {
    id: "dev_pdf_16",
    type: "Pelatihan",
    title: "Menulis Buku Praktik Baik pada Kurikulum Merdeka",
    organizer: "Universitas Pendidikan Mandalika (UNDIKMA) dan P4I",
    year: "2023",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_17",
    type: "Bimtek",
    title: "Bimtek \"Pentingnya Pendidikan Karakter dalam Membentuk Etika dan Moral Anak\"",
    organizer: "Guru Juara",
    year: "2023",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_18",
    type: "Pelatihan",
    title: "Metode Dahsyat dan Mudah: Optimalkan Penggunaan Teknologi Artificial Intelligence dalam Pendidikan",
    organizer: "Belajar Bersama, Ruang Temu Guru, edukarya",
    year: "2023",
    hours: 40,
    showOnFront: false
  },
  {
    id: "dev_pdf_19",
    type: "Seminar/Webinar",
    title: "MEMBANGUN PROFIL PELAJAR PANCASILA DALAM PARADIGMA KURIKULUM MERDEKA",
    organizer: "Program Studi Magister Pendidikan Ilmu Pendidikan Sosial UBHI",
    year: "2023",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_20",
    type: "Pelatihan",
    title: "Penerapan Pembelajaran Kreatif & Inovatif dalam Era Kurikulum Merdeka",
    organizer: "Belajar Era Digital",
    year: "2023",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_21",
    type: "Pelatihan",
    title: "PENYUSUNAN MODUL AJAR PENGGANTI RENCANA PELAKSANAAN PEMBELAJARAN (RPP)",
    organizer: "LPPPG Jawa Timur dan DIKPORA Kab. Tulungagung",
    year: "2023",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_22",
    type: "Pelatihan",
    title: "Pelatihan Mandiri dalam Platform Merdeka Mengajar dengan topik Profil Pelajar Pancasila",
    organizer: "Ditjen GTK Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi",
    year: "2022",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_23",
    type: "Pelatihan",
    title: "Pelatihan Mandiri dalam Platform Merdeka Mengajar dengan topik Perencanaan Pembelajaran SD/Paket A",
    organizer: "Ditjen GTK Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi",
    year: "2022",
    hours: 30,
    showOnFront: false
  },
  {
    id: "dev_pdf_24",
    type: "Workshop",
    title: "Workshop Nasional Guru Inovatif Indonesia dengan Tema \"Kurikulum Merdeka Belajar\"",
    organizer: "Pusat Pengembangan Pendidikan dan Pelatihan Indonesia (P4I)",
    year: "2022",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_25",
    type: "Diklat",
    title: "Diklat Nasional Tingkatkan Kualitas Pembelajaran Melalui Karya Inovatif Guru",
    organizer: "e-Guru.id",
    year: "2022",
    hours: 40,
    showOnFront: false
  },
  {
    id: "dev_pdf_26",
    type: "Workshop",
    title: "Lokakarya Zenru: Kupas Tuntas Kurikulum Merdeka",
    organizer: "ZENIUS UNTUK GURU",
    year: "2022",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_27",
    type: "Diklat",
    title: "Diklat Nasional Dampak Besar Kurikulum Merdeka dalam Fleksibilitas Pembelajaran",
    organizer: "e-Guru.id",
    year: "2022",
    hours: 40,
    showOnFront: false
  },
  {
    id: "dev_pdf_28",
    type: "Pelatihan",
    title: "Langkah Mudah Membuat Publikasi Ilmiah untuk Kenaikan Pangkat Guru",
    organizer: "GuruJuara.com",
    year: "2022",
    hours: 40,
    showOnFront: false
  },
  {
    id: "dev_pdf_29",
    type: "Pelatihan",
    title: "Pelatihan Quizizz School Teacher Untuk Pembelajaran",
    organizer: "Ikatan Guru Indonesia Kab. Lebong dan Quizizz",
    year: "2022",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_30",
    type: "Diklat",
    title: "Diklat Nasional Menguatkan Kompetensi Guru Menyongsong Kurikulum Paradigma Baru",
    organizer: "e-Guru.id",
    year: "2022",
    hours: 40,
    showOnFront: false
  },
  {
    id: "dev_pdf_31",
    type: "Seminar/Webinar",
    title: "Bedah Kurikulum Prototipe sebagai Pilihan Kurikulum dalam Rangka Pemulihan Pembelajaran",
    organizer: "e-Guru.id",
    year: "2022",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_32",
    type: "Bimtek",
    title: "Bimbingan Teknis Pemanfaatan Aplikasi SIGUTAJAR (Sistem Informasi Guru Tulungagung Belajar) dalam Pembelajaran bagi Guru SD Kabupaten Tulungagung",
    organizer: "Dinas Pendidikan Pemuda dan Olahraga Kab. Tulungagung",
    year: "2021",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_33",
    type: "Bimtek",
    title: "Bimbingan Teknis Aplikasi SIGUTAJAR (Sistem Informasi Guru Tulungagung Belajar) Bagi Guru SD Kabupaten Tulungagung",
    organizer: "Dinas Pendidikan Pemuda dan Olah Raga Kab. Tulungagung",
    year: "2021",
    hours: 16,
    showOnFront: false
  },
  {
    id: "dev_pdf_34",
    type: "Pelatihan",
    title: "Pelatihan YouTube Pembelajaran dengan tema \"Seribu Konten YouTube Pendidikan Untuk Indonesia\" Kelas Dasar/Pemula",
    organizer: "Omah Guru Inovatif",
    year: "2021",
    hours: 34,
    showOnFront: false
  },
  {
    id: "dev_pdf_35",
    type: "Seminar/Webinar",
    title: "\"MERDEKA BELAJAR\" MELALUI MODEL PEMBELAJARAN BLENDED LEARNING",
    organizer: "LPPPG JATIM & DIKPORA KAB. TULUNGAGUNG",
    year: "2021",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_36",
    type: "Pelatihan",
    title: "Pelatihan Mengajar di Mana Saja dengan Akun Pembelajaran",
    organizer: "Google Master Trainer - GTK Kemdikbud",
    year: "2021",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_37",
    type: "Pelatihan",
    title: "Digitalisasi Sekolah",
    organizer: "Direktorat Selolah Dasar",
    year: "2021",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_38",
    type: "Pelatihan",
    title: "Pelatihan Guru Cerdas Lewat Pembelajaran Seimbang",
    organizer: "ZENIUS UNTUK GURU",
    year: "2021",
    hours: 64,
    showOnFront: false
  },
  {
    id: "dev_pdf_39",
    type: "Pelatihan",
    title: "Pelatihan Google Workspace for Education",
    organizer: "PGRI Kabupaten Tulungagung",
    year: "2021",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_40",
    type: "Seminar/Webinar",
    title: "Webinar Digitalisasi Sekolah bersama Guru-Guru BK se-Indonesia dengan Implementasi sistem Automatic Skill Analysis (ASA)",
    organizer: "KOMNASDIK JATIM",
    year: "2021",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_41",
    type: "Pelatihan",
    title: "Pelatihan Persiapan Pembelajaran Tatap Muka Terbatas TA 2021/2022 SERI 2: Mempersiapkan Siswa untuk PTM Terbatas",
    organizer: "ruangkelas by Ruangguru",
    year: "2021",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_42",
    type: "Pelatihan",
    title: "MAHIR AKM ALA ZENIUS",
    organizer: "ZENIUS UNTUK GURU",
    year: "2021",
    hours: 64,
    showOnFront: false
  },
  {
    id: "dev_pdf_43",
    type: "Seminar/Webinar",
    title: "Webinar Pendidikan Nasional dengan Tema \"Tantangan Membentuk Generasi Terbaik Bangsa di Era Perubahan\"",
    organizer: "INDONESIAN YOUTH EDUCATION MOVEMENT",
    year: "2021",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_44",
    type: "Pelatihan",
    title: "Pelatihan Membuat Video Animasi Pembelajaran Kelas Pemula menggunakan Renderforest",
    organizer: "Omah Guru Inovatif",
    year: "2021",
    hours: 34,
    showOnFront: false
  },
  {
    id: "dev_pdf_45",
    type: "Workshop",
    title: "Webinar dan Workshop Nasional \"Strategi Pembelajaran di Sekolah Dasar Berbasis 3M\"",
    organizer: "Prodi PGSD Fakultas Pendidikan Ilmu Sosial Bahasa dan Sastra IPI Garut",
    year: "2021",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_46",
    type: "Pelatihan",
    title: "KELAS ONLINE DIGITAL INTERACTIVE LEARNING “10 Hari Membuat Media Pembelajaran Interaktif”",
    organizer: "GREENLEAF BELAJAR",
    year: "2020",
    hours: 64,
    showOnFront: false
  },
  {
    id: "dev_pdf_47",
    type: "Pelatihan",
    title: "Pelatihan Google Suite for Education",
    organizer: "Google Master Trainer - GTK Kemdikbud",
    year: "2021",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_48",
    type: "Bimtek",
    title: "Bimbingan Teknis (Bimtek) Program Guru Belajar Seri Asesmen Kompetensi Minimum Kementerian Pendidikan dan Kebudayaan",
    organizer: "Kementerian Pendidikan dan Kebudayaan",
    year: "2021",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_49",
    type: "Workshop",
    title: "Webinar dan Pelatihan Berbagi Inspirasi Karya Edukasi dengan Tema “Inovasi Pembelajaran”",
    organizer: "UNIVERSITAS AMIKOM PURWOKERTO",
    year: "2020",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_50",
    type: "Pelatihan",
    title: "Bikin Quiz Praktis dan Kreatif dengan Quizizz",
    organizer: "Kanal Pelatihan IGI (Ikatan Guru Indonesia) SAMISANOV",
    year: "2020",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_51",
    type: "Seminar/Webinar",
    title: "Model Pembelajaran di Sekolah Dasar pada Masa Pandemi Covid 19",
    organizer: "Dinas Pendidikan Pemuda dan Olahraga (UPASP Kecamatan Karangrejo)",
    year: "2020",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_52",
    type: "Seminar/Webinar",
    title: "Webinar Strategi Peningkatan Kualitas Pembelajaran Anak pada Masa Pandemi",
    organizer: "Jurusan KSDP, FIP, Universitas Negeri Malang",
    year: "2020",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_53",
    type: "Seminar/Webinar",
    title: "Webinar Pengelolaan Pembelajaran Daring yang Efektif untuk Siswa SD/MI",
    organizer: "STITNU Al Hikmah Mojokerto",
    year: "2020",
    showOnFront: false
  },
  {
    id: "dev_pdf_54",
    type: "Pelatihan",
    title: "Peningkatan Kompetensi Guru dalam Pembelajaran Berbasis TIK (PembaTIK) Tahun 2020 Level Literasi",
    organizer: "Pustekkom Kementerian Pendidikan dan Kebudayaan",
    year: "2020",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_55",
    type: "Seminar/Webinar",
    title: "Ngobrol Santai Matematika \"Inovasi Pembelajaran Kini dan Nanti\"",
    organizer: "Prodi Pendidikan Matematika FKIP Universitas Majalengka",
    year: "2020",
    showOnFront: false
  },
  {
    id: "dev_pdf_56",
    type: "Seminar/Webinar",
    title: "Orang Tua Paham Kesehatan, Generasi Maju",
    organizer: "Komisi Nasional Pendidikan Provinsi Jawa Timur",
    year: "2020",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_57",
    type: "Pelatihan",
    title: "Pembuatan APK Pembelajaran 3D",
    organizer: "Kanal Pelatihan IGI (Ikatan Guru Indonesia) SAMISANOV",
    year: "2020",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_58",
    type: "Bimtek",
    title: "Bimbingan Teknis Penyusunan Rencana Pelaksanaan Pembelajaran (RPP) Daring dalam Situasi Pembelajaran New Normal",
    organizer: "Ikatan Guru Indonesia (IGI) Kab. Takalar Prov. Sulawesi Selatan",
    year: "2020",
    showOnFront: false
  },
  {
    id: "dev_pdf_59",
    type: "Seminar/Webinar",
    title: "Webinar Sesi 4 PGRI Tulungagung “Strategi Menyongsong Tahun Pelajaran Baru di Masa Pandemi”",
    organizer: "Persatuan Guru Republik Indonesia (PGRI) Kabupaten Tulungagung",
    year: "2020",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_60",
    type: "Seminar/Webinar",
    title: "Webinar Pengenalan Lingkungan Sekolah Secara Virtual: Menyambut Tahun Ajaran Baru, Semua Terlibat Menjadi Hebat",
    organizer: "Pusat Penguatan Karakter Kementerian Pendidikan dan Kebudayaan",
    year: "2020",
    showOnFront: false
  },
  {
    id: "dev_pdf_61",
    type: "Seminar/Webinar",
    title: "Insersi Kurikulum Pendidikan Anti Korupsi Implementasi Peraturan Gubernur Jawa Timur No. 83 Tahun 2019 tentang Penyelenggaraan Pendidikan Anti Korupsi",
    organizer: "Dinas Pendidikan Provinsi Jawa Timur",
    year: "2020",
    showOnFront: false
  },
  {
    id: "dev_pdf_62",
    type: "Seminar/Webinar",
    title: "New Normal: Belajar Modern Berbasis Digital",
    organizer: "Acer Indonesia",
    year: "2020",
    showOnFront: false
  },
  {
    id: "dev_pdf_63",
    type: "Seminar/Webinar",
    title: "Pengelolaan Pendidikan Anak di Era New Normal",
    organizer: "Lakpesdam PC NU Demak",
    year: "2020",
    showOnFront: false
  },
  {
    id: "dev_pdf_64",
    type: "Seminar/Webinar",
    title: "STRATEGI MERANCANG PJJ TEMATIK TANPA INTERNET BAGI GURU SD KELAS RENDAH DAN TINGGI",
    organizer: "Direktorat Jenderal Guru dan Tenaga Kependidikan",
    year: "2020",
    showOnFront: false
  },
  {
    id: "dev_pdf_65",
    type: "Seminar/Webinar",
    title: "Merdeka Belajar Berkualitas",
    organizer: "Indonesia Bermutu",
    year: "2020",
    showOnFront: false
  },
  {
    id: "dev_pdf_66",
    type: "Seminar/Webinar",
    title: "Penguatan Pendidikan Karakter Dengan Kesadaran Jiwa Pancasila",
    organizer: "Komisi Nasional Pendidikan Provinsi Jawa Timur",
    year: "2020",
    hours: 8,
    showOnFront: false
  },
  {
    id: "dev_pdf_67",
    type: "Seminar/Webinar",
    title: "Mengenal Teknologi VR untuk Pembelajaran",
    organizer: "Ikatan Guru Indonesia (IGI) Kabupaten Gresik",
    year: "2020",
    showOnFront: false
  },
  {
    id: "dev_pdf_68",
    type: "Seminar/Webinar",
    title: "Webinar Berkarya, Berbagi, dan Menginspirasi",
    organizer: "IGI Kab. Sintang dan Universitas AMIKOM Purwokerto",
    year: "2020",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_69",
    type: "Seminar/Webinar",
    title: "Menjadi Guru di Rumah, Menjadi Guru dari Rumah",
    organizer: "LP2M Universitas Negeri Malang",
    year: "2020",
    showOnFront: false
  },
  {
    id: "dev_pdf_70",
    type: "Pelatihan",
    title: "Merancang Game PowerPoint Interaktif untuk Kelas Online",
    organizer: "Kanal Pelatihan IGI (Ikatan Guru Indonesia) SAMISANOV",
    year: "2020",
    showOnFront: false
  },
  {
    id: "dev_pdf_71",
    type: "Seminar/Webinar",
    title: "Salam, Sapa, dan Diskusi (SSD) bersama ITJEN KEMENDIKBUD RI dengan tema “Perjuangan Pendidik dalam Menghadapi Masa Pandemi”",
    organizer: "INDONESIAN YOUTH EDUCATION MOVEMENT",
    year: "2020",
    showOnFront: false
  },
  {
    id: "dev_pdf_72",
    type: "Seminar/Webinar",
    title: "Tantangan Pembelajaran di Masa New Normal",
    organizer: "Ikatan Alumni UM Wiayah Surabaya, Sidoarjo, dan Gresik",
    year: "2020",
    showOnFront: false
  },
  {
    id: "dev_pdf_73",
    type: "Seminar/Webinar",
    title: "Webinar Sesi 1 PGRI Tulungagung Pembelajaran Daring dengan Office 365",
    organizer: "Persatuan Guru Republik Indonesia (PGRI) Kabupaten Tulungagung",
    year: "2020",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_74",
    type: "Diklat",
    title: "Diklat Matematika Tingkat Pendidikan Dasar",
    organizer: "Yayasan Surya Nusa Cendekia Yogyakarta",
    year: "2020",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_75",
    type: "Bimtek",
    title: "Penguatan Implementasi Kurikulum 2013 Jenjang Sekolah Dasar",
    organizer: "Dinas Pendidikan Pemuda dan Olahraga Kab. Tulungagung",
    year: "2019",
    showOnFront: false
  },
  {
    id: "dev_pdf_76",
    type: "Pelatihan",
    title: "Pelatihan Dasar (LATSAR) Calon Pegawai Negeri Sipil Golongan III",
    organizer: "Badan Pengembangan Sumber Daya Manusia Provinsi Jawa Timur",
    year: "2019",
    hours: 511,
    showOnFront: false
  },
  {
    id: "dev_pdf_77",
    type: "Pelatihan",
    title: "Pembekalan Calon Pegawai Negeri Sipil Tahun 2018",
    organizer: "Badan Kepegawaian Daerah Kabupaten Tulungagung",
    year: "2019",
    showOnFront: false
  },
  {
    id: "dev_pdf_78",
    type: "Bimtek",
    title: "BIMBINGAN TEKNIS IMPLEMENTASI KURIKULUM 2013 BAGI GURU KELAS 2 DAN 5 UNTUK PEMBELAJARAN DI SEKOLAH DASAR",
    organizer: "UPT DINAS PENDIDIKAN PEMUDA DAN OLAH RAGA KECAMATAN KARANGREJO",
    year: "2019",
    hours: 32,
    showOnFront: false
  },
  {
    id: "dev_pdf_79",
    type: "Pelatihan",
    title: "STRATEGI PENYUSUNAN KARYA TULIS YANG ACCEPTABLE QUALIFIED DAN KONSEP PENILAIAN KURIKULUM 2013",
    organizer: "LEMBAGA PELATIHAN DAN PENGEMBANGAN PROFESI GURU PROVINSI JAWA TIMUR (LPPPG) DAN DINAS PENDIDIKAN KABUPATEN TULUNGAGUNG",
    year: "2019",
    hours: 32,
    showOnFront: false
  }
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "ach_1",
    title: "Pemenang Utama Anugerah Guru Prima (AGP)",
    rank: "Juara 1",
    level: "Nasional",
    year: "2025",
    organizer: "Yayasan Guru Prima Indonesia",
    description: "Penghargaan atas inovasi pembelajaran fisika interaktif 'CAKRA' dan dedikasi luar biasa dalam pengembangan komunitas belajar."
  },
  {
    id: "ach_2",
    title: "Guru Berprestasi Provinsi DKI Jakarta",
    rank: "Juara 2",
    level: "Provinsi",
    year: "2024",
    organizer: "Dinas Pendidikan Provinsi DKI Jakarta",
    description: "Evaluasi portofolio, karya inovatif, tes kompetensi pedagogik, wawancara, dan presentasi best practice."
  },
  {
    id: "ach_3",
    title: "Pembimbing Olimpiade Sains Nasional (OSN) Fisika",
    rank: "Medali Emas Siswa Bina",
    level: "Nasional",
    year: "2023",
    organizer: "Puspresnas / Kemendikbudristek",
    description: "Membina siswa atas nama Muhammad Al-Fatih meraih Medali Emas OSN Fisika tingkat Nasional di Bogor."
  }
];

const INITIAL_WORKS: WorkAndPublication[] = [
  {
    id: "work_1",
    type: "Buku",
    title: "Fisika Menyenangkan: Konseptualisasi & Aplikasi Sehari-hari",
    year: "2023",
    publisher: "Pustaka Pendidik Indonesia (Ber-ISBN)",
    description: "Buku referensi pembelajaran Fisika kelas X dengan pendekatan eksperimen sederhana di rumah.",
    coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=250"
  },
  {
    id: "work_2",
    type: "PTK",
    title: "Peningkatan Hasil Belajar Mekanika Melalui Pembelajaran Berbasis Proyek Berbantuan Aplikasi CAKRA",
    year: "2024",
    publisher: "Jurnal Ilmiah Pendidikan Indonesia (JIPI)",
    description: "Penelitian Tindakan Kelas (2 Siklus) membuktikan efektivitas integrasi digital dalam meningkatkan keaktifan siswa.",
    coverUrl: ""
  },
  {
    id: "work_3",
    type: "Modul Ajar",
    title: "Modul Pembelajaran Fisika Fase F: Alat Optik dan Gelombang",
    year: "2024",
    publisher: "Pusat Kurikulum dan Perbukuan (Platform Merdeka Mengajar)",
    description: "Modul interaktif dengan tautan simulasi PHet dan kuis terintegrasi Google Form.",
    coverUrl: ""
  },
  {
    id: "work_4",
    type: "Video Pembelajaran",
    title: "Konsep Gelombang Elektromagnetik dan Aplikasinya di Era Digital",
    year: "2024",
    publisher: "Kanal Edukasi Asnadi (YouTube)",
    url: "https://youtube.com/watch?v=example",
    description: "Video animasi 3D yang menjelaskan sifat, spektrum, dan manfaat gelombang elektromagnetik.",
    coverUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=250"
  }
];

const INITIAL_INNOVATIONS: Innovation[] = [
  {
    id: "inn_1",
    name: "CAKRA (Cermati - Analisis - Kembangkan - Rilis - Apresiasi)",
    logoIcon: "Compass",
    background: "Pembelajaran Fisika seringkali dianggap terlalu teoretis dan menakutkan oleh peserta didik. Kurangnya koneksi antara rumus matematis dengan fenomena dunia nyata membuat motivasi belajar siswa menurun drastis, terutama pada materi Kinematika dan Dinamika Gerak.",
    problem: "Rendahnya motivasi dan pemahaman konsep fisika siswa kelas XI (rata-rata nilai prasiklus 62.4). Metode konvensional gagal memberikan ruang kreasi mandiri siswa.",
    solution: "Mengembangkan platform dan alur belajar digital CAKRA. Model ini mengintegrasikan pengamatan video fenomena sehari-hari, simulasi komputer, rancang bangun proyek fisik, rilis karya siswa di media sosial, dan apresiasi berbasis peer-assessment.",
    objective: "Meningkatkan hasil belajar fisika hingga >80% tuntas, menumbuhkan Profil Pelajar Pancasila (Kreatif & Gotong Royong), serta meningkatkan rasa percaya diri siswa dalam mengomunikasikan sains.",
    syntax: [
      "CERMATI: Siswa mengamati video fenomena fisika kontekstual yang terjadi di sekitar mereka via aplikasi virtual.",
      "ANALISIS: Siswa melakukan bedah masalah dan menurunkan formula matematis berdasarkan simulasi interaktif PhET.",
      "KEMBANGKAN: Siswa secara berkelompok merancang produk prototipe sains (misalnya roket air atau ketapel hidrostatik).",
      "RILIS: Hasil karya video proyek diunggah di YouTube, TikTok, atau dipamerkan di pameran sains sekolah.",
      "APRESIASI: Teman sejawat dan guru memberikan penilaian interaktif dan penghargaan digital (e-certificate/lencana)."
    ],
    diagramDescription: "Alur Proses Siklik CAKRA: Mulai dari Cermati (Stimulasi) -> Analisis (Konseptualisasi) -> Kembangkan (Kreasi) -> Rilis (Publikasi) -> Apresiasi (Refleksi) -> Kembali ke Stimulasi baru.",
    implementation: "Diterapkan pada kelas XI-MIPA SMAN 1 Jakarta tahun ajaran 2024/2025. Menggunakan LMS terintegrasi Google Classroom dan situs Google Sites portofolio siswa.",
    documentationUrls: [
      "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600"
    ],
    impact: "Peningkatan nilai rata-rata kelas secara masif dari 62.4 ke 85.8. Keaktifan kolaboratif siswa meningkat 42%. Produk inovasi ini diadopsi oleh 5 sekolah lain di Jakarta Pusat sebagai model percontohan.",
    statsLabel: "Peningkatan Ketuntasan Siswa",
    statsValue: "94.5%",
    videoUrl: "https://youtube.com/watch?v=example_cakra",
    documentUrl: ""
  }
];

const INITIAL_BEST_PRACTICES: BestPractice[] = [
  {
    id: "bp_1",
    title: "Implementasi Flipped Classroom dan Pembelajaran Berdiferensiasi pada Materi Optika Geometris",
    situation: "Siswa kesulitan memvisualisasikan jalannya sinar pada cermin dan lensa dalam waktu pembelajaran tatap muka yang terbatas. Tingkat pemahaman siswa sangat beragam: sebagian cepat memahami rumus, sebagian kesulitan menggambar diagram pembentukan bayangan.",
    challenge: "Mengharmonisasikan keragaman gaya belajar siswa (visual, auditori, kinestetik) tanpa mengorbankan kedalaman materi dalam durasi 2 JP tatap muka.",
    action: "Sebelum kelas dimulai, siswa mempelajari konsep dasar via video animasi mandiri (Flipped Classroom). Di dalam kelas, siswa dikelompokkan berdiferensiasi: Kelompok Visual menggambar diagram bayangan menggunakan Geogebra, Kelompok Kinestetik melakukan eksperimen riil di lab, dan Kelompok Auditori menganalisis masalah kontekstual.",
    reflection: "Siswa menjadi lebih mandiri, aktif berdiskusi di dalam kelas, dan guru bertindak sebagai fasilitator sejati (bukan lagi penceramah tunggal). Pembelajaran terbukti lebih ramah siswa.",
    impact: "Siswa merasa dihargai sesuai gaya belajarnya. Nilai ujian harian optik menunjukkan ketuntasan klasikal mencapai 100% dari total 36 siswa.",
    supportingEvidenceUrls: [
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600"
    ]
  }
];

const INITIAL_IMPACTS: StudentImpact[] = [
  {
    id: "imp_1",
    title: "Grafik Perkembangan Keterampilan Proses Sains Siswa (Sebelum dan Sesudah Penerapan Model CAKRA)",
    initialCondition: "Keterampilan merumuskan hipotesis siswa sangat lemah (hanya 35% siswa yang menguasai). Sebagian besar siswa pasif dalam praktikum fisika mandiri dan takut salah dalam mengolah angka hasil ukur.",
    intervention: "Penerapan siklus CAKRA secara konsisten selama 3 bulan, ditunjang pembinaan intensif berkelompok dengan LKPD terstruktur berbasis scaffolding.",
    finalCondition: "Siswa terbiasa menganalisis data eksperimen menggunakan spreadsheet. 88% siswa kini terampil mengonstruksi hipotesis dan menyusun laporan ilmiah berbasis digital secara mandiri.",
    chartLabels: ["Merumuskan Masalah", "Hipotesis", "Mengolah Data", "Menganalisis Grafik", "Menarik Kesimpulan"],
    chartInitialValues: [48, 35, 42, 30, 38],
    chartFinalValues: [82, 88, 85, 78, 84],
    documentationUrls: [
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600"
    ]
  }
];

const INITIAL_COMPETENCIES: TeacherCompetency[] = [
  {
    id: "pedagogik",
    name: "Kompetensi Pedagogik",
    score: 92,
    description: "Kemampuan dalam pemahaman terhadap peserta didik, perancangan dan pelaksanaan pembelajaran, evaluasi hasil belajar, dan pengembangan peserta didik untuk mengaktualisasikan berbagai potensi yang dimilikinya.",
    evidences: [
      "Rancangan RPP/Modul Ajar berdiferensiasi lengkap di PMM",
      "Instrumen penilaian formatif berbasis rubrik interaktif",
      "Dokumentasi tindak lanjut umpan balik evaluasi hasil belajar"
    ]
  },
  {
    id: "profesional",
    name: "Kompetensi Profesional",
    score: 95,
    description: "Kemampuan penguasaan materi pembelajaran secara luas dan mendalam, termasuk penguasaan konsep, struktur, metode keilmuan fisika, serta integrasinya dengan konteks dunia nyata.",
    evidences: [
      "Penerbitan Buku ber-ISBN 'Fisika Menyenangkan'",
      "Pembuat konten video pembelajaran fisika di YouTube",
      "Pelatihan berkala Fisika Modern (BBGP & UNJ)"
    ]
  },
  {
    id: "sosial",
    name: "Kompetensi Sosial",
    score: 88,
    description: "Kemampuan guru untuk berkomunikasi dan bergaul secara efektif dengan peserta didik, sesama pendidik, tenaga kependidikan, orang tua/wali peserta didik, dan masyarakat sekitar.",
    evidences: [
      "Pembicara/Narasumber regional MGMP Fisika DKI Jakarta",
      "Koordinator Penggalangan Dana Sosial Komunitas Sekolah",
      "Inisiator kemitraan komite sekolah dalam pameran sains siswa"
    ]
  },
  {
    id: "kepribadian",
    name: "Kompetensi Kepribadian",
    score: 94,
    description: "Kemampuan personal yang mencerminkan kepribadian yang mantap, stabil, dewasa, arif, berwibawa, menjadi teladan bagi peserta didik, dan berakhlak mulia.",
    evidences: [
      "Meraih predikat PNS Teladan SMAN 1 Jakarta 2023",
      "Konsistensi presensi kehadiran dan ketepatan waktu mendidik",
      "Rekomendasi tertulis dari Kepala Sekolah dan Pengawas Pembina"
    ]
  }
];

const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: "org_1",
    name: "Persatuan Guru Republik Indonesia (PGRI) Cabang Jakarta Pusat",
    role: "Anggota Aktif & Bidang Litbang",
    startYear: "2011",
    endYear: "Sekarang"
  },
  {
    id: "org_2",
    name: "Musyawarah Guru Mata Pelajaran (MGMP) Fisika SMA DKI Jakarta",
    role: "Sekretaris II",
    startYear: "2018",
    endYear: "2021"
  },
  {
    id: "org_3",
    name: "Komunitas Praktisi Guru Penggerak Jakarta Pusat",
    role: "Ketua / Inisiator",
    startYear: "2023",
    endYear: "Sekarang"
  }
];

const INITIAL_GALLERY: Gallery[] = [
  {
    id: "gal_1",
    category: "Mengajar",
    title: "Praktikum Hukum Archimedes Berbantuan Sensor HP",
    description: "Siswa melakukan pengukuran gaya apung secara langsung di laboratorium fisika menggunakan aplikasi sensor phyphox.",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=500",
    date: "2024-02-14"
  },
  {
    id: "gal_2",
    category: "Guru Penggerak",
    title: "Lokakarya 7 Panen Hasil Belajar Guru Penggerak",
    description: "Pameran karya aksi nyata dan program inovatif Guru Penggerak Angkatan 5 Jakarta Pusat.",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=500",
    date: "2023-05-20"
  },
  {
    id: "gal_3",
    category: "AGP",
    title: "Penerimaan Trofi Anugerah Guru Prima (AGP) 2025",
    description: "Penganugerahan piala bergilir guru inspiratif nasional di Kemendikbudristek RI.",
    imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=500",
    date: "2025-11-25"
  },
  {
    id: "gal_4",
    category: "Pramuka",
    title: "Kemah Bakti Karakter dan Literasi Sains SMAN 1 Jakarta",
    description: "Membimbing pramuka bantara dalam kegiatan pemetaan bintang menggunakan teropong teleskop malam.",
    imageUrl: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=500",
    date: "2024-09-08"
  }
];

const INITIAL_CERTIFICATES: Certificate[] = [
  {
    id: "cert_1",
    name: "Sertifikat Pendidik Profesional (Fisika)",
    category: "Serdik",
    number: "10250043121029",
    issuer: "LPTK Universitas Negeri Jakarta",
    date: "2012-11-30"
  },
  {
    id: "cert_2",
    name: "Sertifikat Guru Penggerak Kemendikbudristek",
    category: "Kementerian",
    number: "3944/B5.2/GP.05/2023",
    issuer: "Kemendikbudristek RI",
    date: "2023-06-15"
  },
  {
    id: "cert_3",
    name: "Google Certified Educator Level 1",
    category: "Sertifikasi Global",
    number: "GCE-9321455-2023",
    issuer: "Google for Education",
    date: "2023-09-12"
  }
];

const INITIAL_DOCUMENTS: Document[] = [
  {
    id: "doc_1",
    name: "Modul Ajar Fisika Berdiferensiasi Lengkap Fase F Kelas XI",
    category: "Modul Ajar",
    description: "File modul ajar PDF lengkap dengan instrumen asesmen diagnostik dan formatif untuk semester ganjil.",
    uploadDate: "2024-07-10"
  },
  {
    id: "doc_2",
    name: "Laporan Best Practice Pembelajaran Metode STAR",
    category: "Laporan",
    description: "Laporan komprehensif implementasi flipped classroom pada materi Gelombang Elektromagnetik.",
    uploadDate: "2024-05-01"
  }
];

const INITIAL_ARTICLES: Article[] = [
  {
    id: "art_1",
    title: "Menumbuhkan Kepemimpinan Murid (Student Agency) Lewat Pembelajaran Berbasis Projek",
    slug: "menumbuhkan-kepemimpinan-murid-pbl",
    content: "Kepemimpinan murid (student agency) bukan sekadar membiarkan murid bertindak semau mereka. Di era Kurikulum Merdeka, kita menuntun murid untuk mengambil kepemilikan atas proses belajarnya. \n\nMelalui Pembelajaran Berbasis Projek (Project-Based Learning), murid diberikan hak suara (voice), pilihan (choice), dan kepemilikan (ownership). \n\nSebagai contoh, saat merancang projek roket air pada materi fluida dinamis, kelompok murid berhak memilih alat bahan alternatif yang sesuai, membagi tugas mandiri, dan mementaskan rilis video mereka secara kolaboratif. Guru tidak lagi mendikte melainkan mendampingi sebagai coach yang sabar.",
    category: "Opini Pendidikan",
    date: "2024-03-12",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400",
    isVisible: true
  },
  {
    id: "art_2",
    title: "Integrasi Artificial Intelligence (AI) secara Bijak di Kelas Fisika Modern",
    slug: "integrasi-ai-kelas-fisika-modern",
    content: "Kecerdasan Buatan (AI) bukanlah musuh yang harus dijauhi dari ruang kelas kita. Justru, AI dapat dimanfaatkan sebagai asisten belajar personal murid. \n\nDalam kelas Fisika, kami menggunakan AI untuk memberikan visualisasi skenario soal konseptual, menghasilkan kode dasar simulasi gerak partikel, serta menyusun umpan balik cepat terhadap pemecahan masalah matematika fisika. \n\nTantangan utama guru adalah mengajarkan etika digital (digital citizenship): bagaimana memverifikasi output AI, mengutip sumber ilmiah dengan benar, serta melatih kemampuan berpikir kritis untuk menyaring halusinasi informasi komputer.",
    category: "Inovasi Pembelajaran",
    date: "2024-06-18",
    imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=400",
    isVisible: true
  }
];

const INITIAL_SETTINGS: WebsiteSettings = {
  siteTitle: "Portofolio Digital Guru",
  seoTitle: "Portofolio Guru",
  seoDescription: "Website resmi portofolio digital guru. CMS Media Arsip Kompetensi, Karya Inovatif, Best Practice, dan Personal Branding Profesional.",
  accentColor: "blue",
  isDarkMode: false,
  menuVisibility: {
    beranda: true,
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
    galeri: true,
    sertifikat: true,
    dokumen: true,
    artikel: true,
    kontak: true
  },
  pdfVisibility: {
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
  }
};

const EMPTY_PROFILE: Profile = {
  fullName: "",
  title: "",
  position: "",
  workUnit: "",
  motto: "",
  photoUrl: "",
  cvUrl: "",
  nip: "",
  nuptk: "",
  rank: "",
  bio: "",
  email: "",
  phone: "",
  address: "",
  socials: {
    facebook: "",
    instagram: "",
    youtube: "",
    tiktok: ""
  }
};

const DEFAULT_PORTFOLIO_DATA: PortfolioData = {
  profile: EMPTY_PROFILE,
  education: [],
  career: [],
  additionalTasks: [],
  developmentEvents: [],
  achievements: [],
  works: [],
  innovations: [],
  bestPractices: [],
  studentImpacts: [],
  competencies: [],
  organizations: [],
  gallery: [],
  certificates: [],
  documents: [],
  articles: [],
  contactMessages: [],
  settings: INITIAL_SETTINGS
};

// ----------------------------------------------------
// LOCAL STORAGE KEY
// ----------------------------------------------------
const LOCAL_STORAGE_KEY = "guru_portfolio_cms_v1";

// ----------------------------------------------------
// MAIN DATABASE SERVICE
// ----------------------------------------------------
class DatabaseService {
  private localData: PortfolioData;

  constructor() {
    this.localData = this.loadLocal();
    this.initAnalytics();
  }

  // Load from localStorage or seed
  private loadLocal(): PortfolioData {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.settings && (parsed.settings.siteTitle === "Portofolio Guru Profesional" || !parsed.settings.siteTitle)) {
          parsed.settings.siteTitle = "Portofolio Digital Guru";
        }
        
        // Ensure all collections are loaded and have correct keys
        const mergedData = {
          ...DEFAULT_PORTFOLIO_DATA,
          ...parsed,
          developmentEvents: parsed.developmentEvents || [],
          profile: { ...DEFAULT_PORTFOLIO_DATA.profile, ...parsed.profile },
          additionalTasks: parsed.additionalTasks || [],
          settings: { ...DEFAULT_PORTFOLIO_DATA.settings, ...parsed.settings }
        };

        // Persist merged data back to local storage so it registers immediately
        this.saveLocal(mergedData);
        return mergedData;
      } catch (e) {
        console.error("Local storage corruption. Reseeding with default portfolio data.", e);
        this.saveLocal(DEFAULT_PORTFOLIO_DATA);
        return DEFAULT_PORTFOLIO_DATA;
      }
    } else {
      this.saveLocal(DEFAULT_PORTFOLIO_DATA);
      return DEFAULT_PORTFOLIO_DATA;
    }
  }

  private saveLocal(data: PortfolioData) {
    this.localData = data;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }

  // Sync state to Firebase if connected
  async syncToFirebase(): Promise<boolean> {
    if (!isFirebaseConnected || !db) return false;
    try {
      // Save entire localData to Firebase as atomic collections or a flat master collection
      // For simple, incredibly robust real-time operations, we will maintain the master collections.
      // Profile doc
      await setDoc(doc(db, "portfolio", "profile"), this.localData.profile);
      await setDoc(doc(db, "portfolio", "settings"), this.localData.settings);

      // Other entities
      const entities = [
        { name: "education", data: this.localData.education },
        { name: "career", data: this.localData.career },
        { name: "additionalTasks", data: this.localData.additionalTasks || [] },
        { name: "developmentEvents", data: this.localData.developmentEvents },
        { name: "achievements", data: this.localData.achievements },
        { name: "works", data: this.localData.works },
        { name: "innovations", data: this.localData.innovations },
        { name: "bestPractices", data: this.localData.bestPractices },
        { name: "studentImpacts", data: this.localData.studentImpacts },
        { name: "competencies", data: this.localData.competencies },
        { name: "organizations", data: this.localData.organizations },
        { name: "gallery", data: this.localData.gallery },
        { name: "certificates", data: this.localData.certificates },
        { name: "documents", data: this.localData.documents },
        { name: "articles", data: this.localData.articles },
        { name: "contactMessages", data: this.localData.contactMessages }
      ];

      for (const entity of entities) {
        await setDoc(doc(db, "portfolio", entity.name), { list: entity.data });
      }

      console.log("Synced all data to Firebase Firestore.");
      return true;
    } catch (error) {
      console.error("Failed to sync to Firebase:", error);
      return false;
    }
  }

  // Load from Firebase if connected, otherwise use local
  async loadFromFirebase(): Promise<boolean> {
    if (!isFirebaseConnected || !db) return false;
    try {
      const profileSnap = await getDoc(doc(db, "portfolio", "profile"));
      
      // If the profile document doesn't exist in Firebase yet, automatically seed the initial dummy data to Firebase
      if (!profileSnap.exists()) {
        console.log("Firebase has no existing data. Seeding initial dummy data to Firebase Firestore...");
        const seedSuccess = await this.syncToFirebase();
        if (seedSuccess) {
          console.log("Initial seed to Firebase completed successfully.");
          return true;
        } else {
          console.warn("Seeding initial dummy data to Firebase failed.");
        }
      }

      const settingsSnap = await getDoc(doc(db, "portfolio", "settings"));

      if (profileSnap.exists()) {
        this.localData.profile = profileSnap.data() as Profile;
      }
      if (settingsSnap.exists()) {
        this.localData.settings = settingsSnap.data() as WebsiteSettings;
      }

      const entities = [
        "education", "career", "additionalTasks", "developmentEvents", "achievements", "works",
        "innovations", "bestPractices", "studentImpacts", "competencies",
        "organizations", "gallery", "certificates", "documents", "articles", "contactMessages"
      ];

      for (const entName of entities) {
        const snap = await getDoc(doc(db, "portfolio", entName));
        if (snap.exists()) {
          let listData = snap.data()?.list;
          if (Array.isArray(listData)) {
            (this.localData as any)[entName] = listData;
          }
        }
      }

      this.saveLocal(this.localData);

      console.log("Loaded data from Firebase Firestore successfully.");
      return true;
    } catch (error) {
      console.warn("Failed to load from Firebase. Using local cached data.", error);
      return false;
    }
  }

  // Get full portfolio data (Synchronous)
  getPortfolioData(): PortfolioData {
    return this.localData;
  }

  // Profile operations
  async updateProfile(profile: Profile): Promise<Profile> {
    const updated = { ...this.localData.profile, ...profile };
    this.localData.profile = updated;
    this.saveLocal(this.localData);

    if (isFirebaseConnected && db) {
      try {
        await setDoc(doc(db, "portfolio", "profile"), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, "portfolio/profile");
      }
    }
    return updated;
  }

  // Settings operations
  async updateSettings(settings: WebsiteSettings): Promise<WebsiteSettings> {
    const updated = { ...this.localData.settings, ...settings };
    this.localData.settings = updated;
    this.saveLocal(this.localData);

    if (isFirebaseConnected && db) {
      try {
        await setDoc(doc(db, "portfolio", "settings"), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, "portfolio/settings");
      }
    }
    return updated;
  }

  // Generic List operations (CRUD)
  async saveListEntity<T extends { id: string }>(
    entityKey: keyof Omit<PortfolioData, "profile" | "settings">,
    item: T
  ): Promise<T[]> {
    const list = [...(this.localData[entityKey] as unknown as T[])];
    const index = list.findIndex(i => i.id === item.id);
    
    if (index >= 0) {
      list[index] = item; // Edit
    } else {
      list.push(item); // Add
    }

    (this.localData as any)[entityKey] = list;
    this.saveLocal(this.localData);

    if (isFirebaseConnected && db) {
      try {
        await setDoc(doc(db, "portfolio", String(entityKey)), { list });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `portfolio/${String(entityKey)}`);
      }
    }
    return list;
  }

  async saveFullList<T extends { id: string }>(
    entityKey: keyof Omit<PortfolioData, "profile" | "settings">,
    list: T[]
  ): Promise<T[]> {
    (this.localData as any)[entityKey] = list;
    this.saveLocal(this.localData);

    if (isFirebaseConnected && db) {
      try {
        await setDoc(doc(db, "portfolio", String(entityKey)), { list });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `portfolio/${String(entityKey)}`);
      }
    }
    return list;
  }

  async deleteListEntity<T extends { id: string }>(
    entityKey: keyof Omit<PortfolioData, "profile" | "settings">,
    id: string
  ): Promise<T[]> {
    const list = (this.localData[entityKey] as unknown as T[]).filter(i => i.id !== id);
    (this.localData as any)[entityKey] = list;
    this.saveLocal(this.localData);

    if (isFirebaseConnected && db) {
      try {
        await setDoc(doc(db, "portfolio", String(entityKey)), { list });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `portfolio/${String(entityKey)}`);
      }
    }
    return list;
  }

  // Backup and Restore
  exportBackup(): string {
    return JSON.stringify(this.localData, null, 2);
  }

  async importBackup(jsonString: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.profile || !parsed.settings) {
        throw new Error("Invalid format. Profile or Settings are missing.");
      }
      this.localData = {
        ...DEFAULT_PORTFOLIO_DATA,
        ...parsed
      };
      this.saveLocal(this.localData);
      
      // Sync to firebase if ready
      if (isFirebaseConnected && db) {
        await this.syncToFirebase();
      }
      return true;
    } catch (e) {
      console.error("Backup import failed:", e);
      return false;
    }
  }

  // ----------------------------------------------------
  // ANALYTICS ENGINE (Visitor counts, download counts)
  // ----------------------------------------------------
  initAnalytics() {
    const views = localStorage.getItem("guru_views_total") || "1248";
    const viewsToday = localStorage.getItem("guru_views_today") || "24";
    const viewsMonth = localStorage.getItem("guru_views_month") || "312";
    const downloads = localStorage.getItem("guru_cv_downloads") || "98";

    // Randomize initial visitor spikes Context-Awarely
    localStorage.setItem("guru_views_total", String(parseInt(views)));
    localStorage.setItem("guru_views_today", String(parseInt(viewsToday)));
    localStorage.setItem("guru_views_month", String(parseInt(viewsMonth)));
    localStorage.setItem("guru_cv_downloads", String(parseInt(downloads)));
  }

  getAnalytics(): { totalViews: number; todayViews: number; monthlyViews: number; downloads: number } {
    return {
      totalViews: parseInt(localStorage.getItem("guru_views_total") || "1248"),
      todayViews: parseInt(localStorage.getItem("guru_views_today") || "24"),
      monthlyViews: parseInt(localStorage.getItem("guru_views_month") || "312"),
      downloads: parseInt(localStorage.getItem("guru_cv_downloads") || "98")
    };
  }

  incrementView() {
    const total = parseInt(localStorage.getItem("guru_views_total") || "1248") + 1;
    const today = parseInt(localStorage.getItem("guru_views_today") || "24") + 1;
    const month = parseInt(localStorage.getItem("guru_views_month") || "312") + 1;

    localStorage.setItem("guru_views_total", String(total));
    localStorage.setItem("guru_views_today", String(today));
    localStorage.setItem("guru_views_month", String(month));
  }

  incrementDownload() {
    const count = parseInt(localStorage.getItem("guru_cv_downloads") || "98") + 1;
    localStorage.setItem("guru_cv_downloads", String(count));
  }
}

export const dbService = new DatabaseService();
