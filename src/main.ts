import './assets/main.css'
import * as Cesium from 'cesium'

const cesiumToken = import.meta.env.VITE_CESIUM_ION_TOKEN as string
if (cesiumToken) {
  Cesium.Ion.defaultAccessToken = cesiumToken
}

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
