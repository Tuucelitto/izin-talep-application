<template>
  <NuxtPage />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useKullanici } from '~/stores/useKullanici'
import { useIzinler } from '~/stores/useIzinler'

/*
onMounted(() => {
  if (process.client) {
    const kullaniciStore = useKullanici()
    const izinStore = useIzinler()

    kullaniciStore.init()
    izinStore.init()
  }
})
*/
</script>
<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f3f4f6; /* Hafif gri arka plan */
}
</style>
