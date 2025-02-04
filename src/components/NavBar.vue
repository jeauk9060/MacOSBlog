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

// Pinia 스토어
const windowStore = useWindowStore();

// 아이콘 데이터
const icons = ref([
  { name: "blog", src: notionIcon },
  { name: "Premiere Pro", src: "https://uploads-ssl.webflow.com/5f7081c044fb7b3321ac260e/5f70853ff3bafbac60495771_siri.png" },
  { name: "Settings", src: "https://uploads-ssl.webflow.com/5f7081c044fb7b3321ac260e/5f70853943597517f128b9b4_launchpad.png" },
]);

// Dock 아이콘 애니메이션 상태
const dockIcons = ref([]);

// 아이콘 초기화
const resetIcons = () => {
  dockIcons.value.forEach((icon) => {
    icon.style.transform = "scale(1) translateY(0px)";
  });
};

// 아이콘 포커스 애니메이션
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

// 아이콘 클릭 핸들러
const handleClick = (icon) => {
  const window = windowStore.windows.find((win) => win.name === icon.name);

  if (window) {
    if (window.closed) {
      window.closed = false; // 창을 다시 열기
      window.minimized = false; // 최소화 해제
      window.maximized = false; // 최대화 해제 (옵션)
      return;
    }

    // 창이 닫혀있지 않다면 최소화 상태 토글
    windowStore.toggleMinimized(icon.name);
  }
};


</script>


<style scoped>
*,
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: "San Francisco";
}

@font-face {
  font-family: "San Francisco";
  font-weight: 400;
  src: url("https://applesocial.s3.amazonaws.com/assets/styles/fonts/sanfrancisco/sanfranciscodisplay-regular-webfont.woff");
}

@font-face {
  font-family: "San Francisco";
  font-weight: 800;
  src: url("https://applesocial.s3.amazonaws.com/assets/styles/fonts/sanfrancisco/sanfranciscodisplay-bold-webfont.woff");
}

body {
  background: url(https://uhdwallpapers.org/uploads/converted/20/06/25/macos-big-sur-wwdc-2560x1440_785884-mm-90.jpg);
}

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
  margin: 0px 13px 0px 13px;
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
  transition: 0.2s;
  display: inline-block;
  transition: transform 0.3s ease;
}
</style>
