type EntryProduct = {
  no: number
  jenis_pabean: string
  no_pabean: string
  tgl_pabean: string // ISO date string
  no_bukti: string
  tgl_bukti: string // ISO date string
  pengirim_barang: string
  kode_barang: string
  nama_barang: string
  jumlah: number
  sat: string
  valas?: string | null
  nilai: number | string
  ket?: string | null
}