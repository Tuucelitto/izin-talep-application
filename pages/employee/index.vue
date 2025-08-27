<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios' // JSON Server ile iletişim için eklendi
// Kullanıcı ve izin store'ları
import { useKullanici } from '~/stores/useKullanici'
import { useIzinler } from '~/stores/useIzinler'
import { navigateTo } from '#app'

// Middleware ile rol kontrolü
definePageMeta({
  middleware: 'auth'
})

// PrimeVue bileşenleri
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'

// SSR kontrolü: sunucu tarafında çalışıyorsa 404 göster
if (process.server) {
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
}

// JSON Server URL - düzeltildi
const API_URL = 'http://localhost:3001/izinler'

// Store'lar
const kullaniciStore = useKullanici()
const izinler = useIzinler()

// Sayfa yüklendiğinde izinleri yükle
onMounted(async () => {
  // Store'dan kullanıcı bilgilerini yükle
  kullaniciStore.initFromStorage()
  
  // JSON Server'dan izinleri yükle
  await fetchIzinler()
})

// JSON Server'dan izinleri çek - yeni fonksiyon
const fetchIzinler = async () => {
  try {
    const response = await axios.get(API_URL)
    izinler.izinler = response.data // Pinia state'e yükle
  } catch (error) {
    console.error('İzinler yüklenirken hata:', error)
  }
}

// İzin talebi formu için reactive değişkenler
const tur = ref<'Yıllık' | 'Hastalık' | 'Ücretsiz' | 'Diğer'>('Yıllık')
const tarihAraligi = ref<[Date, Date] | null>(null)
const aciklama = ref('')

// TypeScript güvenli: kullanıcı adı
const kullaniciAd = computed(() => kullaniciStore.kullanici?.ad || '')

// İzin talebi gönderme fonksiyonu - JSON Server'a POST isteği eklendi
const gonder = async () => {
  if (!kullaniciStore.kullanici || !tarihAraligi.value) {
    alert('Lütfen tüm alanları doldurunuz')
    return
  }

  const [baslangic, bitis] = tarihAraligi.value

  // Yeni izin talebi objesi
  const yeniIzin = {
    calisanId: kullaniciStore.kullanici.id,
    calisanAd: kullaniciStore.kullanici.ad,
    tur: tur.value,
    baslangic: baslangic.toISOString(),
    bitis: bitis.toISOString(),
    aciklama: aciklama.value,
    durum: 'BEKLEMEDE',
    olusturmaTarihi: new Date().toISOString()
  }

  try {
    // JSON Server'a POST isteği gönder
    const response = await axios.post(API_URL, yeniIzin)
    
    // Store'a da ekle (ID ile birlikte)
    izinler.izinler.push(response.data)

    // Formu sıfırla
    aciklama.value = ''
    tarihAraligi.value = null

    alert('İzin talebiniz başarıyla gönderildi!')
  } catch (error) {
    console.error('İzin talebi gönderilirken hata:', error)
    alert('İzin talebi gönderilirken bir hata oluştu!')
  }
}

// Beklemede olan izinleri filtrele
const beklemedeIzinler = computed(() => {
  return izinler.calisanTalebi(kullaniciStore.kullanici?.id || '')
                 .filter(i => i.durum === 'BEKLEMEDE')
})

// İzin iptal etme fonksiyonu - JSON Server'a DELETE isteği eklendi
const iptalEt = async (izinId: string) => {
  try {
    // JSON Server'dan sil
    await axios.delete(`${API_URL}/${izinId}`)
    
    // Store'dan da kaldır
    const index = izinler.izinler.findIndex(i => i.id === izinId)
    if (index > -1) {
      izinler.izinler.splice(index, 1)
    }
    
    alert('İzin talebi iptal edildi!')
  } catch (error) {
    console.error('İzin iptal edilirken hata:', error)
    alert('İzin iptal edilirken bir hata oluştu!')
  }
}

