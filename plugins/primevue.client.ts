import { defineNuxtPlugin } from '#app'
import PrimeVue from 'primevue/config'

// PrimeVue bileşenlerini import et
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Calendar from 'primevue/calendar'
import Textarea from 'primevue/textarea'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import 'primevue/resources/themes/saga-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'

export default defineNuxtPlugin((nuxtApp) => {
  // PrimeVue'yu Vue app'e ekle
  nuxtApp.vueApp.use(PrimeVue)

  // Bileşenleri global olarak kaydet
  nuxtApp.vueApp.component('Button', Button)
  nuxtApp.vueApp.component('InputText', InputText)
  nuxtApp.vueApp.component('Calendar', Calendar)
  nuxtApp.vueApp.component('Textarea', Textarea)
  nuxtApp.vueApp.component('DataTable', DataTable)
  nuxtApp.vueApp.component('Column', Column)
  nuxtApp.vueApp.component('Tag', Tag)
  nuxtApp.vueApp.component('Dialog', Dialog)
  nuxtApp.vueApp.component('Dropdown', Dropdown)
})
