
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login',
    meta: {
      title: '系统首页'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login'),
    meta: {
      title: '欢迎登陆'
    }
  },
  {
    path: '/main',
    name: 'Main',
    component: () => import('../views/Main'),
    meta: {
      title: '主页面'
    },
    children: [
      {
        path: '/User',
        name: 'User',
        component: () => import('../views/User'),
        meta: {
          title: '用户管理'
        }
      },
      {
        path: '/Admin',
        name: 'Admin',
        component: () => import('../views/Admin'),
        meta: {
          title: '管理员管理'
        }
      },
      {
        path: '/MovieType',
        name: 'MovieType',
        component: () => import('../views/MovieType'),
        meta: {
          title: '电影分类'
        }
      },
      {
        path: '/Movie',
        name: 'Movie',
        component: () => import('../views/Movie'),
        meta: {
          title: '电影管理'
        }
      },
      {
        path: '/MovieHall',
        name: 'MovieHall',
        component: () => import('../views/MovieHall'),
        meta: {
          title: '影厅管理'
        }
      },
      {
        path: '/MovieSession',
        name: 'MovieSession',
        component: () => import('../views/MovieSession'),
        meta: {
          title: '场次管理'
        }
      },
      {
        path: '/UserOrder',
        name: 'UserOrder',
        component: () => import('../views/UserOrder'),
        meta: {
          title: '用户订单'
        }
      },
    ]
  },
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
