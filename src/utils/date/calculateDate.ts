import { parse, differenceInSeconds } from 'date-fns';
// menghitung selisih jam shift
export const calculateHour = (start: string, end: string) => {
  const startTime = parse(start, 'HH:mm:ss', new Date())
  const endTime = parse(end, 'HH:mm:ss', new Date())

  // Jika melewati tengah malam
  if (endTime < startTime) {
    // Tambahkan satu hari ke endTime
    endTime.setDate(endTime.getDate() + 1);
  }

  // Menghitung selisih waktu dalam detik
  const diffInSeconds = differenceInSeconds(endTime, startTime);

  // Mengonversi selisih ke HH:mm:ss
  const hours = Math.floor(diffInSeconds / 3600); // Jam
  const minutes = Math.floor((diffInSeconds % 3600) / 60); // Menit

  // Format hasil
  const formattedDifference = `${String(hours)}h ${String(minutes)}m`;
  return formattedDifference;
}