<script setup lang="ts">
// Client-side rendering kontrolü
if (process.server) {
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
}

const kullaniciStore = useKullanici()
const izinler = useIzinler()

onMounted(() => {
  if (!kullaniciStore.kullanici) {
    navigateTo('/')
    return
  }
  if (kullaniciStore.kullanici.rol !== 'YONETICI') {
    navigateTo('/')
    return
  }
  izinler.init()
})

const filtreler = ref({
  durum: { value: null, matchMode: 'equals' }
})

const showDialog = ref(false)
const seciliId = ref<string | null>(null)
const notMetni = ref('')
const islem = ref<'ONAY' | 'RED' | null>(null)

const acDialog = (id: string, act: 'ONAY' | 'RED') => {
  seciliId.value = id
  islem.value = act
  showDialog.value = true
  notMetni.value = ''
}

const onaylaReddet = () => {
  if (!seciliId.value || !islem.value) return
  
  if (islem.value === 'ONAY') {
    izinler.onayla(seciliId.value, notMetni.value)
    alert('İzin talebi onaylandı!')
  }
  if (islem.value === 'RED') {
    izinler.reddet(seciliId.value, notMetni.value)
    alert('İzin talebi reddedildi!')
  }
  
  showDialog.value = false
}

const formatTarih = (tarih: string) => {
  return new Date(tarih).toLocaleDateString('tr-TR')
}

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
        :value="izinler.tum" 
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

        <!-- Yeni sütun: Açıklama -->
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


