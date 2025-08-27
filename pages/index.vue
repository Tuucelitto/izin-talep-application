<script setup lang="ts">
import type { Rol, Kullanici } from '~/types/izin'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// Reactive değişkenler
const selectedRole = ref<Rol | ''>('')
const selectedUserId = ref('')
const users = ref<Kullanici[]>([])
const loading = ref(false)

// JSON Server URL
const API_URL = 'http://localhost:3001'

// Rol seçildiğinde kullanıcıları yükle
const fetchUsersByRole = async () => {
  if (!selectedRole.value) {
    users.value = []
    selectedUserId.value = ''
    return
  }

  try {
    loading.value = true
    console.log('Kullanıcılar yükleniyor, rol:', selectedRole.value)
    
    // Tüm kullanıcıları çek ve client tarafında filtrele
    const response = await axios.get(`${API_URL}/users`)
    
    // Seçilen role göre kullanıcıları filtrele
    users.value = response.data.filter((user: Kullanici) => user.rol === selectedRole.value)
    selectedUserId.value = '' // Kullanıcı seçimini sıfırla
    
    console.log('Yüklenen kullanıcılar:', users.value)
    console.log('Toplam kullanıcı sayısı:', response.data.length)
    console.log('Filtrelenmiş kullanıcı sayısı:', users.value.length)
    
  } catch (error) {
    console.error('Kullanıcılar yüklenirken hata:', error)
    alert('Kullanıcılar yüklenirken bir hata oluştu! Konsolu kontrol edin.')
    users.value = []
  } finally {
    loading.value = false
  }
}

// Rol değiştiğinde kullanıcıları yükle
watch(selectedRole, fetchUsersByRole)

// Giriş yap fonksiyonu
const basla = async () => {
  if (!selectedUserId.value) {
    alert('Lütfen bir kullanıcı seçiniz')
    return
  }

  try {
    const kullaniciStore = useKullanici()
    
    // Seçilen kullanıcıyı bul
    const selectedUser = users.value.find(user => user.id === selectedUserId.value)
    
    if (!selectedUser) {
      alert('Seçilen kullanıcı bulunamadı!')
      return
    }

    // Kullanıcı bilgisi store'a kaydediliyor
    kullaniciStore.setKullanici(selectedUser)

    // Doğru sayfaya yönlendir
    const url = selectedUser.rol === 'CALISAN' ? '/employee' : '/manager'
    await router.push(url)
  } catch (error) {
    console.error('Giriş hatası:', error)
    alert('Giriş yapılırken bir hata oluştu!')
  }
}

// Seçilen kullanıcının bilgilerini göster
const selectedUser = computed(() => {
  return users.value.find(user => user.id === selectedUserId.value)
})

// Debug için API bağlantısını test et
const testApiConnection = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`)
    console.log('API Test - Başarılı:', response.data)
    return true
  } catch (error) {
    console.error('API Test - Başarısız:', error)
    return false
  }
}

// Sayfa yüklendiğinde API bağlantısını test et
onMounted(() => {
  testApiConnection()
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100">
    <div class="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center">
      <h1 class="text-3xl font-extrabold text-center mb-6 text-gray-800 border-b-2 border-blue-500 pb-3">
        İzin Talep Sistemi
      </h1>
      
      <div class="flex flex-col gap-6 w-full">
        <!-- 1. ADIM: Rol Seçimi -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            1. Adım: Rolünüzü Seçin
          </label>
          <select
            v-model="selectedRole"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Bir rol seçin...</option>
            <option value="CALISAN">Çalışan</option>
            <option value="YONETICI">Yönetici</option>
          </select>
        </div>

        <!-- 2. ADIM: Kullanıcı Seçimi -->
        <div v-if="selectedRole">
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            2. Adım: Kullanıcınızı Seçin
          </label>
          
          <!-- Loading durumu -->
          <div v-if="loading" class="w-full px-4 py-3 text-gray-500 text-center border rounded-lg">
            {{ selectedRole === 'CALISAN' ? 'Çalışanlar' : 'Yöneticiler' }} yükleniyor...
          </div>
          
          <!-- Kullanıcı seçimi -->
          <select
            v-else
            v-model="selectedUserId"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              {{ users.length > 0 ? 'Bir kullanıcı seçin...' : 'Bu rol için kullanıcı bulunamadı' }}
            </option>
            <option 
              v-for="user in users" 
              :key="user.id" 
              :value="user.id"
            >
              {{ user.ad }}
            </option>
          </select>
          
          <!-- Kullanıcı sayısı bilgisi -->
          <p v-if="!loading && users.length > 0" class="text-xs text-gray-500 mt-2">
            {{ users.length }} {{ selectedRole === 'CALISAN' ? 'çalışan' : 'yönetici' }} bulundu
          </p>
          
          <!-- Kullanıcı bulunamadı mesajı -->
          <p v-else-if="!loading && users.length === 0" class="text-xs text-red-500 mt-2">
            {{ selectedRole === 'CALISAN' ? 'Çalışan' : 'Yönetici' }} bulunamadı
          </p>
        </div>

        <!-- 3. ADIM: Seçilen Kullanıcı Bilgileri -->
        <div v-if="selectedUser" class="bg-gray-50 p-4 rounded-lg border shadow-sm">
          <p class="text-sm text-gray-600 mb-1">
            <strong>Seçilen Kullanıcı:</strong>
          </p>
          <p class="text-lg font-semibold text-gray-800">{{ selectedUser.ad }}</p>
          <p class="text-sm text-gray-600">
            <strong>Rol:</strong> 
            <span :class="selectedUser.rol === 'YONETICI' ? 'text-purple-600' : 'text-blue-600'">
              {{ selectedUser.rol === 'YONETICI' ? 'Yönetici' : 'Çalışan' }}
            </span>
          </p>
          <p v-if="selectedUser.email" class="text-sm text-gray-600">
            <strong>Email:</strong> {{ selectedUser.email }}
          </p>
        </div>

        <!-- 4. ADIM: Giriş Butonu -->
        <button
          @click="basla"
          :disabled="!selectedUserId"
          class="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-md"
        >
          <span v-if="selectedUserId">Giriş Yap</span>
          <span v-else>Önce kullanıcı seçin</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
select:disabled {
  background-color: #f9fafb;
  color: #6b7280;
}
</style>
