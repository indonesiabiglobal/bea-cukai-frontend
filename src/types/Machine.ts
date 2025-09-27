import { Brand } from "./MachineBrand";
import { Type } from "./MachineType";

export interface Machine {
	id: number;
	kode_mesin: string;
	nama: string;
	ip_address: string;
	port: string;
	comm_key: number;
	tipe_mesin_id: number;
	tipe_mesin: Type;
	merk: Brand | null;
	keterangan: string;
}

export interface CreateMachine {
	nama: string;
	ip_address: string;
	port: string;
	comm_key: number;
	tipe_mesin_id: number;
	keterangan: string;
}

export interface UpdateMachine {
	id: number;
	nama: string;
	ip_address: string;
	port: string;
	comm_key: number;
	tipe_mesin_id: number;
	tipe_mesin: Type | null;
	merk_id: number | null;
	merk: Brand | null;
	keterangan: string;
}