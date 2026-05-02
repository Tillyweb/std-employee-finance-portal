// Simple hash for demo — use bcrypt in production
export function hashPassword(password: string): string {
  return btoa(password);
}

export function verifyPassword(password: string, hashed: string): boolean {
  return btoa(password) === hashed;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'เมื่อกี้';
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  if (days < 30) return `${days} วันที่แล้ว`;
  return new Date(timestamp).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}