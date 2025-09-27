export interface ScheduleDetail {
	pola_hari: number; 
	tanggal_shift: Date, 
	shift: any; 
}

export interface FormManualScheduleDate {
	tanggal_shift: Date;
	nip_pegawai: string;
	shift: any;
	hari_libur: boolean;
}