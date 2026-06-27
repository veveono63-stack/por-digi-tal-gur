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
  fullName: "Budi Rahardjo, S.Pd., M.Pd.",
  title: "Guru Penggerak & Pendidik Ahli Madya",
  position: "Guru Fisika / Pembina Olimpiade Sains",
  workUnit: "SMAN 1 Jakarta",
  motto: "Menuntun kodrat alam dan kodrat zaman peserta didik agar selamat dan bahagia setinggi-tingginya sebagai manusia dan anggota masyarakat.",
  photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=350", // High quality profile photo
  cvUrl: "",
  nip: "19840212 201001 1 005",
  nuptk: "4325762664130122",
  rank: "Pembina, IV/a",
  bio: "Saya adalah seorang pendidik Fisika profesional yang berdedikasi tinggi dengan pengalaman lebih dari 15 tahun di bidang pendidikan menengah atas. Sebagai lulusan S2 Manajemen Pendidikan dan alumni Program Guru Penggerak Angkatan 5, saya berfokus pada inovasi pembelajaran berdiferensiasi, pemanfaatan teknologi pendidikan, dan pengimbasan praktik baik kepada komunitas belajar praktisi di DKI Jakarta.",
  email: "budirahardjo@admin.sma.sch.id",
  phone: "+62 812-3456-7890",
  address: "Jl. Budi Utomo No. 7, Sawah Besar, Jakarta Pusat, DKI Jakarta",
  socials: {
    facebook: "https://facebook.com/budi.rahardjo.edu",
    instagram: "https://instagram.com/budi_rahardjo_physics",
    youtube: "https://youtube.com/c/BudiRahardjoPhysicsChannel",
    tiktok: "https://www.tiktok.com/@budi_rahardjo_physics"
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
    id: "dev_1",
    type: "Diklat",
    title: "Pendidikan Guru Penggerak Angkatan 5",
    organizer: "BBGP Provinsi DKI Jakarta / Kemendikbudristek",
    date: "2022-10-15",
    hours: 310
  },
  {
    id: "dev_2",
    type: "Workshop",
    title: "Penyusunan Modul Ajar dan Asesmen Kurikulum Merdeka",
    organizer: "Dinas Pendidikan DKI Jakarta",
    date: "2023-03-22",
    hours: 32
  },
  {
    id: "dev_3",
    type: "Narasumber",
    title: "Praktik Baik Pembelajaran Diferensiasi Berbantuan AI",
    organizer: "MGMP Fisika SMA Provinsi DKI Jakarta",
    date: "2024-05-11",
    hours: 4
  },
  {
    id: "dev_4",
    type: "Pelatihan",
    title: "Google Certified Educator Level 1 & 2 Course",
    organizer: "REFO Indonesia",
    date: "2023-08-10",
    hours: 64
  },
  {
    id: "dev_5",
    type: "Seminar",
    title: "International Conference on Science Education",
    organizer: "Universitas Negeri Jakarta",
    date: "2024-11-20"
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
    publisher: "Physics Channel Budi (YouTube)",
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
  seoTitle: "Budi Rahardjo, S.Pd., M.Pd. | Portofolio Guru Penggerak",
  seoDescription: "Website resmi portofolio digital Budi Rahardjo, S.Pd., M.Pd. - Guru Penggerak & Pendidik Ahli Madya SMAN 1 Jakarta. CMS Media Arsip Kompetensi, Karya Inovatif, Best Practice, dan Personal Branding Profesional.",
  accentColor: "blue",
  isDarkMode: false,
  menuVisibility: {
    beranda: true,
    profil: true,
    pendidikan: true,
    karier: true,
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
  }
};

const DEFAULT_PORTFOLIO_DATA: PortfolioData = {
  profile: INITIAL_PROFILE,
  education: INITIAL_EDUCATION,
  career: INITIAL_CAREER,
  additionalTasks: INITIAL_ADDITIONAL_TASKS,
  developmentEvents: INITIAL_EVENTS,
  achievements: INITIAL_ACHIEVEMENTS,
  works: INITIAL_WORKS,
  innovations: INITIAL_INNOVATIONS,
  bestPractices: INITIAL_BEST_PRACTICES,
  studentImpacts: INITIAL_IMPACTS,
  competencies: INITIAL_COMPETENCIES,
  organizations: INITIAL_ORGANIZATIONS,
  gallery: INITIAL_GALLERY,
  certificates: INITIAL_CERTIFICATES,
  documents: INITIAL_DOCUMENTS,
  articles: INITIAL_ARTICLES,
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
        return {
          ...DEFAULT_PORTFOLIO_DATA,
          ...parsed,
          profile: { ...DEFAULT_PORTFOLIO_DATA.profile, ...parsed.profile },
          additionalTasks: parsed.additionalTasks || DEFAULT_PORTFOLIO_DATA.additionalTasks || [],
          settings: { ...DEFAULT_PORTFOLIO_DATA.settings, ...parsed.settings }
        };
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
          const listData = snap.data()?.list;
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
