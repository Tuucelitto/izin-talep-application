import { defineStore } from 'pinia'
import type { Izin } from '~/types/izin'

// İzinleri yönetmek için Pinia store
//izinler store’un benzersiz ismi, Pinia bunu internal olarak kullanır
export const useIzinler = defineStore('izinler', {
  state: () => ({
    izinler: [] as Izin[],
    loading: false
  }),

  getters: {
    tum: (state) => state.izinler,
    calisanTalebi: (state) => (calisanId: string) => 
      state.izinler.filter(izin => izin.calisanId === calisanId)
  },

  actions: {
    init() {
      // Client-side'da çalıştığından emin ol
      if (process.client) {
        // LocalStorage'dan izinleri yükle
        this.loadFromStorage()
      }
    },

    //LocalStorage’dan kaydedilmiş izinleri alır ve izinler state’ine yükler
    loadFromStorage() {
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('izinler')
          if (stored) {
            this.izinler = JSON.parse(stored)
          }
        }
      } catch (error) {
        console.error('İzinler yüklenirken hata:', error)
      }
    },

    //İzinler state’ini LocalStorage’a kaydeder
    //Bu sayede sayfa yenilense bile veriler korunur
    saveToStorage() {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('izinler', JSON.stringify(this.izinler))
        }
      } catch (error) {
        console.error('İzinler kaydedilirken hata:', error)
      }
    },

    olustur(izinData: Omit<Izin, 'id' | 'durum' | 'olusturmaTarihi'>) {
      const yeniIzin: Izin = {
        id: crypto.randomUUID(),
        durum: 'BEKLEMEDE',
        olusturmaTarihi: new Date().toISOString(),
        ...izinData
      }
      // Yeni izni state’e ekle ve LocalStorage’a kaydet
      this.izinler.push(yeniIzin)
      //this.saveToStorage()
    },

    // İzni onayla ve opsiyonel not ekle
    onayla(id: string, not?: string) {
      const izin = this.izinler.find(i => i.id === id)
      if (izin) {
        izin.durum = 'ONAYLANDI'
        if (not) izin.not = not
        //this.saveToStorage()
      }
    },

    // İzni reddet ve opsiyonel not ekle
    reddet(id: string, not?: string) {
      const izin = this.izinler.find(i => i.id === id)
      if (izin) {
        izin.durum = 'REDDEDILDI'
        if (not) izin.not = not
        //this.saveToStorage()
      }
    },

    // Çalışan kendi iznini iptal edebilir (sadece beklemedeyse)
    iptal(id: string, calisanId: string) {
      const izin = this.izinler.find(i => i.id === id && i.calisanId === calisanId)
      if (izin && izin.durum === 'BEKLEMEDE') {
        izin.durum = 'IPTAL_EDILDI'
        //this.saveToStorage()
      }
    },

    // Gün hesaplama yardımcı metodu
    gunHesapla(baslangic: string, bitis: string): number {
      const baslangicDate = new Date(baslangic)
      const bitisDate = new Date(bitis)
      const diffTime = Math.abs(bitisDate.getTime() - baslangicDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays + 1 // Başlangıç günü dahil
    }
  }
})
