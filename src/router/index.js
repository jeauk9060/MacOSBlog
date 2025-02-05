import { createRouter, createWebHistory } from 'vue-router';
import DesktopPage from '@/layout/DesktopPage.vue';
import MainPage from '@/components/content/MainPage.vue';
import NotionList from '@/components/content/NotionList.vue';
import NotionDetail from '@/components/content/NotionDetail.vue';

const routes = [
  {
    path: '/',
    component: DesktopPage,
    children: [
      { path: '', component: MainPage },
      { path: 'post', component: NotionList },
      { path: 'post/:index', component: NotionDetail },
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
