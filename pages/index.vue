<script setup lang="ts">
import type { Rol, Kullanici } from '~/types/izin'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// Reactive değişkenler
const selectedRole = ref<Rol | ''>('')
const selectedUserId = ref('')
const password = ref('')
const users = ref<Kullanici[]>([])
const loading = ref(false)
const loginLoading = ref(false)
const showPassword = ref(false)

// JSON Server URL
const API_URL = 'http://localhost:3001'

// Rol seçildiğinde kullanıcıları yükle
const fetchUsersByRole = async () => {
  if (!selectedRole.value) {
    users.value = []
    selectedUserId.value = ''
    password.value = ''
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
    password.value = '' // Şifre alanını sıfırla
    
    console.log('Yüklenen kullanıcılar:', users.value)
    
  } catch (error) {
    console.error('Kullanıcılar yüklenirken hata:', error)
    alert('Kullanıcılar yüklenirken bir hata oluştu!')
    users.value = []
  } finally {
    loading.value = false
  }
}

// Kullanıcı seçildiğinde şifre alanını sıfırla
const onUserChange = () => {
  password.value = ''
}

// Rol değiştiğinde kullanıcıları yükle
watch(selectedRole, fetchUsersByRole)

// Kullanıcı değiştiğinde şifreyi sıfırla
watch(selectedUserId, onUserChange)

// Giriş yap fonksiyonu
const basla = async () => {
  if (!selectedUserId.value) {
    alert('Lütfen bir kullanıcı seçiniz')
    return
  }

  if (!password.value.trim()) {
    alert('Lütfen şifrenizi giriniz')
    return
  }

  try {
    loginLoading.value = true
    
    // Seçilen kullanıcıyı bul
    const selectedUser = users.value.find(user => user.id === selectedUserId.value)
    
    if (!selectedUser) {
      alert('Seçilen kullanıcı bulunamadı!')
      return
    }

    // Şifre kontrolü
    if (selectedUser.sifre !== password.value.trim()) {
      alert('Şifre yanlış! Lütfen tekrar deneyiniz.')
      password.value = '' // Yanlış şifre girildiyse alanı temizle
      return
    }

    // Kullanıcı bilgisi store'a kaydediliyor
    const kullaniciStore = useKullanici()
    kullaniciStore.setKullanici(selectedUser)

    console.log('Giriş başarılı:', selectedUser.ad)

    // Doğru sayfaya yönlendir
    const url = selectedUser.rol === 'CALISAN' ? '/employee' : '/manager'
    await router.push(url)
    
  } catch (error) {
    console.error('Giriş hatası:', error)
    alert('Giriş yapılırken bir hata oluştu!')
  } finally {
    loginLoading.value = false
  }
}

// Enter tuşu ile giriş
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && selectedUserId.value && password.value.trim()) {
    basla()
  }
}

// Seçilen kullanıcının bilgilerini göster
const selectedUser = computed(() => {
  return users.value.find(user => user.id === selectedUserId.value)
})

// Form geçerliliği kontrolü
const isFormValid = computed(() => {
  return selectedUserId.value && password.value.trim().length > 0
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
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">İzin Talep Sistemi</h1>
        <p class="text-gray-600">Güvenli giriş yapın</p>
      </div>
      
      <div class="flex flex-col gap-6">
        <!-- 1. ADIM: Rol Seçimi -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            1. Adım: Rolünüzü Seçin
          </label>
          <select
            v-model="selectedRole"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
          <div v-if="loading" class="w-full px-4 py-3 text-gray-500 text-center border border-gray-300 rounded-lg bg-gray-50">
            <div class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ selectedRole === 'CALISAN' ? 'Çalışanlar' : 'Yöneticiler' }} yükleniyor...
            </div>
          </div>
          
          <!-- Kullanıcı seçimi -->
          <select
            v-else
            v-model="selectedUserId"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
          <p v-if="!loading && users.length > 0" class="text-sm text-gray-500 mt-2">
            {{ users.length }} {{ selectedRole === 'CALISAN' ? 'çalışan' : 'yönetici' }} bulundu
          </p>
        </div>

        <!-- 3. ADIM: Şifre Girişi -->
        <div v-if="selectedUserId">
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            3. Adım: Şifrenizi Girin
          </label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Şifrenizi giriniz"
              class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              @keypress="handleKeyPress"
              autocomplete="current-password"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- 4. ADIM: Seçilen Kullanıcı Bilgileri -->
        <div v-if="selectedUser" class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <p class="text-sm text-gray-600 mb-2">
            <strong>Seçilen Kullanıcı:</strong>
          </p>
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                   :class="selectedUser.rol === 'YONETICI' ? 'bg-purple-500' : 'bg-blue-500'">
                {{ selectedUser.ad.charAt(0) }}
              </div>
            </div>
            <div>
              <p class="text-lg font-semibold text-gray-800">{{ selectedUser.ad }}</p>
              <p class="text-sm text-gray-600">
                <span :class="selectedUser.rol === 'YONETICI' ? 'text-purple-600' : 'text-blue-600'" class="font-medium">
                  {{ selectedUser.rol === 'YONETICI' ? 'Yönetici' : 'Çalışan' }}
                </span>
                • {{ selectedUser.email }}
              </p>
            </div>
          </div>
        </div>

        <!-- 5. ADIM: Giriş Butonu -->
        <button
          @click="basla"
          :disabled="!isFormValid || loginLoading"
          class="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:shadow-none"
        >
          <div class="flex items-center justify-center">
            <svg v-if="loginLoading" class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-if="loginLoading">Giriş yapılıyor...</span>
            <span v-else-if="isFormValid">🔐 Güvenli Giriş Yap</span>
            <span v-else>Bilgileri tamamlayın</span>
          </div>
        </button>
        
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Özel animasyonlar */
.transition-all {
  transition: all 0.3s ease;
}

/* Fokus durumunda input kenarlığı */
input:focus, select:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Devre dışı durumlar */
select:disabled, input:disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

/* Gradient arka plan animasyonu */
.bg-gradient-to-br {
  background-size: 200% 200%;
  animation: gradient 15s ease infinite;
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Hover efektleri */
button:not(:disabled):hover {
  transform: translateY(-1px);
}

/* Şifre ipucu sadece development'ta görünsün */
</style>