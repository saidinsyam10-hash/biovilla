import { UserAccount, UserRole, StudentProgressRecord } from '../types';

const AUTH_STORAGE_KEY = 'biovillage_auth_user';
const USERS_DB_KEY = 'biovillage_registered_users';
const STUDENTS_RECORD_KEY = 'biovillage_students_record';

// Built-in initial accounts
export const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    username: 'guru',
    password: 'guru123',
    role: 'guru',
    fullName: 'Ibu Ratna, S.Pd.',
    nama: 'Ibu Ratna, S.Pd.',
    avatar: '👩‍🏫',
    poin: 0,
    progres: {},
    lastActive: 'Baru saja'
  },
  {
    username: 'siswa',
    password: 'siswa123',
    role: 'siswa',
    fullName: 'Budi Santoso',
    nama: 'Budi Santoso',
    className: 'Kelas XI IPA 1',
    avatar: '👦',
    clearedStagesCount: 3,
    totalStars: 9,
    poin: 90,
    progres: {
      level1: true,
      level2: true,
      level3: true,
      level4: false,
      level5: false,
      level6: false,
      level7: false,
      level8: false
    },
    currentLevelLabel: 'Level 3 • Protein Express',
    lastActive: '10 menit lalu'
  },
  {
    username: 'ani',
    password: 'ani123',
    role: 'siswa',
    fullName: 'Ani Rahmawati',
    nama: 'Ani Rahmawati',
    className: 'Kelas XI IPA 1',
    avatar: '👧',
    clearedStagesCount: 8,
    totalStars: 24,
    poin: 240,
    progres: {
      level1: true,
      level2: true,
      level3: true,
      level4: true,
      level5: true,
      level6: true,
      level7: true,
      level8: true
    },
    currentLevelLabel: 'Level 8 • Pusat Komando Selesai',
    lastActive: '1 jam lalu'
  },
  {
    username: 'fauzan',
    password: 'fauzan123',
    role: 'siswa',
    fullName: 'Fauzan Hakim',
    nama: 'Fauzan Hakim',
    className: 'Kelas XI IPA 1',
    avatar: '🧑',
    clearedStagesCount: 5,
    totalStars: 15,
    poin: 150,
    progres: {
      level1: true,
      level2: true,
      level3: true,
      level4: true,
      level5: true,
      level6: false,
      level7: false,
      level8: false
    },
    currentLevelLabel: 'Level 5 • Gerbang Desa Sel',
    lastActive: '2 jam lalu'
  },
  {
    username: 'citra',
    password: 'citra123',
    role: 'siswa',
    fullName: 'Citra Permata',
    nama: 'Citra Permata',
    className: 'Kelas XI IPA 2',
    avatar: '👩',
    clearedStagesCount: 2,
    totalStars: 6,
    poin: 60,
    progres: {
      level1: true,
      level2: true,
      level3: false,
      level4: false,
      level5: false,
      level6: false,
      level7: false,
      level8: false
    },
    currentLevelLabel: 'Level 2 • Observatorium',
    lastActive: 'Kemarin'
  }
];

