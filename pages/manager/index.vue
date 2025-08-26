<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useKullanici } from '~/stores/useKullanici'
import { useIzinler } from '~/stores/useIzinler'
import { navigateTo } from '#app'
import axios from 'axios' // JSON Server ile iletişim için

// PrimeVue bileşenleri
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'

// SSR kontrolü: sunucu tarafında çalışıyorsa 404 göster
if (process.server) {
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
}

// Store'lar
const kullaniciStore = useKullanici()
const izinler = useIzinler() as ReturnType<typeof useIzinler> // init gibi action'ları tanıyabilmesi için

// JSON Server URL - düzeltildi
const API_URL = 'http://localhost:3001/izinler'

// Sayfa yüklendiğinde kullanıcı yoksa ana sayfaya yönlendir
onMounted(async () => {
  if (!kullaniciStore.kullanici) {
    navigateTo('/')
    return
  }
  if (kullaniciStore.kullanici.rol !== 'YONETICI') {
    navigateTo('/')
    return
  }

  // JSON Server'dan izinleri çek
  await fetchIzinler()
})

// Filtreler
const filtreler = ref({
  durum: { value: null, matchMode: 'equals' }
})

// Dialog kontrol değişkenleri
const showDialog = ref(false)
const seciliId = ref<string | null>(null)
const notMetni = ref('')
const islem = ref<'ONAY' | 'RED' | null>(null)

// Dialog açma fonksiyonu
const acDialog = (id: string, act: 'ONAY' | 'RED') => {
  seciliId.value = id
  islem.value = act
  showDialog.value = true
  notMetni.value = ''
}

// İzinleri JSON Server'dan çek
const fetchIzinler = async () => {
  try {
    const res = await axios.get(API_URL)
    izinler.izinler = res.data // Pinia state'e yükle
  } catch (error) {
    console.error('İzinler yüklenirken hata:', error)
  }
}

// Onayla / Reddet fonksiyonu - düzeltildi
const onaylaReddet = async () => {
  if (!seciliId.value || !islem.value) return

  try {
    const izin = izinler.izinler.find(i => i.id === seciliId.value)
    if (!izin) return

    const durum = islem.value === 'ONAY' ? 'ONAYLANDI' : 'REDDEDILDI' as const
    
    // Güncellenen izin objesi
    const guncellenenIzin = {
      ...izin,
      durum: durum as 'ONAYLANDI' | 'REDDEDILDI',
      ...(notMetni.value && { not: notMetni.value })
    }

    // JSON Server'a PUT isteği ile güncelle
    await axios.put(`${API_URL}/${izin.id}`, guncellenenIzin)

    // Store'daki veriyi de güncelle
    const index = izinler.izinler.findIndex(i => i.id === seciliId.value)
    if (index > -1) {
      izinler.izinler[index] = guncellenenIzin
    }

    alert(`İzin talebi ${durum === 'ONAYLANDI' ? 'onaylandı' : 'reddedildi'}!`)
    showDialog.value = false
  } catch (error) {
    console.error('İzin güncellenirken hata:', error)
    alert('İzin güncellenirken bir hata oluştu!')
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
  <div class="p-6 max-w-6xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Yönetici Paneli</h1>
        <p class="text-gray-600">Hoş geldin, {{ kullaniciStore.kullanici?.ad }}</p>
      </div>
      <Button label="Çıkış Yap" severity="secondary" @click="logout" />
    </div>

    <!-- Tüm İzin Talepleri -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-bold mb-4">Tüm İzin Talepleri</h2>

      <DataTable 
        :value="izinler.izinler" 
        :filters="filtreler" 
        filterDisplay="menu"
        paginator 
        :rows="10" 
        :rowsPerPageOptions="[5,10,20]"
        class="w-full"
      >
        <Column field="calisanAd" header="Çalışan" sortable filter filterPlaceholder="Ara..." />
        <Column field="tur" header="Tür" sortable />
        <Column field="baslangic" header="Başlangıç" sortable>
          <template #body="slotProps">
            {{ formatTarih(slotProps.data.baslangic) }}
          </template>
        </Column>
        <Column field="bitis" header="Bitiş" sortable>
          <template #body="slotProps">
            {{ formatTarih(slotProps.data.bitis) }}
          </template>
        </Column>
        <Column field="gun" header="Gün" sortable>
          <template #body="slotProps">
            {{ izinler.gunHesapla(slotProps.data.baslangic, slotProps.data.bitis) }}
          </template>
        </Column>

        <!-- Açıklama sütunu -->
        <Column field="aciklama" header="Açıklama">
          <template #body="slotProps">
            <span v-if="slotProps.data.aciklama">{{ slotProps.data.aciklama }}</span>
            <span v-else class="text-gray-400 italic">-</span>
          </template>
        </Column>

        <Column field="durum" header="Durum" filter filterPlaceholder="Durum seç">
          <template #body="slotProps">
            <Tag
              :value="slotProps.data.durum"
              :severity="slotProps.data.durum === 'ONAYLANDI' ? 'success' :
                         slotProps.data.durum === 'REDDEDILDI' ? 'danger' :
                         slotProps.data.durum === 'IPTAL_EDILDI' ? 'warn' : 'info'" />
          </template>
        </Column>
        
        <Column header="İşlem">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button 
                v-if="slotProps.data.durum === 'BEKLEMEDE'" 
                label="Onayla" 
                size="small" 
                severity="success"
                @click="acDialog(slotProps.data.id,'ONAY')" 
              />
              <Button 
                v-if="slotProps.data.durum === 'BEKLEMEDE'" 
                label="Reddet" 
                size="small" 
                severity="danger"
                @click="acDialog(slotProps.data.id,'RED')" 
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Onay/Red Dialog -->
    <Dialog v-model:visible="showDialog" :header="islem === 'ONAY' ? 'İzin Onayla' : 'İzin Reddet'" modal>
      <div class="space-y-4">
        <p class="text-gray-700">
          {{ islem === 'ONAY' ? 'İzin talebini onaylamak istediğinizden emin misiniz?' : 'İzin talebini reddetmek istediğinizden emin misiniz?' }}
        </p>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Not (Opsiyonel)</label>
          <Textarea 
            v-model="notMetni" 
            rows="3" 
            placeholder="Opsiyonel not ekleyin..." 
            class="w-full"
          />
        </div>
      </div>
      
      <div class="flex justify-end gap-2 mt-6">
        <Button label="Vazgeç" text @click="showDialog = false" />
        <Button 
          :label="islem === 'ONAY' ? 'Onayla' : 'Reddet'" 
          :severity="islem === 'ONAY' ? 'success' : 'danger'"
          @click="onaylaReddet" 
        />
      </div>
    </Dialog>
  </div>
</template>