import { createApp } from 'vue'
// import 'modern-css-reset'

import App from './index.vue'
import {Message} from '@/components'

const app = createApp(App)

app.use(Message)

app.mount('#app')
