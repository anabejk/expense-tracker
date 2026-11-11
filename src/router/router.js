import { createRouter, createWebHistory } from "vue-router";
import HomeScreen from "../views/HomeScreen.vue";
import FormScreen from "../views/FormScreen.vue";
import TotalScreen from "../views/TotalScreen.vue";

export default createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', component: HomeScreen, name: 'home' },
        { path: '/form', component: FormScreen, name: 'form' },
        { path: '/total', component: TotalScreen, name: 'total' }
    ],
    linkActiveClass: 'active',
    linkExactActiveClass: 'active'
})
