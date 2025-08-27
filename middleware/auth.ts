// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  // SSR kontrolü
  if (process.server) {
    return
  }

  const kullaniciStore = useKullanici()
  const kullanici = kullaniciStore.kullanici

  // Kullanıcı giriş yapmamışsa ana sayfaya yönlendir
  if (!kullanici) {
    return navigateTo('/')
  }

  // Employee sayfası için çalışan kontrolü
  if (to.path.startsWith('/employee') && kullanici.rol !== 'CALISAN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Bu sayfaya erişim yetkiniz yoktur. (Sadece çalışanlar erişebilir)'
    })
  }

  // Manager sayfası için yönetici kontrolü  
  if (to.path.startsWith('/manager') && kullanici.rol !== 'YONETICI') {
    throw createError({
      statusCode: 403, 
      statusMessage: 'Bu sayfaya erişim yetkiniz yoktur. (Sadece yöneticiler erişebilir)'
    })
  }
})