import { createApp } from "vue";
import VueKonva from 'vue-konva'
// import 'modern-css-reset'

import { Message } from "@/components";
import App from "./index.vue";

createApp(App).use(VueKonva).use(Message).mount("#app");
