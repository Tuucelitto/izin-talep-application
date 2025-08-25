// plugins/pinia-store-sync.ts
import { defineNuxtPlugin } from '#app';
import { useIzinler } from '~/stores/useIzinler';

export default defineNuxtPlugin(() => {
  // Client-side'da çalıştığından emin ol
  if (process.client) {
    const izinlerStore = useIzinler(); 

    // Uygulama yüklendiğinde verileri localStorage'dan çek
    izinlerStore.init();

    // Store'da herhangi bir değişiklik olduğunda localStorage'a kaydet
    izinlerStore.$subscribe(() => {
      izinlerStore.saveToStorage();
    });
  }
});