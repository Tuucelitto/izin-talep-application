export interface Izin {
  id: string
  calisanId: string
  calisanAd: string
  tur: 'Yıllık' | 'Hastalık' | 'Ücretsiz' | 'Diğer'
  baslangic: string
  bitis: string
  aciklama: string
  durum: 'BEKLEMEDE' | 'ONAYLANDI' | 'REDDEDILDI' | 'IPTAL_EDILDI'
  not?: string
  olusturmaTarihi: string
  karar_tarihi?: string
}

export interface Kullanici {
  id: string
  ad: string
  rol: 'CALISAN' | 'YONETICI'
  email?: string // Opsiyonel email alanı
  sifre: string // Şifre alanı
}

export type Rol = 'CALISAN' | 'YONETICI'