export const INITIAL_STUDENTS: StudentProgressRecord[] = [
  {
    id: 'std-001',
    username: 'siswa',
    fullName: 'Budi Santoso',
    nama: 'Budi Santoso',
    role: 'siswa',
    className: 'Kelas XI IPA 1',
    clearedStagesCount: 3,
    totalStages: 8,
    totalStars: 9,
    poin: 90,
    progres: {
      level1: true,
      level2: true,
      level3: true,
      level4: false,
      level5: false,
      level6: false,
      level7: false,
      level8: false
    },
    lastLevel: 'Level 3 • Protein Express',
    lastActive: '10 menit lalu',
    status: 'Sedang Berjalan'
  },
  {
    id: 'std-002',
    username: 'ani',
    fullName: 'Ani Rahmawati',
    nama: 'Ani Rahmawati',
    role: 'siswa',
    className: 'Kelas XI IPA 1',
    clearedStagesCount: 8,
    totalStages: 8,
    totalStars: 24,
    poin: 240,
    progres: {
      level1: true,
      level2: true,
      level3: true,
      level4: true,
      level5: true,
      level6: true,
      level7: true,
      level8: true
    },
    lastLevel: 'Level 8 • Pusat Komando Desa',
    lastActive: '1 jam lalu',
    status: 'Tuntas'
  },
  {
    id: 'std-003',
    username: 'fauzan',
    fullName: 'Fauzan Hakim',
    nama: 'Fauzan Hakim',
    role: 'siswa',
    className: 'Kelas XI IPA 1',
    clearedStagesCount: 5,
    totalStages: 8,
    totalStars: 15,
    poin: 150,
    progres: {
      level1: true,
      level2: true,
      level3: true,
      level4: true,
      level5: true,
      level6: false,
      level7: false,
      level8: false
    },
    lastLevel: 'Level 5 • Gerbang Masuk',
    lastActive: '2 jam lalu',
    status: 'Sedang Berjalan'
  },
  {
    id: 'std-004',
    username: 'citra',
    fullName: 'Citra Permata',
    nama: 'Citra Permata',
    role: 'siswa',
    className: 'Kelas XI IPA 2',
    clearedStagesCount: 2,
    totalStages: 8,
    totalStars: 6,
    poin: 60,
    progres: {
      level1: true,
      level2: true,
      level3: false,
      level4: false,
      level5: false,
      level6: false,
      level7: false,
      level8: false
    },
    lastLevel: 'Level 2 • Observatorium Sel',
    lastActive: 'Kemarin',
    status: 'Sedang Berjalan'
  },
  {
    id: 'std-005',
    username: 'dimas',
    fullName: 'Dimas Kurniawan',
    nama: 'Dimas Kurniawan',
    role: 'siswa',
    className: 'Kelas XI IPA 2',
    clearedStagesCount: 0,
    totalStages: 8,
    totalStars: 0,
    poin: 0,
    progres: {
      level1: false,
      level2: false,
      level3: false,
      level4: false,
      level5: false,
      level6: false,
      level7: false,
      level8: false
    },
    lastLevel: 'Belum Memulai',
    lastActive: '3 hari lalu',
    status: 'Belum Mulai'
  }
];

