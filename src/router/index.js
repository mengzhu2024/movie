
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/movieList',
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
      {
        path: '/Report',
        name: 'Report',
        component: () => import('../views/Report'),
        meta: {
          title: '投诉处理'
        }
      },
      {
        path: '/DataStatistic',
        name: 'DataStatistic',
        component: () => import('../views/DataStatistic'),
        meta: {
          title: '数据统计'
        }
      },
    ]
  },
  {
    path: '/front',
    name: 'FrontMain',
    component: () => import('../views/front/Main'),
    meta: {
      title: '电影商城'
    },
    children: [
      {
        path: '/movieList',
        name: 'movieList',
        component: () => import('../views/front/movieList'),
        meta: {
          title: '电影列表'
        }
      },
      {
        path: '/movieDetail',
        name: 'movieDetail',
        component: () => import('../views/front/movieDetail'),
        meta: {
          title: '电影详情'
        }
      },
      {
        path: '/myOrder',
        name: 'myOrder',
        component: () => import('../views/front/myOrder'),
        meta: {
          title: '我的订单'
        }
      },
      {
        path: '/UserInfo',
        name: 'UserInfo',
        component: () => import('../views/front/UserInfo'),
        meta: {
          title: '个人中心'
        }
      },
      {
        path: '/pay',
        name: 'pay',
        component: () => import('../views/front/pay'),
        meta: {
          title: '订单支付'
        }
      },
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
