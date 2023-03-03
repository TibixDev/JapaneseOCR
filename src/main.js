import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHashHistory } from "vue-router"
import routes from "./routes.js";
import VueSweetalert2 from "vue-sweetalert2";

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

import '@sweetalert2/theme-dark';

createApp(App).use(router).use(VueSweetalert2).mount('#app')