// Helper to get all registered accounts
function getRegisteredAccounts(): UserAccount[] {
  try {
    const custom = localStorage.getItem(USERS_DB_KEY);
    const customAccounts: UserAccount[] = custom ? JSON.parse(custom) : [];
    // Combine built-in with custom accounts (custom overrides built-in if same username)
    const combined = [...DEFAULT_ACCOUNTS];
    for (const c of customAccounts) {
      const idx = combined.findIndex(a => a.username.toLowerCase() === c.username.toLowerCase());
      if (idx >= 0) {
        combined[idx] = c;
      } else {
        combined.push(c);
      }
    }
    return combined;
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

// Get currently logged-in user from storage
export function getCurrentUser(): UserAccount | null {
  try {
    // Check localStorage first, then sessionStorage
    const local = localStorage.getItem(AUTH_STORAGE_KEY);
    if (local) return JSON.parse(local);

    const session = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (session) return JSON.parse(session);
  } catch {
    // ignore
  }
  return null;
}

// Login function (username-based, NO email)
export function loginUser(
  usernameInput: string,
  passwordInput: string,
  rememberMe: boolean = true
): { success: boolean; user?: UserAccount; error?: string } {
  const cleanUsername = usernameInput.trim().toLowerCase();
  const cleanPassword = passwordInput.trim();

  if (!cleanUsername) {
    return { success: false, error: 'Username wajib diisi.' };
  }
  if (!cleanPassword) {
    return { success: false, error: 'Password wajib diisi.' };
  }

  const allAccounts = getRegisteredAccounts();
  const matched = allAccounts.find(
    a => a.username.toLowerCase() === cleanUsername && a.password === cleanPassword
  );

  if (!matched) {
    // If username exists with different password
    const userExists = allAccounts.some(a => a.username.toLowerCase() === cleanUsername);
    if (userExists) {
      return { success: false, error: 'Password salah. Periksa kembali huruf besar/kecil.' };
    }
    return {
      success: false,
      error: 'Username tidak ditemukan. Silakan periksa kembali atau klik "Daftar di sini".'
    };
  }

  // Remove password from stored session
  const sessionUser: UserAccount = {
    username: matched.username,
    role: matched.role,
    fullName: matched.fullName || matched.nama || matched.username,
    nama: matched.nama || matched.fullName || matched.username,
    className: matched.className,
    avatar: matched.avatar || (matched.role === 'guru' ? '👩‍🏫' : '🎒'),
    clearedStagesCount: matched.clearedStagesCount || 0,
    totalStars: matched.totalStars || 0,
    poin: matched.poin !== undefined ? matched.poin : (matched.clearedStagesCount || 0) * 30,
    progres: matched.progres || {},
    currentLevelLabel: matched.currentLevelLabel || 'Level 1',
    lastActive: 'Baru saja'
  };

  const serialized = JSON.stringify(sessionUser);
  if (rememberMe) {
    localStorage.setItem(AUTH_STORAGE_KEY, serialized);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } else {
    sessionStorage.setItem(AUTH_STORAGE_KEY, serialized);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  return { success: true, user: sessionUser };
}

// Register new user (username-based, NO email)
export function registerUser(
  usernameInput: string,
  passwordInput: string,
  role: UserRole = 'siswa',
  fullNameInput?: string
): { success: boolean; user?: UserAccount; error?: string } {
  const cleanUsername = usernameInput.trim();
  const cleanPassword = passwordInput.trim();
  const displayName = (fullNameInput && fullNameInput.trim()) || cleanUsername;

  if (!cleanUsername) {
    return { success: false, error: 'Username tidak boleh kosong.' };
  }
  if (cleanUsername.length < 3) {
    return { success: false, error: 'Username minimal terdiri dari 3 karakter.' };
  }
  if (!cleanPassword) {
    return { success: false, error: 'Password tidak boleh kosong.' };
  }
  if (cleanPassword.length < 4) {
    return { success: false, error: 'Password minimal 4 karakter.' };
  }

  const allAccounts = getRegisteredAccounts();
  const alreadyExists = allAccounts.some(
    a => a.username.toLowerCase() === cleanUsername.toLowerCase()
  );

  if (alreadyExists) {
    return { success: false, error: 'Username tersebut sudah terdaftar. Silakan pilih username lain.' };
  }

  const newAccount: UserAccount = {
    username: cleanUsername,
    password: cleanPassword,
    role,
    fullName: displayName,
    nama: displayName,
    avatar: role === 'guru' ? '👨‍🏫' : '🎒',
    clearedStagesCount: 0,
    totalStars: 0,
    poin: 0,
    progres: {
      level1: false,
      level2: false,
      level3: false,
      level4: false,
      level5: false,
      level6: false,
      level7: false,
      level8: false
    },
    currentLevelLabel: 'Level 1 • Gerbang Desa',
    lastActive: 'Baru saja'
  };

  // Save into registered users
  try {
    const custom = localStorage.getItem(USERS_DB_KEY);
    const customAccounts: UserAccount[] = custom ? JSON.parse(custom) : [];
    customAccounts.push(newAccount);
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(customAccounts));
  } catch {
    // fallback
  }

  // If registering as student, also add to student list
  if (role === 'siswa') {
    addStudentRecord({
      id: `std-${Date.now()}`,
      username: cleanUsername,
      fullName: displayName,
      nama: displayName,
      role: 'siswa',
      className: 'Kelas XI IPA 1',
      clearedStagesCount: 0,
      totalStages: 8,
      totalStars: 0,
      poin: 0,
      progres: {
        level1: false,
        level2: false,
        level3: false,
        level4: false,
        level5: false,
        level6: false,
        level7: false,
        level8: false
      },
      lastLevel: 'Level 1 • Gerbang Desa',
      lastActive: 'Baru saja',
      status: 'Belum Mulai'
    });
  }

  // Auto-login registered user
  const sessionUser: UserAccount = {
    username: newAccount.username,
    role: newAccount.role,
    fullName: newAccount.fullName,
    nama: newAccount.nama,
    avatar: newAccount.avatar,
    clearedStagesCount: 0,
    totalStars: 0,
    poin: 0,
    progres: newAccount.progres,
    currentLevelLabel: 'Level 1',
    lastActive: 'Baru saja'
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
  return { success: true, user: sessionUser };
}

// Logout function
export function logoutUser(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

// Temporary answers cache (Requirement 4: preserve answers if session expires or requires login)
const TEMP_ANSWERS_STORAGE_KEY = 'biovillage_temp_answers_cache';

export function saveTemporaryAnswer(stageId: string, answerPayload: any): void {
  try {
    const raw = sessionStorage.getItem(TEMP_ANSWERS_STORAGE_KEY);
    const store = raw ? JSON.parse(raw) : {};
    store[stageId] = {
      timestamp: Date.now(),
      payload: answerPayload
    };
    sessionStorage.setItem(TEMP_ANSWERS_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

export function getTemporaryAnswer(stageId: string): any {
  try {
    const raw = sessionStorage.getItem(TEMP_ANSWERS_STORAGE_KEY);
    if (!raw) return null;
    const store = JSON.parse(raw);
    return store[stageId]?.payload || null;
  } catch {
    return null;
  }
}

export function clearTemporaryAnswer(stageId: string): void {
  try {
    const raw = sessionStorage.getItem(TEMP_ANSWERS_STORAGE_KEY);
    if (!raw) return;
    const store = JSON.parse(raw);
    delete store[stageId];
    sessionStorage.setItem(TEMP_ANSWERS_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

// Student records management for Teacher Dashboard
export function getStudentsList(): StudentProgressRecord[] {
  try {
    const saved = localStorage.getItem(STUDENTS_RECORD_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }
  return INITIAL_STUDENTS;
}

export function addStudentRecord(record: StudentProgressRecord): void {
  try {
    const list = getStudentsList();
    const existingIdx = list.findIndex(
      s => s.username.toLowerCase() === record.username.toLowerCase()
    );
    if (existingIdx >= 0) {
      list[existingIdx] = record;
    } else {
      list.unshift(record);
    }
    localStorage.setItem(STUDENTS_RECORD_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function deleteStudentRecord(username: string): void {
  try {
    const list = getStudentsList().filter(
      s => s.username.toLowerCase() !== username.toLowerCase()
    );
    localStorage.setItem(STUDENTS_RECORD_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function resetStudentProgress(username: string): void {
  try {
    const list = getStudentsList();
    const student = list.find(s => s.username.toLowerCase() === username.toLowerCase());
    if (student) {
      student.clearedStagesCount = 0;
      student.totalStars = 0;
      student.poin = 0;
      student.progres = {
        level1: false,
        level2: false,
        level3: false,
        level4: false,
        level5: false,
        level6: false,
        level7: false,
        level8: false
      };
      student.lastLevel = 'Level 1 • Gerbang Desa';
      student.status = 'Belum Mulai';
      student.lastActive = 'Baru saja di-reset';
      localStorage.setItem(STUDENTS_RECORD_KEY, JSON.stringify(list));
    }

    // Also update custom users DB if present
    const custom = localStorage.getItem(USERS_DB_KEY);
    if (custom) {
      const accounts: UserAccount[] = JSON.parse(custom);
      const acc = accounts.find(a => a.username.toLowerCase() === username.toLowerCase());
      if (acc) {
        acc.clearedStagesCount = 0;
        acc.totalStars = 0;
        acc.poin = 0;
        acc.progres = {
          level1: false,
          level2: false,
          level3: false,
          level4: false,
          level5: false,
          level6: false,
          level7: false,
          level8: false
        };
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(accounts));
      }
    }
  } catch {
    // ignore
  }
}

export function syncCurrentStudentProgress(
  username: string,
  clearedCount: number,
  stars: number
): void {
  try {
    const list = getStudentsList();
    const student = list.find(s => s.username.toLowerCase() === username.toLowerCase());
    const calculatedPoin = stars * 10;
    if (student) {
      student.clearedStagesCount = clearedCount;
      student.totalStars = stars;
      student.poin = calculatedPoin;
      student.lastActive = 'Baru saja';
      student.status = clearedCount >= 8 ? 'Tuntas' : clearedCount > 0 ? 'Sedang Berjalan' : 'Belum Mulai';
      student.lastLevel = `Level ${Math.min(clearedCount + 1, 8)}`;
      localStorage.setItem(STUDENTS_RECORD_KEY, JSON.stringify(list));
    }

    // Also update active session if it matches current user
    const current = getCurrentUser();
    if (current && current.username.toLowerCase() === username.toLowerCase()) {
      current.clearedStagesCount = clearedCount;
      current.totalStars = stars;
      current.poin = calculatedPoin;
      if (!current.progres) current.progres = {};
      for (let i = 1; i <= clearedCount; i++) {
        current.progres[`level${i}`] = true;
      }
      const serialized = JSON.stringify(current);
      if (localStorage.getItem(AUTH_STORAGE_KEY)) {
        localStorage.setItem(AUTH_STORAGE_KEY, serialized);
      } else {
        sessionStorage.setItem(AUTH_STORAGE_KEY, serialized);
      }
    }
  } catch {
    // ignore
  }
}

export function saveStudentStageClear(
  username: string,
  stageIndex: number,
  stars: number
): void {
  try {
    const current = getCurrentUser();
    const levelKey = stageIndex >= 2 && stageIndex <= 9 ? `level${stageIndex - 1}` : `level${stageIndex}`;
    
    // Update active student in records
    const list = getStudentsList();
    const student = list.find(s => s.username.toLowerCase() === username.toLowerCase());
    if (student) {
      if (!student.progres) student.progres = {};
      student.progres[levelKey] = true;
      const finishedCount = Object.values(student.progres).filter(Boolean).length;
      student.clearedStagesCount = Math.max(student.clearedStagesCount, finishedCount);
      student.totalStars = Math.max(student.totalStars, stars);
      student.poin = student.totalStars * 10;
      student.lastActive = 'Baru saja';
      student.status = student.clearedStagesCount >= 8 ? 'Tuntas' : 'Sedang Berjalan';
      student.lastLevel = `Level ${Math.min(student.clearedStagesCount + 1, 8)}`;
      localStorage.setItem(STUDENTS_RECORD_KEY, JSON.stringify(list));
    }

    if (current && current.username.toLowerCase() === username.toLowerCase()) {
      if (!current.progres) current.progres = {};
      current.progres[levelKey] = true;
      const count = Object.values(current.progres).filter(Boolean).length;
      current.clearedStagesCount = Math.max(current.clearedStagesCount || 0, count);
      current.totalStars = Math.max(current.totalStars || 0, stars);
      current.poin = (current.totalStars || 0) * 10;
      const serialized = JSON.stringify(current);
      if (localStorage.getItem(AUTH_STORAGE_KEY)) {
        localStorage.setItem(AUTH_STORAGE_KEY, serialized);
      } else {
        sessionStorage.setItem(AUTH_STORAGE_KEY, serialized);
      }
    }
  } catch {
    // ignore
  }
}
