export const setTime = (hour: number, minute: number): Date => {
  const now = new Date();
  now.setHours(hour, minute, 0, 0); // Mengatur jam, menit, detik, dan milidetik
  return now; // Mengembalikan objek Date
};