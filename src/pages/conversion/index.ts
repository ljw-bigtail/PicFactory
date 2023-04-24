import { createApp } from "vue";
// import 'modern-css-reset'

import { Message } from "@/components";
import App from "./index.vue";

createApp(App).use(Message).mount("#app");
