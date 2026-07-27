export interface Student {
  id: string;
  name: string;
  class: 'X' | 'XI' | 'XII';
  room: string; // A - K
  gender: 'L' | 'P'; // Laki-laki / Perempuan
}

export interface AttendanceRecord {
  id: string; // Document ID: e.g. "2026-07-12_X_A"
  date: string; // YYYY-MM-DD
  class: 'X' | 'XI' | 'XII';
  room: string;
  records: {
    [studentId: string]: 'hadir' | 'sakit' | 'izin' | 'alpa';
  };
}

export interface Assignment {
  id: string;
  title: string;
  class: 'X' | 'XI' | 'XII';
  room: string;
  subject: string;
  dueDate: string;
  maxScore: number;
}

export interface GradeRecord {
  id: string; // assignmentId
  assignmentId: string;
  grades: {
    [studentId: string]: number; // score 0-100
  };
}

export interface Journal {
  id: string;
  date: string; // YYYY-MM-DD
  class: string; // e.g. "X-A"
  subject: string;
  topic: string;
  attendanceCount: string; // e.g. "32 Hadir, 2 Sakit"
  status: 'Selesai' | 'Belum Selesai';
}

export interface Material {
  id: string;
  title: string;
  subject: string;
  classScope: string; // e.g. "X-A", "XI-C" or "Umum"
  content: string;
  link: string;
  createdAt: string; // YYYY-MM-DD
}

export interface UserProfile {
  username: string;
  passwordHash: string; // We'll store password directly for simplicity or hashed
}
