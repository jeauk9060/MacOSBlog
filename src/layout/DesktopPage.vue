<template>
  <v-app>
    <TopNav />
    <v-main>
      <v-container fluid class="desktop-container">
        <WindowComponent />
      </v-container>
      <NavBar />
    </v-main>
  </v-app>
</template>

<script setup>
import NavBar from "@/components/NavBar.vue";
import TopNav from "@/components/TopNav.vue";
import WindowComponent from "@/components/WindowComponent.vue";
</script>

<style scoped>
.desktop-container {
  padding: 0px;
  position: relative;
  height: calc(100vh - 30px);
  /* TopNav의 높이를 제외한 영역 */
  background-color: gray;
  overflow: hidden;
}
</style>
