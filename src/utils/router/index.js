import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/pages/login/Login.vue'; 
import Home from '@/pages/index/index.vue';   
import Mine from '@/pages/mine/index.vue';   
// 定义路由规则
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      noNeedLogin: true 
    }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: {
      needLogin: true 
    }
  },
  {
    path: '/mine',
    name: 'Mine',
    component: Mine,
    meta: {
      needLogin: true 
    }
  }
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(), 
  routes
});

// 🌟 全局前置路由守卫：每次跳转前拦截判断登录态
router.beforeEach((to, from, next) => {

  const token = uni.getStorageSync('openid');
  
  // 判断目标页面是否需要登录
  const needLogin = to.meta.needLogin;
  
  if (needLogin) {
    if (openid) {
      
      next();
    } else {
      next({
        name: 'Login',
        query: {
          redirect: to.fullPath
        }
      });
    }
  } else {
    next();
  }
});

export default router;