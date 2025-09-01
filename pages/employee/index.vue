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
import Badge from 'primevue/badge'

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

// Tamamlanmış izinleri filtrele (ONAYLANDI veya REDDEDILDI)
const tamamlanmisIzinler = computed(() => {
  return izinler.calisanTalebi(kullaniciStore.kullanici?.id || '')
                 .filter(i => i.durum === 'ONAYLANDI' || i.durum === 'REDDEDILDI')
                 .sort((a, b) => new Date(b.karar_tarihi || b.olusturmaTarihi).getTime() - new Date(a.karar_tarihi || a.olusturmaTarihi).getTime())
})

// İzin iptal etme fonksiyonu - JSON Server'a DELETE isteği eklendi
const iptalEt = async (izinId: string) => {
  if (!confirm('İzin talebini iptal etmek istediğinizden emin misiniz?')) {
    return
  }

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

// Durum badge'i için renk ve ikon belirleme
const getDurumBadge = (durum: string) => {
  switch (durum) {
    case 'ONAYLANDI':
      return { severity: 'success', icon: 'pi pi-check-circle', text: 'Onaylandı' }
    case 'REDDEDILDI':
      return { severity: 'danger', icon: 'pi pi-times-circle', text: 'Reddedildi' }
    default:
      return { severity: 'warning', icon: 'pi pi-clock', text: 'Beklemede' }
  }
}

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

        <!-- Yeni İzin Talebi Formu -->
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

        <!-- Beklemede Olan İzinler -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Beklemede Olan İzinlerim</h2>
          
          <ul class="space-y-4">
            <li v-for="izin in beklemedeIzinler" :key="izin.id" class="flex justify-between items-center bg-gray-50 rounded-lg p-4 transition-transform transform hover:scale-[1.01]">
              <div class="flex-grow">
                <div class="flex items-center gap-4">
                  <span class="font-medium text-gray-800">{{ formatTarih(izin.baslangic) }} - {{ formatTarih(izin.bitis) }}</span>
                  <Badge :value="izin.tur" class="bg-blue-100 text-blue-800" />
                </div>
                <p v-if="izin.aciklama" class="text-sm text-gray-600 mt-2 italic">{{ izin.aciklama }}</p>
              </div>
              <Button 
                label="İptal Et" 
                severity="danger" 
                icon="pi pi-times"
                size="small"
                class="ml-4"
                @click="iptalEt(izin.id)" 
              />
            </li>
          </ul>

          <div v-if="beklemedeIzinler.length === 0" class="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
            <i class="pi pi-clock text-4xl mb-3 block"></i>
            <p>Beklemede izin talebi bulunmamaktadır.</p>
          </div>
        </div>

        <!-- Tamamlanmış İzinler (Onaylanmış/Reddedilmiş) -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">İzin Geçmişim</h2>
          
          <ul class="space-y-4">
            <li v-for="izin in tamamlanmisIzinler" :key="izin.id" class="bg-gray-50 rounded-lg p-4 transition-transform transform hover:scale-[1.01]">
              <div class="flex justify-between items-start">
                <div class="flex-grow">
                  <div class="flex items-center gap-4 mb-2">
                    <span class="font-medium text-gray-800">{{ formatTarih(izin.baslangic) }} - {{ formatTarih(izin.bitis) }}</span>
                    <Badge :value="izin.tur" class="bg-blue-100 text-blue-800" />
                  </div>
                  
                  <!-- Yönetici Notu (eğer varsa) -->
                  <div v-if="izin.not" class="my-3 p-3 bg-amber-50 border-l-4 border-amber-400 rounded">
                    <p class="text-sm font-medium text-amber-800 mb-1">
                      <i class="pi pi-comment mr-1"></i>
                      Yönetici Notu:
                    </p>
                    <p class="text-sm text-amber-700 italic">{{ izin.not }}</p>
                  </div>
                  
                  <!-- Çalışan Açıklaması (eğer varsa) -->
                  <p v-if="izin.aciklama" class="text-sm text-gray-600 italic">
                    <strong>Açıklama:</strong> {{ izin.aciklama }}
                  </p>
                  
                  <!-- Karar Tarihi -->
                  <p v-if="izin.karar_tarihi" class="text-xs text-gray-500 mt-2">
                    Karar Tarihi: {{ formatTarih(izin.karar_tarihi) }}
                  </p>
                </div>
                
                <!-- Durum Badge'i -->
                <div class="ml-4 flex-shrink-0">
                  <Badge 
                    :value="getDurumBadge(izin.durum).text"
                    :severity="getDurumBadge(izin.durum).severity"
                    class="text-sm font-semibold px-3 py-1"
                  >
                    <template #default>
                      <i :class="getDurumBadge(izin.durum).icon" class="mr-1"></i>
                      {{ getDurumBadge(izin.durum).text }}
                    </template>
                  </Badge>
                </div>
              </div>
            </li>
          </ul>

          <div v-if="tamamlanmisIzinler.length === 0" class="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
            <i class="pi pi-history text-4xl mb-3 block"></i>
            <p>Henüz tamamlanmış izin kaydı bulunmamaktadır.</p>
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

.p-button.p-button-danger {
  background-color: #ef4444 !important;
  border-color: #ef4444 !important;
  color: white !important;
}
.p-button.p-button-danger:hover {
  background-color: #dc2626 !important;
  border-color: #dc2626 !important;
}

/* Badge stilleri */
.p-badge.p-badge-success {
  background-color: #10b981 !important;
  color: white !important;
}

.p-badge.p-badge-danger {
  background-color: #ef4444 !important;
  color: white !important;
}

.p-badge.p-badge-warning {
  background-color: #f59e0b !important;
  color: white !important;
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

/* Yönetici notu kutusu */
.bg-amber-50 {
  background-color: #fffbeb;
}

.border-amber-400 {
  border-color: #fbbf24;
}

.text-amber-800 {
  color: #92400e;
}

.text-amber-700 {
  color: #b45309;
}

body {
  background-color: #f9fafb;
}
</style>

