<template>
  <div id="resize-drag" class="resize-drag" v-show="!windowData.minimized && !windowData.closed" :style="{
    transform: `translate(${position.x}px, ${position.y}px)`,
    width: size.width + 'px',
    height: size.height + 'px',
  }" @mousemove="checkResizeCursor" @mousedown="startDragOrResize" @mouseleave="resetCursor">
    <div class="window-header">
      <div class="window-controls">
        <button class="window-close" @click="closeWindow"></button>
        <button class="window-minimize" @click="toggleMinimized"></button>
        <button class="window-maximize" @click="toggleMaximized"></button>
      </div>
      <div class="window-title">{{ windowData.name }}</div>
    </div>
    <div class="window-content">
      <p>{{ windowData.content }}</p>
    </div>
  </div>
</template>

<script setup>
import { useWindowStore } from '@/stores/WindowStore';
import { ref, reactive, computed } from 'vue';

const windowStore = useWindowStore();
const windowData = computed(() => windowStore.windows.find(win => win.name === 'blog'));

const position = reactive({ x: 0, y: 0 });
const size = reactive({ width: 500, height: 300 });

const isDragging = ref(false);
const isResizing = ref(false);
const initialResizeDirection = ref(null); // 처음 클릭한 리사이즈 방향 저장
const resizeDirection = ref(null);
const resizeStart = reactive({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });

const buffer = 10; // 감지 영역을 20px로 설정

const toggleMinimized = () => {
  windowStore.toggleMinimized('blog');
};

const toggleMaximized = () => {
  if (windowData.value.maximized) {
    size.width = 500;
    size.height = 300;
    position.x = 0;
    position.y = 0;
  } else {
    size.width = window.innerWidth;
    size.height = window.innerHeight;
    position.x = 0;
    position.y = 0;
  }
  windowStore.toggleMaximized('blog');
};

const closeWindow = () => {
  windowStore.closeWindow('blog');
};

const checkResizeCursor = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();

  const isTop = event.clientY >= rect.top - buffer && event.clientY <= rect.top + buffer;
  const isBottom = event.clientY >= rect.bottom - buffer && event.clientY <= rect.bottom + buffer;
  const isLeft = event.clientX >= rect.left - buffer && event.clientX <= rect.left + buffer;
  const isRight = event.clientX >= rect.right - buffer && event.clientX <= rect.right + buffer;

  if (isTop && isLeft) {
    resizeDirection.value = 'top-left';
    event.currentTarget.style.cursor = 'nw-resize';
  } else if (isTop && isRight) {
    resizeDirection.value = 'top-right';
    event.currentTarget.style.cursor = 'ne-resize';
  } else if (isBottom && isLeft) {
    resizeDirection.value = 'bottom-left';
    event.currentTarget.style.cursor = 'sw-resize';
  } else if (isBottom && isRight) {
    resizeDirection.value = 'bottom-right';
    event.currentTarget.style.cursor = 'se-resize';
  } else if (isTop) {
    resizeDirection.value = 'top';
    event.currentTarget.style.cursor = 'n-resize';
  } else if (isBottom) {
    resizeDirection.value = 'bottom';
    event.currentTarget.style.cursor = 's-resize';
  } else if (isLeft) {
    resizeDirection.value = 'left';
    event.currentTarget.style.cursor = 'w-resize';
  } else if (isRight) {
    resizeDirection.value = 'right';
    event.currentTarget.style.cursor = 'e-resize';
  } else {
    resetCursor(event);
  }
};

const resetCursor = (event) => {
  if (!isResizing.value) {
    resizeDirection.value = null;
    event.currentTarget.style.cursor = 'default';
  }
};

const startDragOrResize = (event) => {
  if (resizeDirection.value) {
    initialResizeDirection.value = resizeDirection.value; // 처음 클릭한 방향을 저장
    startResize(event);
  } else {
    startDrag(event);
  }
};

const startDrag = (event) => {
  if (isResizing.value) return;
  isDragging.value = true;
  resizeStart.x = event.clientX - position.x;
  resizeStart.y = event.clientY - position.y;

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
};

const onDrag = (event) => {
  if (isDragging.value) {
    position.x = event.clientX - resizeStart.x;
    position.y = event.clientY - resizeStart.y;
  }
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
};

const startResize = (event) => {
  isResizing.value = true;
  resizeStart.x = event.clientX;
  resizeStart.y = event.clientY;
  resizeStart.width = size.width;
  resizeStart.height = size.height;
  resizeStart.posX = position.x;
  resizeStart.posY = position.y;

  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup', stopResize);
};

const onResize = (event) => {
  const dx = event.clientX - resizeStart.x;
  const dy = event.clientY - resizeStart.y;

  // 처음 클릭한 방향에 따라 리사이즈 계산
  switch (initialResizeDirection.value) {
    case 'right':
      size.width = Math.max(200, resizeStart.width + dx);
      break;
    case 'left':
      size.width = Math.max(200, resizeStart.width - dx);
      position.x = resizeStart.posX + dx;
      break;
    case 'bottom':
      size.height = Math.max(150, resizeStart.height + dy);
      break;
    case 'top':
      size.height = Math.max(150, resizeStart.height - dy);
      position.y = resizeStart.posY + dy;
      break;
    case 'top-left':
      size.width = Math.max(200, resizeStart.width - dx);
      position.x = resizeStart.posX + dx;
      size.height = Math.max(150, resizeStart.height - dy);
      position.y = resizeStart.posY + dy;
      break;
    case 'top-right':
      size.width = Math.max(200, resizeStart.width + dx);
      size.height = Math.max(150, resizeStart.height - dy);
      position.y = resizeStart.posY + dy;
      break;
    case 'bottom-left':
      size.width = Math.max(200, resizeStart.width - dx);
      position.x = resizeStart.posX + dx;
      size.height = Math.max(150, resizeStart.height + dy);
      break;
    case 'bottom-right':
      size.width = Math.max(200, resizeStart.width + dx);
      size.height = Math.max(150, resizeStart.height + dy);
      break;
  }
};

const stopResize = () => {
  isResizing.value = false;
  initialResizeDirection.value = null; // 초기 방향 초기화
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', stopResize);
};
</script>




<style scoped>
.resize-drag {
  position: absolute;
  background-color: #f7f7f7;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  touch-action: none;
  box-sizing: border-box;
}

.window-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 12px;
  background-color: #2b2b2b;
  border-bottom: 1px solid #d6d6d6;
  position: relative;
}

.window-title {
  font-size: 14px;
  font-weight: bold;
  color: #d6d6d6;
}

.window-controls {
  position: absolute;
  left: 12px;
}

.window-minimize,
.window-maximize,
.window-close {
  width: 12px;
  height: 12px;
  margin-right: 8px;
  background-size: cover;
  /* 이미지가 컨테이너를 완전히 채우도록 설정 */
  background-position: center;
  /* 이미지를 중앙에 배치 */
  background-repeat: no-repeat;
  /* 반복 방지 */
}

.window-minimize {
  background-image: url('../assets/yellow.webp');
}

.window-minimize:hover {
  background-image: url('../assets/yellow_h.webp');
}


.window-maximize {
  background-image: url('../assets/green.webp');
}

.window-maximize:hover {
  background-image: url('../assets/green_h.webp');
}

.window-close {
  background-image: url('../assets/red.webp');
}

.window-close:hover {
  background-image: url('../assets/red_h.webp');
}

.window-content {
  padding: 12px;
  color: #333;
}
</style>
