import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from '../components/Login.vue'
import MyIndex from '../components/MyIndex.vue'
import Many from '../components/Many.vue'
import Loo from '../components/Loo.vue'
import test from '../components/test.vue'

Vue.use(VueRouter)
const routes = [
  {
    path: '/',
    redirect:'/login'
  },
  {
    path: '/login',
    name:'Login',
    component: Login
  },
  {
    path: '/myindex',
    name:'MyIndex',
    component: MyIndex
  },
  {
    path: '/test',
    name:'test',
    component: test
  },
  {
    path: '/many',
    name:'Many',
    component: Many
  },
  {
    path: '/loo/:roomid/:account',
    name:'Loo',
    component: Loo
  },
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

export default router