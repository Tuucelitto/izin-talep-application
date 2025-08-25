import { defineStore } from 'pinia'
import type { Kullanici, Rol } from '~/types/izin'

export const useKullanici = defineStore('kullanici', {
  state: () => ({
    kullanici: null as Kullanici | null
  }),

  getters: {
    rol: (state) => state.kullanici?.rol || 'CALISAN',
    ad: (state) => state.kullanici?.ad || '',
    isAuthenticated: (state) => !!state.kullanici
  },

  actions: {
    init() {
      // Client-side'da çalıştığından emin ol
      if (process.client) {
        this.loadFromStorage()
      }
    },

    loadFromStorage() {
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('kullanici')
          if (stored) {
            this.kullanici = JSON.parse(stored)
          }
        }
      } catch (error) {
        console.error('Kullanıcı yüklenirken hata:', error)
      }
    },

    saveToStorage() {
      try {
        if (typeof window !== 'undefined' && this.kullanici) {
          localStorage.setItem('kullanici', JSON.stringify(this.kullanici))
        }
      } catch (error) {
        console.error('Kullanıcı kaydedilirken hata:', error)
      }
    },

    setKullanici(kullanici: Kullanici) {
      this.kullanici = kullanici
      this.saveToStorage()
    },

    setRol(yeniRol: Rol) {
      if (this.kullanici) {
        this.kullanici.rol = yeniRol
        this.saveToStorage()
      }
    },

    setAd(yeniAd: string) {
      if (this.kullanici) {
        this.kullanici.ad = yeniAd
        this.saveToStorage()
      }
    },

    logout() {
      this.kullanici = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('kullanici')
      }
    }
  }
})
