export const formatTanggal = (dateString) => {
    const bulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
  
    const tanggal = new Date(dateString);
    const hari = tanggal.getDate().toString().padStart(2, "0");
    const bulanNama = bulan[tanggal.getMonth()];
    const tahun = tanggal.getFullYear();
  
    return `${hari}-${bulanNama}-${tahun}`;
  };
  