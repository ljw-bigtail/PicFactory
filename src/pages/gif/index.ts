import { createApp } from 'vue'
import App from './index.vue'

import Message from '../../components/Message/Message'

const app = createApp(App)

app
  .use(Message)
  .mount('#app')
  