import { defineStore } from 'pinia'
import type { Izin } from '~/types/izin'

// JSON Server base URL (örnek)
const API_URL = 'http://localhost:3001'

// İzinleri yönetmek için Pinia store
//izinler store’un benzersiz ismi, Pinia bunu internal olarak kullanır
export const useIzinler = defineStore('izinler', {
  state: () => ({
    izinler: [] as Izin[],  // Tüm izinler burada tutulacak
    loading: false
  }),

  getters: {
    // Tüm izinleri döndür
    tum: (state) => state.izinler,
    // Belirli bir çalışana ait izinleri döndür
    calisanTalebi: (state) => (calisanId: string) =>
      state.izinler.filter(izin => izin.calisanId === calisanId)
  },

  actions: {
    // JSON Server’dan izinleri çek
    async fetchFromServer() {
      try {
        this.loading = true
        const res = await fetch(API_URL)
        const data = await res.json()
        this.izinler = data // State'i güncelle
      } catch (error) {
        console.error('İzinler yüklenirken hata:', error)
      } finally {
        this.loading = false
      }
    },

    /*
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
    */

    // Yeni izin oluştur ve server’a gönder
    async olustur(izinData: Omit<Izin, 'id' | 'durum' | 'olusturmaTarihi'>) {
      const yeniIzin: Izin = {
        id: crypto.randomUUID(),           // Benzersiz ID
        durum: 'BEKLEMEDE',                // Başlangıç durumu
        olusturmaTarihi: new Date().toISOString(), // Oluşturulma zamanı
        ...izinData
      }

            try {
        // POST isteği ile server’a kaydet
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(yeniIzin)
        })
        const saved = await res.json()
        this.izinler.push(saved) // State’e ekle
      } catch (error) {
        console.error('İzin oluşturulurken hata:', error)
      }
    },


    // İzni onayla ve opsiyonel not ekle
    async onayla(id: string, not?: string) {
      const izin = this.izinler.find(i => i.id === id)
      if (!izin) return
      izin.durum = 'ONAYLANDI'
      if (not) izin.not = not

      try {
        // PATCH ile server tarafını güncelle
        await fetch(`${API_URL}/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ durum: izin.durum, not: izin.not })
        })
      } catch (error) {
        console.error('İzin onaylanırken hata:', error)
      }
    },


    // İzni reddet ve opsiyonel not ekle
    async reddet(id: string, not?: string) {
      const izin = this.izinler.find(i => i.id === id)
      if (!izin) return
      izin.durum = 'REDDEDILDI'
      if (not) izin.not = not

      try {
        // PATCH ile server tarafını güncelle
        await fetch(`${API_URL}/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ durum: izin.durum, not: izin.not })
        })
      } catch (error) {
        console.error('İzin reddedilirken hata:', error)
      }
    },

    // Çalışan kendi iznini iptal edebilir (sadece beklemedeyse)
    async iptal(id: string, calisanId: string) {
      const izin = this.izinler.find(i => i.id === id && i.calisanId === calisanId)
      if (!izin || izin.durum !== 'BEKLEMEDE') return
      izin.durum = 'IPTAL_EDILDI'

      try {
        // PATCH ile server tarafını güncelle
        await fetch(`${API_URL}/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ durum: izin.durum })
        })
      } catch (error) {
        console.error('İzin iptal edilirken hata:', error)
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
