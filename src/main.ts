import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useTheme } from './composables/useTheme'
import './styles/index.css'

const app = createApp(App)
app.use(router)
app.mount('#app')

useTheme().initTheme()
