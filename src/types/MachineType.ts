import { Brand } from "./MachineBrand";

export interface Type {
	id: number;
	nama: string;
	merk_mesin_id: number;
	merk: Brand;
	mesin_count: number;
	keterangan: string;
}

export interface CreateType {
	nama: string;
	keterangan: string;
	merk_mesin_id: number;
}

export interface UpdateType {
	id: number;
	nama: string;
	keterangan: string;
	merk_mesin_id: number;
}