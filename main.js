//https://jxpj.neau.edu.cn/api/v1
import App from './App'
import { request, get, post, put, del } from '@/utils/request/request.js'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'

// 全局注册基础URL
Vue.prototype.$URL = 'http://localhost:8080'

// 全局注册请求方法
Vue.prototype.$request = request
Vue.prototype.$get = get
Vue.prototype.$post = post
Vue.prototype.$put = put
Vue.prototype.$del = del

Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'

export function createApp() {
  const app = createSSRApp(App)
  
  app.config.globalProperties.$URL = 'http://localhost:8080'
  
  app.config.globalProperties.$request = request
  app.config.globalProperties.$get = get
  app.config.globalProperties.$post = post
  app.config.globalProperties.$put = put
  app.config.globalProperties.$del = del
  
  return {
    app
  }
}
// #endif