<script setup lang="ts">
//Rol ve Kullanici tipleri import ediliyor
import type { Rol, Kullanici } from '~/types/izin'
import { useRouter } from 'vue-router'

const router = useRouter()
//Kullanıcının yazdığı ad bilgisini tutar.
const ad = ref('')
//Varsayılan rol “Çalışan” olarak ayarlanır
const rol = ref<Rol>('CALISAN')

//Kullanıcı "Devam Et" butonuna bastığında çalışır
//Ad boş mu kontrolü yapılıyor
const basla = async () => {
  if (!ad.value?.trim()) {
    alert('Lütfen adınızı giriniz')
    return
  }

  try {
    if (process.client) {
      const kullaniciStore = useKullanici()

      //Yeni kullanıcı oluşturuluyor
      const yeni: Kullanici = {
        id: crypto.randomUUID(),
        ad: ad.value.trim(),
        rol: rol.value
      }
      //Kullanıcı bilgisi store'a kaydediliyor
      kullaniciStore.setKullanici(yeni)

      // Doğru dizinlere yönlendir
      const url = rol.value === 'CALISAN' ? '/employee' : '/manager'
      await router.push(url)
    }
  } catch (error) {
    console.error('Hata oluştu:', error)
    alert('Bir hata oluştu. Lütfen tekrar deneyin.')
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold text-center mb-6">İzin Talep Sistemi</h1>
      
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Adınız</label>
          <input
            v-model="ad"
            type="text"
            placeholder="Adınızı giriniz"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rolünüz</label>
          <select
            v-model="rol"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="CALISAN">Çalışan</option>
            <option value="YONETICI">Yönetici</option>
          </select>
        </div>

        <button
          @click="basla"
          :disabled="!ad?.trim()"
          class="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Devam Et
        </button>
      </div>
    </div>
  </div>
</template>
