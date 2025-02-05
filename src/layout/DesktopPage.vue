<template>
  <v-app>
    <TopNav />
    <v-main>
      <v-container fluid class="desktop-container">
        <!-- 'blog' 창만 렌더링 (다른 창들도 추가 가능) -->
        <WindowComponent
          v-for="window in windowStore.windows.filter(win => win.name === 'blog')"
          :key="window.id"
          v-show="!window.minimized && !window.closed"
          :name="window.name"
          :maximized="window.maximized"
        >
          <!-- router-view를 WindowComponent 내부에 전달 -->
          <router-view></router-view>
        </WindowComponent>
      </v-container>
      <NavBar />
    </v-main>
  </v-app>
</template>

<script setup>
import { useWindowStore } from "@/stores/WindowStore";
import NavBar from "@/components/NavBar.vue";
import TopNav from "@/components/TopNav.vue";
import WindowComponent from "@/components/WindowComponent.vue";

// Pinia 스토어 사용
const windowStore = useWindowStore();
</script>

<style scoped>
.desktop-container {
  padding: 0;
  position: relative;
  height: calc(100vh - 30px);
  background-color: gray;
  overflow: hidden;
}
</style>
