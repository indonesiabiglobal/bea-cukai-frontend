// src/types/Form/Doctor/DoctorSchedule.ts

export interface DoctorSchedule {
	id: number;
	day_code: number;
	day_name: string;
	start_time: Date;
	end_time: Date;
}

export interface FormDoctorSchedule {
	id?: number;
	day_code: number;
	start_time: Date;
	end_time: Date;
}
