// stores/useKullanici.ts
import type { Kullanici } from '~/types/izin'

export const useKullanici = defineStore('kullanici', {
  state: () => ({
    kullanici: null as Kullanici | null
  }),

  actions: {
    setKullanici(kullanici: Kullanici) {
      this.kullanici = kullanici
      // localStorage'a kaydet (opsiyonel - tarayıcı kapatılınca unutulsun istiyorsan kaldır)
      if (process.client) {
        localStorage.setItem('kullanici', JSON.stringify(kullanici))
      }
    },

    logout() {
      this.kullanici = null
      if (process.client) {
        localStorage.removeItem('kullanici')
      }
    },

    // Sayfa yenilendiğinde kullanıcı bilgilerini geri yükle
    initFromStorage() {
      if (process.client) {
        const stored = localStorage.getItem('kullanici')
        if (stored) {
          try {
            this.kullanici = JSON.parse(stored)
          } catch (error) {
            console.error('Kullanıcı bilgileri yüklenirken hata:', error)
            localStorage.removeItem('kullanici')
          }
        }
      }
    }
  },

  getters: {
    isLoggedIn: (state) => !!state.kullanici,
    isEmployee: (state) => state.kullanici?.rol === 'CALISAN',
    isManager: (state) => state.kullanici?.rol === 'YONETICI'
  }
})