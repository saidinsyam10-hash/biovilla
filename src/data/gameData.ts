import { Stage } from '../types';

export const titleScreenData = {
  title: "Misi Petualangan Desa Sel",
  subtitle: "BioVillage Simulator — Petualangan Edukasi Biologi Sel",
  video: "asset 001",
  introduction: `
<p><strong>Selamat datang di Misi Petualangan Desa Sel!</strong></p>

<p>Tahukah kamu bahwa setiap bagian kecil dalam unit kehidupan saling bekerja sama untuk menjaga kelangsungan hidup? Sama seperti sebuah desa yang memiliki balai desa, pelabuhan, hingga pusat pengolahan sampah, setiap organel dalam sel memiliki peran vitalnya masing-masing. Jika salah satu fungsinya terganggu, seluruh kehidupan sel dapat terancam.</p>

<p>Dalam petualangan ini, kamu akan menjadi <strong>Pengelola Desa Sel</strong>. Jelajahi setiap fasilitas, pecahkan tantangan menarik, dan temukan bagaimana seluruh organel berkolaborasi membentuk kehidupan yang harmonis.</p>

<p><strong>Selesaikan misi dalam petualangan ini, dan kamu akan mampu:</strong></p>

<ul>
\t<li>🌿 Menganalisis peran membran sel sebagai gerbang pengatur lalu lintas zat masuk dan keluar.</li>
\t<li>🏛️ Mengidentifikasi fungsi inti sel (nukleus) sebagai pusat komando dan penyimpan informasi genetik.</li>
\t<li>🚢 Memahami sistem transportasi dan pengolahan molekul pada retikulum endoplasma dan badan golgi.</li>
\t<li>⚡ Menjelaskan proses pembentukan energi kehidupan pada mitokondria dan kloroplas.</li>
\t<li>♻️ Memprediksi dampak gangguan pengelolaan limbah seluler oleh lisosom dan peroksisom.</li>
\t<li>🌱 Menunjukkan pemahaman yang utuh mengenai hubungan analogi antara fasilitas desa dan organel sel.</li>
</ul>

<p><strong>Selamat belajar dan selamat berpetualang!</strong></p>
`
};

export const mapConfig = {
  backgroundImage: "asset_002",
  width: 1024,
  height: 554,
  visual: {
    colorStageAvailable: "rgba(250, 223, 10, 0.85)", // Tersedia: emas cerah
    colorStageLocked: "rgba(153, 0, 0, 0.75)",     // Terkunci: merah tua
    colorStageCleared: "rgba(0, 130, 0, 0.85)",    // Selesai: hijau subur
    colorPath: "rgba(0, 0, 0, 0.6)",
    colorPathCleared: "rgba(0, 130, 0, 0.85)"
  }
};

