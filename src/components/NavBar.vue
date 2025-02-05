<template>
  <div class="dock">
    <div class="dock-container">
      <li v-for="(icon, index) in icons" :key="index" :class="`li-${index + 1}`" class="dock-item"
          @mouseover="focus(index)" @mouseleave="resetIcons" @click="handleClick(icon)">
        <div class="name">{{ icon.name }}</div>
        <img class="ico" :src="icon.src" alt="" ref="dockIcons" />
      </li>
    </div>
  </div>
</template>

<script setup>
import { useWindowStore } from "@/stores/WindowStore";
import { ref } from "vue";
import notionIcon from "@/assets/navbar/notion.png";

const windowStore = useWindowStore();

const icons = ref([
  { name: "blog", src: notionIcon },
  { name: "Premiere Pro", src: "https://uploads-ssl.webflow.com/5f7081c044fb7b3321ac260e/5f70853ff3bafbac60495771_siri.png" },
  { name: "Settings", src: "https://uploads-ssl.webflow.com/5f7081c044fb7b3321ac260e/5f70853943597517f128b9b4_launchpad.png" },
]);

const dockIcons = ref([]);

const resetIcons = () => {
  dockIcons.value.forEach((iconEl) => {
    iconEl.style.transform = "scale(1) translateY(0px)";
  });
};

const focus = (index) => {
  resetIcons();
  const transformations = [
    { idx: index - 2, scale: 1.1, translateY: 0 },
    { idx: index - 1, scale: 1.2, translateY: -6 },
    { idx: index, scale: 1.5, translateY: -10 },
    { idx: index + 1, scale: 1.2, translateY: -6 },
    { idx: index + 2, scale: 1.1, translateY: 0 },
  ];
  transformations.forEach(({ idx, scale, translateY }) => {
    if (dockIcons.value[idx]) {
      dockIcons.value[idx].style.transform = `scale(${scale}) translateY(${translateY}px)`;
    }
  });
};

const handleClick = (icon) => {
  const winItem = windowStore.windows.find((win) => win.name === icon.name);
  if (winItem) {
    if (winItem.closed || winItem.minimized) {
      windowStore.restoreWindow(winItem.id);
    } else {
      windowStore.toggleMinimized(winItem.id);
    }
  }
};


</script>

<style scoped>
/* 기존 Dock 관련 스타일 그대로 사용 */
.dock {
  width: auto;
  height: 60px;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
}
.dock-container {
  padding: 3px;
  width: auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: rgba(83, 83, 83, 0.25);
  backdrop-filter: blur(13px);
  -webkit-backdrop-filter: blur(13px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}
.dock-item {
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  vertical-align: bottom;
  transition: 0.2s;
  transform-origin: 50% 100%;
}
.dock-item:hover {
  margin: 0px 13px;
}
.name {
  position: absolute;
  top: -55px;
  background: rgba(0, 0, 0, 0.5);
  color: rgba(255, 255, 255, 0.9);
  height: 10px;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  visibility: hidden;
}
.name::after {
  content: "";
  position: absolute;
  bottom: -10px;
  width: 0;
  height: 0;
  backdrop-filter: blur(13px);
  -webkit-backdrop-filter: blur(13px);
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid rgba(0, 0, 0, 0.5);
}
.dock-item:hover .name {
  visibility: visible !important;
}
.ico {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
</style>
