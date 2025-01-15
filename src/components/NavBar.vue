<template>
  <nav class="dock" @mousemove="handleMouseMove" @mouseleave="resetDock">
    <div v-for="(item, index) in items" :key="index" class="item" :style="{ width: itemWidths[index] + 'px' }">
      <img :src="item.icon" :alt="item.name" />
      <p>{{ item.name }}</p>
    </div>
  </nav>
</template>

<script setup>
import { ref, reactive } from "vue";

// 최소/최대 너비와 확장 스텝 설정
const MIN_WIDTH = 60;
const MAX_WIDTH = 80; // 확대될 최대 너비
const STEP = 5; // 확대/축소 속도

// 아이템 데이터
const items = ref([
  { name: "Finder", icon: "https://upload.wikimedia.org/wikipedia/en/9/98/FinderBigSur.png" },
  { name: "Premiere Pro", icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Adobe_Premiere_Pro_CC_icon.svg/240px-Adobe_Premiere_Pro_CC_icon.svg.png" },
  { name: "Setting", icon: "https://upload.wikimedia.org/wikipedia/en/2/23/System_Preferences_icon.png" },
  { name: "Safari", icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Safari_browser_logo.svg/2057px-Safari_browser_logo.svg.png" },
  { name: "Instagram", icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/480px-Instagram_logo_2016.svg.png" },
]);

// 아이템의 너비 상태 관리
const itemWidths = reactive(new Array(items.value.length).fill(MIN_WIDTH));

let aniID = null;

// 확대/축소 너비를 업데이트하는 함수
const updateWidths = (nextWidths) => {
  cancelAnimationFrame(aniID); // 이전 애니메이션 중지
  aniID = null;

  let isAllDone = true;

  // 각 아이템의 너비를 점진적으로 변경
  for (let i = 0; i < itemWidths.length; i++) {
    const currWidth = itemWidths[i];
    const goalWidth = nextWidths[i];

    if (goalWidth < currWidth) {
      itemWidths[i] = Math.max(currWidth - STEP, goalWidth);
      isAllDone = false;
    } else if (goalWidth > currWidth) {
      itemWidths[i] = Math.min(currWidth + STEP, goalWidth);
      isAllDone = false;
    }
  }

  if (!isAllDone) {
    aniID = requestAnimationFrame(() => updateWidths(nextWidths));
  }
};

// 마우스 이동 시 아이콘 크기 조정
const handleMouseMove = (event) => {
  const dockRect = event.currentTarget.getBoundingClientRect();
  const mouseY = event.clientY - dockRect.top;

  const nextWidths = items.value.map((_, index) => {
    const itemCenter = index * MIN_WIDTH + MIN_WIDTH / 2;
    const distance = Math.abs(itemCenter - mouseY);
    return Math.max(MAX_WIDTH - distance / 4, MIN_WIDTH);
  });

  updateWidths(nextWidths);
};

// 마우스가 도크를 벗어나면 아이콘 크기를 초기화
const resetDock = () => {
  const nextWidths = new Array(items.value.length).fill(MIN_WIDTH);
  updateWidths(nextWidths);
};
</script>




<style scoped>
.dock {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  padding: 10px 5px;
  border-radius: 14px;
  background-color: rgb(36 36 36);
  border: 1px solid #565656;
  box-shadow: 0px 0px 0px 1px 3f3f3f;
}

.item {
  position: relative;
  transition: width 0.2s ease;
}

.item img {
  width: 100%;
}

.item p {
  display: none;
  position: absolute;
  top: 50%;
  left: 100%;
  transform: translateY(-50%);
  margin: 0 0 0 5px;
  padding: 3px 10px;
  background: #333;
  border-radius: 6px;
  border: 1px solid #565656;
  box-shadow: 0px 0px 0px 1px 3f3f3f;
  white-space: nowrap;
  color: #ddd;
}

.item:hover p {
  display: block;
}

body {
  background-image: url(https://512pixels.net/downloads/macos-wallpapers-thumbs/10-14-Night-Thumb.jpg);
}
</style>