export const stagesData: Stage[] = [
  {
    id: "7a92d5f3-d732-4c72-90a3-368062e075e3",
    stageIndex: 0,
    label: "Petunjuk",
    subLabel: "Panduan Dasar Desa Sel",
    telemetry: {
      x: 4.4,
      y: 65.4,
      width: 5.9,
      height: 11.7
    },
    neighbors: [1],
    canBeStartStage: true,
    stageType: 'hotspot',
    icon: 'compass',
    hotspotsData: {
      image: "__MEDIA__asset_015.jpeg",
      hotspots: [
        {
          id: "hotspot-0-0",
          x: 35.0,
          y: 26.0,
          title: "1. Jelajahi Peta Desa",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_003.png", alt: "1. Jelajahi peta desa" }
          ]
        },
        {
          id: "hotspot-0-1",
          x: 35.0,
          y: 36.4,
          title: "2. Selesaikan Misi Tiap Warga",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_005.png", alt: "2. Selesaikan misi tiap warga" }
          ]
        },
        {
          id: "hotspot-0-2",
          x: 35.0,
          y: 46.8,
          title: "3. Gunakan Petunjuk Jika Ragu",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_007.png", alt: "3. Gunakan petunjuk jika ragu" }
          ]
        },
        {
          id: "hotspot-0-3",
          x: 35.0,
          y: 57.2,
          title: "4. Kumpulkan Bintang",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_009.png", alt: "4. Kumpulkan bintang" }
          ]
        },
        {
          id: "hotspot-0-4",
          x: 35.0,
          y: 67.6,
          title: "5. Ingat, Semua Warga Saling Terhubung",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_011.png", alt: "5. Ingat, semua warga saling terhubung" }
          ]
        },
        {
          id: "hotspot-0-5",
          x: 35.0,
          y: 79.4,
          title: "6. Siap Memulai?",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_013.png", alt: "6. Siap memulai?" }
          ]
        }
      ]
    }
  },
  {
    id: "eabd9795-c135-46b7-b597-801fb6b8f80f",
    stageIndex: 1,
    label: "Peta",
    subLabel: "Analogi Organel & Fasilitas Desa",
    telemetry: {
      x: 16.6,
      y: 91.2,
      width: 19.5,
      height: 10.8
    },
    neighbors: [0, 2],
    canBeStartStage: true,
    stageType: 'hotspot',
    icon: 'map',
    hotspotsData: {
      image: "__MEDIA__asset_027.jpeg",
      hotspots: [
        {
          id: "hotspot-1-0",
          x: 10.4,
          y: 87.69,
          title: "Petunjuk",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_016.png", alt: "Petunjuk", title: "Petunjuk" }
          ]
        },
        {
          id: "hotspot-1-1",
          x: 22.0,
          y: 75.85,
          title: "Pelabuhan Desa - Retikulum Endoplasma",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_017.jpeg", alt: "Pelabuhan Desa - Retikulum Endoplasma", title: "Pelabuhan Desa - Retikulum Endoplasma" }
          ]
        },
        {
          id: "hotspot-1-2",
          x: 17.6,
          y: 61.10,
          title: "Pusat Kesehatan - Peroksisom",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_018.png", alt: "Pusat Kesehatan - Peroksisom", title: "Pusat Kesehatan - Peroksisom" }
          ]
        },
        {
          id: "hotspot-1-3",
          x: 23.6,
          y: 45.18,
          title: "Pasar Desa - Badan Golgi",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_019.png", alt: "Pasar Desa - Badan Golgi", title: "Pasar Desa - Badan Golgi" }
          ]
        },
        {
          id: "hotspot-1-4",
          x: 24.8,
          y: 28.68,
          title: "Pusat Fotosintesis - Kloroplas",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_020.png", alt: "Pusat Fotosintesis - Kloroplas", title: "Pusat Fotosintesis - Kloroplas" }
          ]
        },
        {
          id: "hotspot-1-5",
          x: 47.2,
          y: 20.93,
          title: "Balai Desa - Inti Sel (Nukleus)",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_021.jpeg", alt: "Balai Desa - Inti Sel (Nukleus)", title: "Balai Desa - Inti Sel (Nukleus)" }
          ]
        },
        {
          id: "hotspot-1-6",
          x: 68.8,
          y: 23.68,
          title: "Pusat Produksi - Ribosom",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_022.png", alt: "Ribosom - Pusat Produksi", title: "Ribosom - Pusat Produksi" }
          ]
        },
        {
          id: "hotspot-1-7",
          x: 88.0,
          y: 30.52,
          title: "Pembangkit Energi - Mitokondria",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_023.png", alt: "Pembangkit Energi - Mitokondria", title: "Pembangkit Energi - Mitokondria" }
          ]
        },
        {
          id: "hotspot-1-8",
          x: 71.2,
          y: 70.62,
          title: "Pengelolaan Sampah - Lisosom",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_024.jpeg", alt: "Pengelolaan Sampah - Lisosom", title: "Pengelolaan Sampah - Lisosom" }
          ]
        },
        {
          id: "hotspot-1-9",
          x: 46.8,
          y: 54.70,
          title: "Lahan Pertanian - Kloroplas",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_025.jpeg", alt: "Lahan Pertanian - Kloroplas", title: "Lahan Pertanian - Kloroplas" }
          ]
        },
        {
          id: "hotspot-1-10",
          x: 51.2,
          y: 78.46,
          title: "Membran Sel",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_026.jpeg", alt: "Membran Sel", title: "Membran Sel" }
          ]
        }
      ]
    }
  },
  {
    id: "8750aa92-5349-4151-ac2e-7ff14c281eb0",
    stageIndex: 2,
    label: "Level 1",
    subLabel: "Mengenal Warga Desa Sel",
    telemetry: {
      x: 14.6,
      y: 44.2,
      width: 9.8,
      height: 14.4
    },
    neighbors: [1, 3],
    canBeStartStage: true,
    stageType: 'presentation',
    icon: 'star',
    presentationData: {
      slides: [
        {
          id: "lvl1-s0",
          title: "Tantangan Warga Desa Sel",
          imageSource: "__MEDIA__asset_028.jpeg",
          hasSingleChoiceSet: true,
          singleChoiceQuestions: [
            {
              id: "q1-1",
              question: "Di Desa Sel, terdapat seorang warga yang mengatur berbagai kegiatan penting dan menyimpan informasi yang menjadi pedoman bagi seluruh desa. Siapakah warga tersebut?",
              answers: ["Nukleus", "Vakuola", "Ribosom", "Badan Golgi"]
            },
            {
              id: "q1-2",
              question: "Suatu bagian sel memiliki peran dalam menghasilkan protein. Jika bagian ini mengalami gangguan, proses pembentukan protein dapat terganggu. Organel yang dimaksud adalah …",
              answers: ["Ribosom", "Lisosom", "Mitokondria", "Kloroplas"]
            },
            {
              id: "q1-3",
              question: "Seorang warga Desa Sel bertugas menghasilkan energi yang digunakan untuk mendukung berbagai aktivitas kehidupan sel. Warga tersebut adalah …",
              answers: ["Mitokondria", "Badan Golgi", "Nukleus", "Vakuola"]
            },
            {
              id: "q1-4",
              question: "Sebuah fasilitas dalam Desa Sel bertugas menerima, mengolah, dan mengirimkan berbagai bahan ke tujuan yang sesuai. Organel yang memiliki fungsi serupa adalah …",
              answers: ["Badan Golgi", "Ribosom", "Nukleus", "Membran sel"]
            },
            {
              id: "q1-5",
              question: "Di Desa Sel, terdapat jalur pengangkutan yang membantu memindahkan bahan dari satu tempat ke tempat lain. Sebagian jalur tersebut memiliki ribosom yang menempel pada permukaannya. Organel yang dimaksud adalah …",
              answers: ["Retikulum endoplasma kasar", "Retikulum endoplasma halus", "Lisosom", "Vakuola"]
            },
            {
              id: "q1-6",
              question: "Suatu bagian sel membantu menghasilkan lipid dan berperan dalam proses detoksifikasi zat tertentu. Organel yang sesuai adalah …",
              answers: ["Retikulum endoplasma halus", "Retikulum endoplasma kasar", "Ribosom", "Nukleus"]
            },
            {
              id: "q1-7",
              question: "Dalam Desa Sel, terdapat bagian yang mengatur keluar dan masuknya berbagai zat sehingga kondisi di dalam sel tetap terjaga. Organel yang memiliki fungsi tersebut adalah …",
              answers: ["Membran sel", "Mitokondria", "Dinding sel", "Kloroplas"]
            },
            {
              id: "q1-8",
              question: "Sebuah fasilitas pada sel tumbuhan membantu memberikan bentuk dan kekuatan sehingga sel tidak mudah berubah bentuk. Bagian sel yang dimaksud adalah …",
              answers: ["Dinding sel", "Vakuola", "Badan Golgi", "Ribosom"]
            },
            {
              id: "q1-9",
              question: "Seorang warga Desa Sel berfungsi menyimpan air, zat terlarut, dan berbagai bahan yang dibutuhkan oleh sel tumbuhan. Organel tersebut adalah …",
              answers: ["Vakuola", "Nukleus", "Lisosom", "Sentriol"]
            },
            {
              id: "q1-10",
              question: "Pada sel tumbuhan terdapat fasilitas yang berperan dalam menangkap energi cahaya dan menggunakannya untuk membantu proses pembentukan bahan organik. Organel yang dimaksud adalah …",
              answers: ["Kloroplas", "Ribosom", "Mitokondria", "Lisosom"]
            },
            {
              id: "q1-11",
              question: "Di Desa Sel terdapat fasilitas pengelolaan limbah yang bertugas mencerna makromolekul dan mendaur ulang bagian sel yang rusak menggunakan enzim pencernaan. Fasilitas ini adalah …",
              answers: ["Lisosom", "Sentriol", "Nukleus", "Mitokondria"]
            },
            {
              id: "q1-12",
              question: "Pusat Kesehatan Desa Sel bertugas menetralkan racun berbahaya seperti hidrogen peroksida menjadi air dan oksigen melalui enzim katalase. Organel tersebut adalah …",
              answers: ["Peroksisom", "Ribosom", "Badan Golgi", "Vakuola"]
            },
            {
              id: "q1-13",
              question: "Saat Desa Sel akan membelah diri menjadi desa baru, sepasang struktur khusus bertugas mengatur benang spindel untuk pemisahan materi genetik. Struktur ini adalah …",
              answers: ["Sentriol / Sentrosom", "Dinding sel", "Kloroplas", "Lisosom"]
            },
            {
              id: "q1-14",
              question: "Jaringan serat protein yang memberi bentuk kokoh pada sel, menyokong penempatan organel, dan memfasilitasi lalu lintas intraseluler disebut …",
              answers: ["Sitoskeleton", "Klorofil", "Kapsul", "Plasmid"]
            }
          ]
        }
      ]
    }
  },
  {
    id: "ccfe0b99-7c5f-4c26-baab-7fe4af206478",
    stageIndex: 3,
    label: "Level 2",
    subLabel: "Urutan Area Sarana Kota",
    telemetry: {
      x: 35.9,
      y: 43.3,
      width: 9.3,
      height: 12.6
    },
    neighbors: [2, 4],
    canBeStartStage: false,
    stageType: 'dragdrop',
    icon: 'puzzle',
    dragDropData: {
      backgroundImage: "__MEDIA__level2_town_bg.jpg",
      feedbackSuccess: "Hebat! Kamu telah menguasai pemetaan 5 organel sel dan menjaga Desa Sel beroperasi dengan harmonis!",
      feedbackFail: "Hampir berhasil! Masih ada fasilitas desa yang belum terhubung dengan organel yang tepat (minimal 4/5 benar). Mari ulangi lagi!",
      elements: [
        { id: "0", title: "Nukleus", alt: "Nukleus", image: "__MEDIA__organelle_nucleus.png" },
        { id: "1", title: "Badan Golgi", alt: "Badan Golgi", image: "__MEDIA__organelle_golgi.png" },
        { id: "2", title: "Retikulum Endoplasma", alt: "Retikulum Endoplasma", image: "__MEDIA__organelle_endoplasmic.png" },
        { id: "3", title: "Mitokondria", alt: "Mitokondria", image: "__MEDIA__organelle_mitochondria.png" },
        { id: "4", title: "Membran Sel", alt: "Membran Sel", image: "__MEDIA__organelle_membrane.png" }
      ],
      dropZones: [
        {
          id: "dz-0",
          label: "Pusat Komando Sel (Balai Desa)",
          description: "Mengatur seluruh kegiatan sel dan menyimpan materi genetik (DNA).",
          image: "__MEDIA__organelle_nucleus.png",
          correctElementIds: ["0"],
          x: 39.0,
          y: 12.0,
          width: 17,
          height: 16
        },
        {
          id: "dz-1",
          label: "Pusat Sortir & Pengemasan (Pasar Desa)",
          description: "Memodifikasi, menyortir, dan mengemas molekul untuk sekresi atau penggunaan internal.",
          image: "__MEDIA__organelle_golgi.png",
          correctElementIds: ["1"],
          x: 14.0,
          y: 39.0,
          width: 18,
          height: 16
        },
        {
          id: "dz-2",
          label: "Jalur Transportasi Internal (Pelabuhan Desa)",
          description: "Jaringan membran berlipat dan bertubulus untuk sintesis dan transportasi zat.",
          image: "__MEDIA__organelle_endoplasmic.png",
          correctElementIds: ["2"],
          x: 16.0,
          y: 69.0,
          width: 18,
          height: 17
        },
        {
          id: "dz-3",
          label: "Pembangkit Energi ATP (Pembangkit Energi)",
          description: "Menghasilkan energi sel melalui respirasi seluler untuk seluruh aktivitas sel.",
          image: "__MEDIA__organelle_mitochondria.png",
          correctElementIds: ["3"],
          x: 78.0,
          y: 25.0,
          width: 18,
          height: 17
        },
        {
          id: "dz-4",
          label: "Gerbang Pelindung Sel (Gerbang Desa)",
          description: "Mengatur lalu lintas zat yang masuk dan keluar secara selektif permeabel.",
          image: "__MEDIA__organelle_membrane.png",
          correctElementIds: ["4"],
          x: 42.0,
          y: 73.0,
          width: 16,
          height: 18
        }
      ]
    }
  },
  {
    id: "cce89a17-aa67-403a-8010-7ff8b0884e72",
    stageIndex: 4,
    label: "Level 3",
    subLabel: "Alur Produksi & Ekspor Protein",
    telemetry: {
      x: 52.2,
      y: 25.3,
      width: 8.8,
      height: 12.6
    },
    neighbors: [3, 5],
    canBeStartStage: false,
    stageType: 'presentation',
    icon: 'play-circle',
    presentationData: {
      slides: [
        {
          id: "lvl3-s0",
          title: "Simulasi Produksi Protein",
          videoSource: "__MEDIA__asset_035.mp4",
          nextButtonTitle: "Lanjut ke Penjelasan"
        },
        {
          id: "lvl3-s1",
          title: "Skema Perjalanan Molekul Protein",
          imageSource: "__MEDIA__asset_036.png",
          nextButtonTitle: "Misi Selanjutnya"
        },
        {
          id: "lvl3-s2",
          title: "Urutkan Tahapan Produksi Protein",
          backgroundImage: "__MEDIA__asset_037.png",
          hasDragDrop: true,
          dragDropTask: {
            backgroundImage: "__MEDIA__asset_037.png",
            feedbackSuccess: "Hebat! Kamu berhasil menyusun urutan produksi protein.",
            feedbackFail: "Terus berlatih! Periksa kembali urutan proses produksi protein.",
            elements: [
              { id: "0", title: "Badan Golgi", image: "__MEDIA__asset_038.jpeg", alt: "Badan Golgi" },
              { id: "1", title: "Vesikel Transport", image: "__MEDIA__asset_039.jpeg", alt: "Vesikel" },
              { id: "2", title: "Membran Sel", image: "__MEDIA__asset_040.jpeg", alt: "Membran Sel" },
              { id: "3", title: "RE Kasar", image: "__MEDIA__asset_041.jpeg", alt: "RE Kasar" },
              { id: "4", title: "Ribosom", image: "__MEDIA__asset_042.jpeg", alt: "Ribosom" }
            ],
            dropZones: [
              { id: "dz-3-0", label: "1. Sintesis Awal (Ribosom)", correctElementIds: ["4"], x: 8.0, y: 74.2, width: 16, height: 18 },
              { id: "dz-3-2", label: "2. Pemrosesan di Jalur (RE Kasar)", correctElementIds: ["3"], x: 25.8, y: 74.2, width: 16, height: 18 },
              { id: "dz-3-4", label: "3. Kurir Antar (Vesikel Transport)", correctElementIds: ["1"], x: 43.5, y: 74.2, width: 16, height: 18 },
              { id: "dz-3-3", label: "4. Sortir & Kemas (Badan Golgi)", correctElementIds: ["0"], x: 62.9, y: 74.2, width: 16, height: 18 },
              { id: "dz-3-1", label: "5. Pelepasan / Sekresi (Membran Sel)", correctElementIds: ["2"], x: 80.6, y: 74.2, width: 16, height: 18 }
            ]
          }
        },
        {
          id: "lvl3-s3",
          title: "Kesimpulan: Harmoni Produksi Protein",
          imageSource: "__MEDIA__asset_037b.png",
          nextButtonTitle: "Selesaikan & Buka Level 4"
        }
      ]
    }
  },
  {
    id: "2a93031d-a62d-4f6a-b497-68c3d35dcd57",
    stageIndex: 5,
    label: "Level 4",
    subLabel: "Krisis Energi Desa Sel",
    telemetry: {
      x: 60.8,
      y: 41.5,
      width: 8.3,
      height: 12.6
    },
    neighbors: [4, 6],
    canBeStartStage: false,
    stageType: 'presentation',
    icon: 'zap',
    presentationData: {
      slides: [
        {
          id: "lvl4-s0",
          title: "Krisis Energi di Desa Sel",
          videoSource: "__MEDIA__asset_043.mp4",
          nextButtonTitle: "Selesaikan Misi"
        }
      ]
    }
  },
  {
    id: "b3b31e26-6fd0-4b79-b4cd-5bae7b5950da",
    stageIndex: 6,
    label: "Level 5",
    subLabel: "Krisis Distribusi Desa Sel",
    telemetry: {
      x: 47.1,
      y: 60.9,
      width: 8.3,
      height: 13.5
    },
    neighbors: [5, 7],
    canBeStartStage: false,
    stageType: 'presentation',
    icon: 'truck',
    presentationData: {
      slides: [
        {
          id: "lvl5-s0",
          title: "Inspeksi Jalur Distribusi",
          videoSource: "__MEDIA__asset_047.mp4",
          nextButtonTitle: "Mulai Tantangan"
        },
        {
          id: "lvl5-s1",
          title: "Penyelesaian Krisis Logistik",
          imageSource: "__MEDIA__asset_048.png",
          hasSingleChoiceSet: true,
          singleChoiceQuestions: [
            {
              id: "q5-1",
              question: "Sebuah bahan telah selesai dibuat di dalam sel, tetapi bahan tersebut belum dapat digunakan oleh bagian lain. Proses apa yang perlu diperiksa?",
              answers: ["Pengolahan dan pengemasan bahan", "Pengaturan informasi genetik", "Penghasilan energi", "Pengaturan keluar masuk zat"]
            },
            {
              id: "q5-2",
              question: "Jika jalur pengiriman bahan di dalam sel mengalami gangguan, dampak yang paling mungkin terjadi adalah ...",
              answers: ["Bahan tidak sampai ke tempat tujuan", "Sel langsung kehilangan seluruh DNA", "Sel tidak memiliki membran", "Semua organel berubah menjadi energi"]
            },
            {
              id: "q5-3",
              question: "Perhatikan hubungan berikut: Jalur pengangkutan bahan → bagian sel yang berperan dalam transportasi. Organel yang paling sesuai dengan fungsi tersebut adalah ...",
              answers: ["Retikulum endoplasma", "Nukleus", "Mitokondria", "Kloroplas"]
            },
            {
              id: "q5-4",
              question: "Desa Sel memiliki bahan yang berlebih dan perlu disimpan untuk digunakan kembali. Bagian sel yang berkaitan dengan penyimpanan adalah ...",
              answers: ["Vakuola", "Ribosom", "Nukleus", "Lisosom"]
            },
            {
              id: "q5-5",
              question: "Setelah bahan digunakan, terdapat sisa atau bagian yang tidak diperlukan. Jika sisa tersebut tidak dikelola dengan baik, apa yang dapat terjadi?",
              answers: ["Sisa menumpuk dan mengganggu kerja sel", "Sel menghasilkan energi tanpa batas", "Informasi genetik bertambah sendiri", "Semua organel berhenti membelah"]
            }
          ]
        }
      ]
    }
  },
  {
    id: "cec98aeb-8f61-4858-aeeb-3f652c9085a5",
    stageIndex: 7,
    label: "Level 6",
    subLabel: "Detektif Kerusakan Sistem Sel",
    telemetry: {
      x: 68.8,
      y: 74.5,
      width: 8.8,
      height: 13.5
    },
    neighbors: [6, 8],
    canBeStartStage: false,
    stageType: 'presentation',
    icon: 'search',
    presentationData: {
      slides: [
        {
          id: "lvl6-s0",
          title: "Laporan Kerusakan Sistem",
          videoSource: "__MEDIA__asset_049.mp4",
          nextButtonTitle: "Lanjut ke Misi 1"
        },
        {
          id: "lvl6-s1",
          title: "Misi 1: Rantai Sebab-Akibat Gangguan Energi",
          backgroundImage: "__MEDIA__asset_050.png",
          hasDragDrop: true,
          dragDropTask: {
            backgroundImage: "__MEDIA__asset_050.png",
            feedbackSuccess: "Tepat! Kamu berhasil melacak rantai kerusakan dari penyebab hingga dampaknya.",
            feedbackFail: "Belum tepat. Periksa kembali mana yang menjadi penyebab dan mana yang menjadi akibat.",
            elements: [
              { id: "c1", title: "Mitokondria mengalami gangguan", image: "__MEDIA__asset_054.png" },
              { id: "c2", title: "Produksi ATP menurun", image: "__MEDIA__asset_051.png" },
              { id: "c3", title: "Ketersediaan energi sel berkurang", image: "__MEDIA__asset_052.png" },
              { id: "c4", title: "Aktivitas sel tertentu terganggu", image: "__MEDIA__asset_053.png" }
            ],
            dropZones: [
              { id: "chain-1", label: "Langkah 1: Sumber Masalah", correctElementIds: ["c1"], x: 16.1, y: 35.5, width: 18, height: 18 },
              { id: "chain-2", label: "Langkah 2: Akibat Pertama", correctElementIds: ["c2"], x: 35.5, y: 35.5, width: 18, height: 18 },
              { id: "chain-3", label: "Langkah 3: Akibat Lanjutan", correctElementIds: ["c3"], x: 56.5, y: 35.5, width: 18, height: 18 },
              { id: "chain-4", label: "Langkah 4: Dampak Akhir", correctElementIds: ["c4"], x: 75.8, y: 35.5, width: 18, height: 18 }
            ]
          },
          nextButtonTitle: "Lanjut ke Misi 2"
        },
        {
          id: "lvl6-s2",
          title: "Misi 2: Hubungkan Kerusakan & Dampaknya",
          backgroundImage: "__MEDIA__asset_056.png",
          hasDragDrop: true,
          dragDropTask: {
            backgroundImage: "__MEDIA__asset_056.png",
            feedbackSuccess: "Tepat sekali! Kamu berhasil memetakan dampak gangguan setiap organel.",
            feedbackFail: "Misi belum sempurna, Kepala Desa! 🌱 Masih ada pasangan yang belum tepat. Periksa kembali fungsi setiap organel.",
            elements: [
              { id: "fx-atp", title: "Produksi ATP menurun" },
              { id: "fx-protein", title: "Sintesis protein menurun" },
              { id: "fx-transport", title: "Transport atau pemrosesan bahan tertentu terganggu" },
              { id: "fx-golgi", title: "Modifikasi, penyortiran, dan pengemasan bahan terganggu" }
            ],
            dropZones: [
              { id: "dz-mito", label: "Mitokondria terganggu", correctElementIds: ["fx-atp"], x: 12, y: 25, width: 76, height: 14 },
              { id: "dz-ribo", label: "Ribosom terganggu", correctElementIds: ["fx-protein"], x: 12, y: 42, width: 76, height: 14 },
              { id: "dz-re", label: "Retikulum Endoplasma terganggu", correctElementIds: ["fx-transport"], x: 12, y: 59, width: 76, height: 14 },
              { id: "dz-golgi", label: "Badan Golgi terganggu", correctElementIds: ["fx-golgi"], x: 12, y: 76, width: 76, height: 14 }
            ]
          },
          nextButtonTitle: "Lanjut ke Misi 3"
        },
        {
          id: "lvl6-s3",
          title: "Misi 3: Mitokondria vs Ribosom",
          imageSource: "__MEDIA__asset_058.png",
          hasSingleChoiceSet: true,
          nextButtonTitle: "Lanjut ke Misi 4",
          singleChoiceQuestions: [
            {
              id: "q6-3",
              question: "Apa perbedaan dampak gangguan mitokondria dan gangguan ribosom?",
              answers: [
                "Gangguan mitokondria menurunkan produksi ATP, sedangkan gangguan ribosom menurunkan sintesis protein.",
                "Gangguan mitokondria menurunkan sintesis protein, sedangkan gangguan ribosom meningkatkan ATP",
                "Gangguan mitokondria dan ribosom sama-sama berfungsi menghasilkan energi.",
                "Gangguan mitokondria hanya memengaruhi bentuk sel, sedangkan ribosom mengatur keluar-masuk zat."
              ]
            }
          ]
        },
        {
          id: "lvl6-s4",
          title: "Misi 4: Analisis Penurunan Protein & Energi",
          imageSource: "__MEDIA__asset_059.png",
          hasSingleChoiceSet: true,
          nextButtonTitle: "Lanjut ke Misi 5",
          singleChoiceQuestions: [
            {
              id: "q6-4",
              question: "Pusat Produksi Desa Sel mulai menghasilkan lebih sedikit protein. Pada saat yang sama, Pembangkit Energi juga mengalami penurunan aktivitas. Apakah pasti ribosom yang rusak?",
              answers: [
                "Tidak selalu, karena sintesis protein membutuhkan energi (ATP), sehingga gangguan mitokondria juga dapat menurunkan produksi protein.",
                "Ya, karena semua masalah protein pasti disebabkan oleh ribosom.",
                "Ya, karena mitokondria tidak berhubungan dengan sintesis protein.",
                "Tidak, karena ribosom hanya berfungsi menghasilkan ATP."
              ]
            }
          ]
        },
        {
          id: "lvl6-s5",
          title: "Misi 5: Sifat Kerjasama Sel",
          imageSource: "__MEDIA__asset_060.png",
          hasSingleChoiceSet: true,
          singleChoiceQuestions: [
            {
              id: "q6-5",
              question: "Jika satu organel mengalami gangguan, apakah seluruh sel pasti langsung berhenti bekerja?",
              answers: [
                "Tidak, dampaknya bergantung pada jenis organel, tingkat kerusakan, dan fungsi yang terganggu.",
                "Ya, semua organel harus bekerja sempurna setiap saat.",
                "Ya, satu organel yang terganggu pasti langsung menghentikan seluruh aktivitas sel.",
                "Tidak, karena setiap organel bekerja sendiri dan tidak saling berhubungan."
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: "a433c8a8-1198-4923-8d6e-c86cef3a4b35",
    stageIndex: 8,
    label: "Level 7",
    subLabel: "Laporan Darurat Desa Sel",
    telemetry: {
      x: 80.1,
      y: 44.7,
      width: 8.8,
      height: 13.5
    },
    neighbors: [7, 9],
    canBeStartStage: false,
    stageType: 'presentation',
    icon: 'file-text',
    presentationData: {
      slides: [
        {
          id: "lvl7-s0",
          title: "Panggilan Darurat Kepala Desa",
          videoSource: "__MEDIA__asset_061.mp4",
          nextButtonTitle: "Buka Laporan Darurat"
        },
        {
          id: "lvl7-s1",
          title: "Lengkapi Laporan Investigasi",
          imageSource: "__MEDIA__asset_062.jpeg",
          hasFillBlanks: true,
          fillBlanksText: `Darurat terjadi di Desa Sel! Beberapa fasilitas mulai mengalami gangguan sehingga aktivitas sel tidak berjalan dengan baik. Pembangkit energi desa yang dianalogikan sebagai organel *mitokondria* mengalami penurunan aktivitas. Akibatnya, produksi *ATP* menjadi menurun dan ketersediaan energi di dalam sel berkurang. Kondisi ini menyebabkan beberapa kegiatan sel menjadi lebih lambat. Pada saat yang sama, Pusat Produksi Protein yang dianalogikan sebagai *ribosom* mulai menghasilkan protein dalam jumlah yang lebih sedikit. Jalur transportasi bahan yang dianalogikan sebagai *retikulum endoplasma* juga mengalami gangguan sehingga bahan-bahan tertentu tidak dapat dipindahkan atau diproses dengan baik. Selain itu, Pusat Pengemasan Desa Sel yang dianalogikan sebagai *badan Golgi* mengalami kesulitan dalam melakukan modifikasi, penyortiran, dan pengemasan bahan. Sebagai Kepala Desa Sel, kamu harus menyelidiki setiap gangguan dengan teliti. Ingatlah bahwa setiap organel memiliki fungsi yang berbeda, tetapi semuanya saling berhubungan dan bekerja sama. Gangguan pada satu organel dapat memengaruhi proses lain secara bertahap. Oleh karena itu, kamu harus menganalisis hubungan antara fungsi *organel*, penyebab gangguan, dan dampak yang ditimbulkan sebelum mengambil keputusan. Pilihlah tindakan yang paling tepat agar sistem Desa Sel dapat kembali bekerja dengan baik dan seluruh aktivitas sel dapat berlangsung secara *normal*.`
        }
      ]
    }
  },
  {
    id: "c96ddc7d-03ed-4c23-a9b4-bba9fd0a0ec4",
    stageIndex: 9,
    label: "Level 8",
    subLabel: "Harmoni Alam & Refleksi Nilai",
    telemetry: {
      x: 87.6,
      y: 23.5,
      width: 9.3,
      height: 12.6
    },
    neighbors: [8],
    canBeStartStage: false,
    stageType: 'presentation',
    icon: 'heart',
    presentationData: {
      slides: [
        {
          id: "lvl8-s0",
          title: "Pohon Kehidupan Desa Sel",
          imageSource: "__MEDIA__asset_063.png",
          nextButtonTitle: "Mulai Refleksi Nilai & Integrasi Agama"
        },
        {
          id: "lvl8-s1",
          title: "Refleksi 1: Tanda Kebesaran Ilahi",
          hasMultiChoice: true,
          nextButtonTitle: "Refleksi Selanjutnya",
          multiChoiceQuestion: {
            id: "mc8-1",
            question: "Allah berfirman dalam QS. Ali ‘Imran ayat 190–191 bahwa penciptaan langit dan bumi serta pergantian malam dan siang merupakan tanda-tanda kebesaran Allah bagi ulul albab (orang yang berakal). Seorang siswa mengamati bahwa membran sel, nukleus, mitokondria, dan badan Golgi memiliki fungsi berbeda tetapi bekerja sama tanpa benturan. Kesimpulan integrasi yang paling tepat adalah ....",
            options: [
              { text: "Keteraturan dan keterpaduan fungsi organel sel merupakan sarana nyata merenungkan kebesaran Allah Sang Maha Perancang", correct: true },
              { text: "Semua organel sel sebenarnya memiliki fungsi dan struktur molekul yang sama persis", correct: false },
              { text: "Sel tidak perlu dipelajari karena ukurannya mikroskopis dan tidak berdampak pada iman", correct: false },
              { text: "Organel bekerja tanpa hubungan satu sama lain secara kebetulan semata", correct: false }
            ]
          }
        },
        {
          id: "lvl8-s2",
          title: "Refleksi 2: Amanah & Tanggung Jawab",
          hasMultiChoice: true,
          nextButtonTitle: "Refleksi Selanjutnya",
          multiChoiceQuestion: {
            id: "mc8-2",
            question: "Dalam Desa Sel, setiap organel memiliki tugas spesifik yang wajib ditunaikan. Jika ribosom berhenti merakit protein atau lisosom mogok mengolah limbah, seluruh sel akan mengalami kematian. Hal tersebut paling mencerminkan pengamalan nilai Islam tentang ....",
            options: [
              { text: "Amanah, tanggung jawab, dan kepedulian terhadap peran sosial masing-masing", correct: true },
              { text: "Kebebasan individu tanpa batas dan tanpa aturan hukum", correct: false },
              { text: "Persaingan bebas tanpa memikirkan keselamatan sesama", correct: false },
              { text: "Mengutamakan kepentingan pribadi di atas kemaslahatan bersama", correct: false }
            ]
          }
        },
        {
          id: "lvl8-s3",
          title: "Refleksi 3: Menyaring Informasi (Tabayyun)",
          hasMultiChoice: true,
          nextButtonTitle: "Refleksi Selanjutnya",
          multiChoiceQuestion: {
            id: "mc8-3",
            question: "Membran sel memiliki sifat semipermeabel yang menyaring secara ketat zat apa yang boleh masuk atau keluar demi melindungi isi sel. Dalam ajaran Islam (QS. Al-Hujurat ayat 6), prinsip penyaringan selektif ini setara dengan akhlak ....",
            options: [
              { text: "Tabayyun (memverifikasi dan menyaring kebenaran informasi sebelum mempercayai atau menyebarkannya)", correct: true },
              { text: "Langsung membagikan kabar burung yang sedang viral tanpa memeriksa sumbernya", correct: false },
              { text: "Menelan mentah-mentah seluruh berita yang muncul di media sosial", correct: false },
              { text: "Mencurigai semua orang tanpa alasan yang jelas", correct: false }
            ]
          }
        },
        {
          id: "lvl8-s4",
          title: "Refleksi 4: Memanfaatkan Energi untuk Kebaikan",
          hasMultiChoice: true,
          nextButtonTitle: "Refleksi Selanjutnya",
          multiChoiceQuestion: {
            id: "mc8-4",
            question: "Mitokondria terus-menerus membakar glukosa dan oksigen untuk menghasilkan molekul ATP berenergi tinggi bagi tubuh kita tanpa pernah kita mintakan secara sadar. Sebagai hamba yang bersyukur, energi fisik dan kesehatan tersebut selayaknya diarahkan untuk ....",
            options: [
              { text: "Menuntut ilmu, beribadah, menolong sesama, dan berbuat kebajikan", correct: true },
              { text: "Bermalas-malasan dan menyia-nyiakan waktu luang sepanjang hari", correct: false },
              { text: "Melakukan tindakan jahil yang merugikan orang lain dan lingkungan", correct: false },
              { text: "Menimbun kekayaan tanpa peduli hak kaum yang membutuhkan", correct: false }
            ]
          }
        },
        {
          id: "lvl8-s5",
          title: "Refleksi 5: Kesempurnaan Ciptaan Tanpa Cacat",
          hasMultiChoice: true,
          nextButtonTitle: "Refleksi Selanjutnya",
          multiChoiceQuestion: {
            id: "mc8-5",
            question: "Allah SWT berfirman: '...Kamu tidak melihat pada ciptaan Tuhan Yang Maha Pengasih sesuatu yang tidak seimbang. Maka lihatlah sekali lagi, adakah kamu melihat sesuatu yang cacat?' (QS. Al-Mulk: 3–4). Dalam biologi seluler, ribuan jalur biokimia (seperti fosforilasi oksidatif dan sintesis protein) bekerja dengan presisi nanometer. Kesimpulan ilmiah dan keimanan yang paling tepat adalah ....",
            options: [
              { text: "Ultrastruktur sel yang presisi membuktikan tiadanya cacat dan keagungan desain Sang Maha Pencipta (Itqan)", correct: true },
              { text: "Reaksi biokimia sel terjadi secara acak dan kebetulan tanpa ada hukum keteraturan", correct: false },
              { text: "Kehidupan sel selalu mengalami kegagalan sistematis yang tidak dapat diperbaiki", correct: false },
              { text: "Penciptaan sel tidak ada kaitannya dengan tanda kekuasaan Tuhan di alam semesta", correct: false }
            ]
          }
        },
        {
          id: "lvl8-s6",
          title: "Refleksi 6: Ukuran & Keseimbangan Homeostasis",
          hasMultiChoice: true,
          nextButtonTitle: "Refleksi Selanjutnya",
          multiChoiceQuestion: {
            id: "mc8-6",
            question: "Dalam QS. Al-Qamar ayat 49 dinyatakan: 'Sungguh, Kami menciptakan segala sesuatu menurut ukuran (qadar).' Dalam fisiologi, sel hidup mempertahankan 'homeostasis' (keseimbangan konsentrasi ion, pH, dan cairan sel). Nilai akhlak yang paling selaras dengan prinsip homeostasis sel adalah ....",
            options: [
              { text: "Menerapkan sikap seimbang (tawazun), bersahaja, dan tidak melampaui batas dalam kehidupan", correct: true },
              { text: "Boleh makan dan berperilaku melampaui batas sesuka hati asalkan merasa senang", correct: false },
              { text: "Keseimbangan hanya berlaku pada tingkat mikroskopis sel dan tidak relevan bagi moral manusia", correct: false },
              { text: "Mengabaikan pola hidup sehat karena tubuh akan sembuh secara otomatis", correct: false }
            ]
          }
        },
        {
          id: "lvl8-s7",
          title: "Refleksi 7: Air sebagai Basis Kehidupan & Sitosol",
          hasMultiChoice: true,
          nextButtonTitle: "Refleksi Selanjutnya",
          multiChoiceQuestion: {
            id: "mc8-7",
            question: "Allah SWT berfirman dalam QS. Al-Anbiya ayat 30: '...Dan Kami jadikan dari air segala sesuatu yang hidup. Maka mengapakah mereka tidak juga beriman?'. Dalam biologi, sitoplasma terdiri atas 70–85% air yang menjadi pelarut universal bagi seluruh biotransformasi sel. Wujud rasa syukur seorang pelajar Biologi terhadap anugerah air adalah ....",
            options: [
              { text: "Menjaga kelestarian sumber daya air, tidak mencemari lingkungan, dan hemat menggunakan air", correct: true },
              { text: "Membuang sampah kimia dan limbah plastik ke sungai tanpa rasa bersalah", correct: false },
              { text: "Mengabaikan kebutuhan hidrasi harian tubuh karena menganggap air tidak berpengaruh pada sel", correct: false },
              { text: "Menggunakan air bersih secara boros dan berlebih-lebihan saat mencuci", correct: false }
            ]
          }
        },
        {
          id: "lvl8-s8",
          title: "Refleksi 8: Pusat Komando & Kebersihan Hati",
          hasMultiChoice: true,
          nextButtonTitle: "Refleksi Selanjutnya",
          multiChoiceQuestion: {
            id: "mc8-8",
            question: "Rasulullah SAW bersabda: 'Di dalam tubuh ada segumpal daging. Apabila ia baik, maka baiklah seluruh tubuh; dan apabila ia rusak, maka rusaklah seluruh tubuh. Ketahuilah, ia adalah hati (qalb)' (HR. Bukhari). Jika dianalogikan dengan Nukleus yang menyimpan DNA pengendali seluruh aktivitas sel, hikmah kepemimpinan diri yang diperoleh adalah ....",
            options: [
              { text: "Senantiasa membersihkan niat dan hati, karena hati nurani yang bersih akan memandu tindakan fisik yang bajik", correct: true },
              { text: "Cukup fokus pada ucapan di bibir tanpa perlu memperbaiki ketulusan dalam hati", correct: false },
              { text: "Pemimpin tidak perlu memiliki prinsip integritas moral asalkan memiliki kekuasaan", correct: false },
              { text: "Kebaikan tindakan lahiriah sama sekali tidak berkaitan dengan keadaan batiniah seseorang", correct: false }
            ]
          }
        },
        {
          id: "lvl8-s9",
          title: "Refleksi 9: Daur Ulang Lisosom & Konsep Muhasabah",
          hasMultiChoice: true,
          nextButtonTitle: "Lanjut ke Soal Esai Refleksi",
          multiChoiceQuestion: {
            id: "mc8-9",
            question: "Organel Lisosom menjalankan fungsi autofagi, yaitu mengurai organel tua yang rusak agar materi molekulernya dapat didaur ulang menjadi senyawa bermanfaat bagi sel. Dalam konsep spiritual Islam, proses pembersihan berkala dari hal-hal yang merusak selaras dengan ....",
            options: [
              { text: "Tazkiyatun nafs (penyucian jiwa) dan muhasabah (introspeksi diri serta bertaubat dari kesalahan)", correct: true },
              { text: "Menyimpan dendam, prasangka buruk, dan membiarkan noda moral menumpuk di dalam hati", correct: false },
              { text: "Menolak kritik yang membangun dan menganggap diri selalu paling suci", correct: false },
              { text: "Menghapus semua ingatan tentang masa lalu tanpa mengambil pelajaran berharga", correct: false }
            ]
          }
        },
        {
          id: "lvl8-s10",
          title: "Refleksi Esai 1: Tadabbur Sel & Rasa Syukur",
          hasEssay: true,
          nextButtonTitle: "Refleksi Esai Berikutnya",
          essayQuestion: {
            id: "essay-8-1",
            title: "Tadabbur Keagungan Sel & Rasa Syukur Nikmat Tubuh",
            subtitle: "Merenungkan Keteraturan Seluler sebagai Tanda Kekuasaan Sang Pencipta",
            category: "Tadabbur Sains & Integrasi Nilai Islam",
            verseReference: "QS. Fushshilat : 53",
            verseArabic: "سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ حَتَّىٰ يَتَبَيَّنَ لَهُمْ أَنَّهُ الْحَقُّ",
            verseTranslation: "Kami akan memperlihatkan kepada mereka tanda-tanda (kekuasaan) Kami di segenap ufuk dan pada diri mereka sendiri, sehingga jelaslah bagi mereka bahwa Al-Qur'an itu benar.",
            scientificConnection: "Triliunan sel dalam tubuh kita bekerja 24 jam nonstop: membran menyaring zat, mitokondria memompa ribuan molekul ATP tiap detik, dan nukleus mereplikasi kode kehidupan secara otomatis tanpa pernah kita bayar atau perintah secara sadar.",
            prompt: "Setelah kamu mempelajari bagaimana organel-organel di dalam sel beroperasi dengan ketelitian luar biasa, tuliskan renungan pribadimu: Bagaimana keteraturan seluler ini mempertebal rasa takjub, keimanan, dan rasa syukurmu kepada Allah SWT? Apa komitmen nyata yang akan kamu lakukan untuk menjaga kesehatan tubuhmu sebagai amanah Ilahi?",
            guidingQuestions: [
              "Sebutkan satu organel yang paling membuatmu kagum dan jelaskan mengapa fungsinya begitu menakjubkan bagi kehidupanmu.",
              "Renungkan apa yang terjadi seandainya organel tersebut berhenti beroperasi selama beberapa menit saja di dalam tubuhmu.",
              "Tuliskan komitmen konkritmu (misal: pola makan halal & bergizi, istirahat teratur, menjaga kebersihan, atau menjauhi zat berbahaya) sebagai wujud syukur atas triliunan sel anugerah Tuhan."
            ],
            minWords: 20,
            placeholder: "Tuliskan renungan pribadimu di sini (minimal 20 kata). Ungkapkan kekagumanmu pada keteraturan sel, rasa syukur atas nikmat kesehatan, dan komitmen perilakumu sehari-hari..."
          }
        },
        {
          id: "lvl8-s11",
          title: "Refleksi Esai 2: Meneladani Harmoni Sel dalam Bermasyarakat",
          hasEssay: true,
          nextButtonTitle: "Lanjut ke Refleksi Penutup",
          essayQuestion: {
            id: "essay-8-2",
            title: "Meneladani Filosofi Gotong Royong Organel dalam Akhlak Bermasyarakat",
            subtitle: "Belajar dari Sinergi dan Keikhlasan Organel Tanpa Kesombongan",
            category: "Karakter & Nilai Akhlak",
            verseReference: "HR. Muslim No. 2586 & QS. Al-Hujurat : 13",
            verseArabic: "مَثَلُ الْمُؤْمِنِينَ فِي تَوَادِّهِمْ وَتَرَاحُمِهِمْ وَتَعَاطُفِهِمْ مَثَلُ الْجَسَدِ إِذَا اشْتَكَى مِنْهُ عُضْوٌ تَدَاعَى لَهُ سَائِرُ الْجَسَدِ بِالسَّهَرِ وَالْحُمَّى",
            verseTranslation: "Perumpamaan kaum mukmin dalam cinta, kasih sayang, dan kelembutan hati mereka adalah laksana satu tubuh; apabila satu anggota tubuh mengeluh sakit, maka seluruh tubuh ikut merasakannya dengan demam dan tidak dapat tidur.",
            scientificConnection: "Di dalam sel, tidak ada organel yang bekerja untuk ego pribadi. Ribosom tidak sombong karena merakit protein, RE dan Golgi setia mengantarkan paket, dan mitokondria rela membagikan energi ke seluruh penjuru sel demi kelangsungan hidup bersama.",
            prompt: "Di dalam 'Desa Sel', setiap organel memiliki peran berbeda namun saling menghormati dan bersinergi tanpa pernah merasa paling hebat. Bagaimana kamu dapat mengaplikasikan filosofi gotong royong dan keharmonisan organel sel ini dalam kehidupan sehari-harimu bersama teman di kelas, keluarga, dan masyarakat luas?",
            guidingQuestions: [
              "Nilai karakter apa (misal: rendah hati, gotong royong, disiplin, toleransi, atau empati) yang paling kamu pelajari dari kehidupan organel sel?",
              "Ceritakan satu contoh nyata tindakan kebaikan, kerja sama kelompok, atau bantuan kepada teman yang akan kamu lakukan terinspirasi dari harmoni sel ini.",
              "Bagaimana sikapmu dalam menghargai perbedaan bakat dan peran teman-temanmu di sekolah sebagaimana perbedaan fungsi tiap organel di Desa Sel?"
            ],
            minWords: 20,
            placeholder: "Tuliskan refleksimu mengenai kerja sama dan akhlak di sini (minimal 20 kata). Jelaskan bagaimana kamu akan meneladani keharmonisan organel sel dalam menghargai sesama dan berkontribusi bagi lingkunganmu..."
          }
        },
        {
          id: "lvl8-s12",
          title: "Refleksi Akhir: Harmoni Ilmu dan Iman",
          hasMultiChoice: true,
          nextButtonTitle: "Selesaikan Petualangan Paripurna",
          multiChoiceQuestion: {
            id: "mc8-10",
            question: "Setelah menyelesaikan seluruh petualangan di Desa Sel hingga merenungkan nilai-nilai spiritualnya, seorang penuntut ilmu Biologi menyadari bahwa sains dan agama berjalan beriringan saling menguatkan. Sikap paripurna yang paling tepat untuk diamalkan adalah ....",
            options: [
              { text: "Menggunakan pemahaman Biologi untuk menjaga kesehatan, merawat kelestarian alam ciptaan Allah, dan menebarkan kemanfaatan bagi sesama", correct: true },
              { text: "Menganggap ilmu pengetahuan modern bertentangan dengan ajaran agama sehingga harus dipisahkan", correct: false },
              { text: "Merasa diri paling pintar setelah mempelajari sains sel dan meremehkan orang lain", correct: false },
              { text: "Hanya menghafal struktur organel untuk mengejar nilai ujian tanpa menghayati maknanya", correct: false }
            ]
          }
        }
      ]
    }
  }
];

export const endScreenData = {
  title: "Desa Sel Telah Berhasil Diselamatkan!",
  badge: "PENGELOLA DESA TELADAN",
  description: `Selamat! Kamu telah menyelesaikan seluruh misi di Desa Sel. Berkat kepemimpinan dan pemahamanmu tentang kerja sama antar organel — mulai dari komando Nukleus, sintesis Ribosom, pengolahan Badan Golgi, energi Mitokondria & Kloroplas, hingga proteksi Membran Sel — keseimbangan dan kehidupan Desa Sel kembali berjalan dengan harmonis!`
};
