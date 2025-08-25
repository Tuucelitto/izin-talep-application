# İzin Talep Uygulaması

Şirket içi izin yönetim sürecini dijitalleştirerek çalışanların kolayca izin talebi oluşturmasını, yöneticilerin ise bu talepleri hızlıca onaylamasını veya reddetmesini sağlayan web tabanlı bir uygulama.

## 🚀 Özellikler

### Çalışanlar (Employee)
- İzin talebi oluşturma (Yıllık, Hastalık, Ücretsiz, Diğer)
- Geçmiş talepleri görüntüleme
- Bekleyen talepleri iptal etme
- Tarih aralığı seçimi
- Açıklama ekleme

### Yöneticiler (Manager)
- Tüm izin taleplerini listeleme
- Talepleri onaylama/reddetme
- Not ekleme
- Filtreleme ve arama
- Durum takibi

## 🛠️ Teknolojiler

- **Frontend Framework**: Nuxt 3
- **UI Kütüphanesi**: PrimeVue 3
- **State Yönetimi**: Pinia
- **Veri Depolama**: LocalStorage
- **Dil**: TypeScript
- **CSS Framework**: Tailwind CSS (utility classes)

## 📦 Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

3. Tarayıcınızda `http://localhost:3000` adresini açın

## 🏗️ Proje Yapısı

```
izin-talep-app/
├── app/
│   └── app.vue                 # Ana uygulama bileşeni
├
├── pages/
│   ├── index.vue              # Giriş sayfası
│   ├── employee/
│   │   └── index.vue         # Çalışan paneli
│   └── manager/
│       └── index.vue         # Yönetici paneli
├── plugins/
│   └── primevue.client.ts    # PrimeVue bileşenleri
├── stores/
│   ├── useIzinler.ts         # İzin yönetimi store
│   └── useKullanici.ts      # Kullanıcı yönetimi store
├── types/
│   └── izin.ts              # Tip tanımları
└── nuxt.config.ts           # Nuxt yapılandırması
```

## 🔧 Kullanım

### Giriş
1. Ana sayfada adınızı girin
2. Rolünüzü seçin (Çalışan veya Yönetici)
3. "Devam Et" butonuna tıklayın

### Çalışan Paneli
1. **Yeni İzin Talebi**: İzin türü, tarih aralığı ve açıklama girin
2. **Taleplerim**: Mevcut taleplerinizi görüntüleyin ve bekleyenleri iptal edin

### Yönetici Paneli
1. **Tüm Talepler**: Tüm çalışanların izin taleplerini görüntüleyin
2. **Onay/Red**: Bekleyen talepleri onaylayın veya reddedin
3. **Not Ekleme**: Onay/red işlemlerinde not ekleyin

## 💾 Veri Saklama

Uygulama verileri tarayıcının LocalStorage'ında saklanır:
- `izinler`: Tüm izin talepleri
- `kullanici`: Giriş yapan kullanıcı bilgileri

## 🎨 UI Bileşenleri

PrimeVue bileşenleri kullanılmıştır:
- Button, InputText, Calendar, Textarea
- DataTable, Column, Tag, Dialog, Dropdown

## 🔒 Güvenlik

- Rol tabanlı erişim kontrolü
- Kullanıcı doğrulama
- Oturum yönetimi

## 🚀 Geliştirme

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit yapın (`git commit -m 'Add some AmazingFeature'`)
4. Push yapın (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📞 İletişim

Proje hakkında sorularınız için issue açabilirsiniz.