// Tarihi Türkçe formatta göster
const formatTarih = (tarih: string) => new Date(tarih).toLocaleDateString('tr-TR')

// Çıkış yapma fonksiyonu
const logout = () => {
  kullaniciStore.logout()
  navigateTo('/')
}
</script>

<template>
  <ClientOnly>
    <div class="bg-gray-100 min-h-screen p-6">
      <div class="p-6 max-w-4xl mx-auto space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Çalışan Paneli</h1>
            <p class="text-gray-600 mt-1">Hoş geldin, {{ kullaniciAd }}</p>
          </div>
          <!-- Çıkış yap butonu: primary (mavi) olarak ayarlandı -->
          <Button label="Çıkış Yap" severity="primary" icon="pi pi-sign-out" @click="logout" />
        </div>

        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Yeni İzin Talebi Oluştur</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">İzin Türü</label>
              <Dropdown v-model="tur" :options="['Yıllık','Hastalık','Ücretsiz','Diğer']" class="w-full" placeholder="İzin türü seçiniz" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Tarih Aralığı</label>
              <Calendar v-model="tarihAraligi" selectionMode="range" dateFormat="dd/mm/yy" class="w-full" placeholder="Tarih seçiniz" :minDate="new Date()" />
            </div>
          </div>
          <div class="mt-6">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Açıklama (Opsiyonel)</label>
            <Textarea v-model="aciklama" rows="3" placeholder="İzin talebiniz hakkında açıklama..." class="w-full" />
          </div>
          <div class="mt-6">
            <!-- İzin Talebi Gönder butonu: success (yeşil) olarak ayarlandı -->
            <Button label="İzin Talebi Gönder" severity="success" @click="gonder" :disabled="!tarihAraligi || !tarihAraligi[0] || !tarihAraligi[1]" class="w-full md:w-auto" />
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Beklemede Olan İzinlerim</h2>
          
          <ul class="space-y-4">
            <li v-for="izin in beklemedeIzinler" :key="izin.id" class="flex justify-between items-center bg-gray-50 rounded-lg p-4 transition-transform transform hover:scale-[1.01]">
              <div class="flex-grow">
                <span class="font-medium text-gray-800">{{ formatTarih(izin.baslangic) }} - {{ formatTarih(izin.bitis) }}</span>
                <span class="ml-4 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{{ izin.tur }}</span>
              </div>
              <Button 
                label="İptal Et" 
                severity="danger" 
                icon="pi pi-times"
                class="ml-4"
                @click="iptalEt(izin.id)" 
              />
            </li>
          </ul>

          <div v-if="beklemedeIzinler.length === 0" class="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
            <p>Beklemede izin talebi bulunmamaktadır.</p>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<style scoped>
/* Buton renklerini bu bileşene özgü olarak tanımlıyoruz */
.p-button.p-button-success {
  background-color: #10b981 !important; /* Tailwind'in yeşil-500 rengi */
  border-color: #10b981 !important;
  color: white !important;
}
.p-button.p-button-success:hover {
  background-color: #059669 !important; /* Tailwind'in yeşil-600 rengi */
  border-color: #059669 !important;
}

.p-button.p-button-primary {
  background-color: #3b82f6 !important; /* Tailwind'in mavi-500 rengi */
  border-color: #3b82f6 !important;
  color: white !important;
}
.p-button.p-button-primary:hover {
  background-color: #2563eb !important; /* Tailwind'in mavi-600 rengi */
  border-color: #2563eb !important;
}

/* Diğer bileşenlerin stilleri */
.p-dropdown .p-dropdown-panel .p-dropdown-items .p-dropdown-item {
  color: #374151;
}
.p-calendar, .p-dropdown, .p-textarea {
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: all 0.2s;
}
.p-calendar:focus-within, .p-dropdown:focus-within, .p-textarea:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

body {
  background-color: #f9fafb;
}
</style>