// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueSocketIO from "vue-socket.io";
import SocketIO from "socket.io-client";
import axios from 'axios'
Vue.prototype.$socketIO = SocketIO;
const baseSocket = 'https://101.69.255.131'　
// const baseSocket = 'https://192.168.1.167'
Vue.prototype.socketApi = baseSocket
Vue.use(new VueSocketIO({
  debug: true,
  connection: SocketIO.connect(baseSocket, {
    path: '',
    transports: ['websocket', 'xhr-polling', 'jsonp-polling'],
  })
}));
Vue.config.productionTip = false
Vue.prototype.$axios = axios;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
