<template>
  <div
    id="resize-drag"
    class="resize-drag"
    v-show="!windowData.minimized && !windowData.closed"
    :style="{
      transform: `translate(${position.x}px, ${position.y}px)`,
      width: size.width + 'px',
      height: size.height + 'px',
      zIndex: windowData.zIndex
    }"
    @mousemove="checkResizeCursor"
    @mousedown="startResizeOrDrag"
    @mouseleave="resetCursor"
  >
    <div class="window-header"
         @mousemove="checkResizeCursor"
         @mousedown="startResizeOrDrag"
         @mouseleave="resetCursor">
      <div class="window-controls">
        <button class="window-close" @click.stop="closeWindow"></button>
        <button class="window-minimize" @click.stop="toggleMinimized"></button>
        <button class="window-maximize" @click.stop="toggleMaximized"></button>
      </div>
      <div class="window-title">버그맛 커피</div>
    </div>
    <div class="window-content">
      <!-- 창 내부 내용 또는 router-view (필요시 슬롯으로 전달) -->
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onBeforeUnmount } from 'vue';
import { useWindowStore } from '@/stores/WindowStore';

// 여기서는 예시로 이름이 'blog'인 창을 선택합니다.
// 실제 동적 생성 시 고유 id 또는 props로 전달받아 사용하도록 확장할 수 있습니다.
const windowStore = useWindowStore();
const windowData = computed(() => windowStore.windows.find(win => win.name === 'blog'));

// store에 저장된 위치와 크기를 computed getter/setter로 동기화합니다.
const position = computed({
  get() {
    return windowData.value?.position || { x: 0, y: 0 };
  },
  set(newPos) {
    if (windowData.value) {
      windowStore.updateWindowPosition({ id: windowData.value.id, position: newPos });
    }
  }
});
const size = computed({
  get() {
    return windowData.value?.size || { width: 850, height: 800 };
  },
  set(newSize) {
    if (windowData.value) {
      windowStore.updateWindowSize({ id: windowData.value.id, size: newSize });
    }
  }
});

// 드래그/리사이즈 관련 상태
const isDragging = ref(false);
const isResizing = ref(false);
const initialResizeDirection = ref(null);
const resizeDirection = ref(null);
const resizeStart = {
  mouseX: 0,
  mouseY: 0,
  width: 0,
  height: 0,
  posX: 0,
  posY: 0,
};
const buffer = 10; // 리사이즈 감지 영역

// 마우스 위치에 따라 리사이즈 커서 설정
function checkResizeCursor(event) {
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
}

function resetCursor(event) {
  if (!isResizing.value) {
    resizeDirection.value = null;
    event.currentTarget.style.cursor = 'default';
  }
}

// 드래그 또는 리사이즈 동작 시작 (클릭 시 포커스 처리 포함)
function startResizeOrDrag(event) {
  if (windowData.value) {
    windowStore.focusWindow(windowData.value.id);
  }
  if (resizeDirection.value) {
    initialResizeDirection.value = resizeDirection.value;
    startResize(event);
  } else {
    startDrag(event);
  }
}

// 드래그 시작
function startDrag(event) {
  if (isResizing.value) return;
  isDragging.value = true;
  resizeStart.mouseX = event.clientX;
  resizeStart.mouseY = event.clientY;
  resizeStart.posX = position.value.x;
  resizeStart.posY = position.value.y;
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
}

// 드래그 동작 (store 업데이트)
function onDrag(event) {
  if (isDragging.value) {
    const deltaX = event.clientX - resizeStart.mouseX;
    const deltaY = event.clientY - resizeStart.mouseY;
    position.value = { x: resizeStart.posX + deltaX, y: resizeStart.posY + deltaY };
  }
}

// 드래그 종료
function stopDrag() {
  isDragging.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
}

// 리사이즈 시작 (초기값 저장 후 이벤트 등록)
function startResize(event) {
  isResizing.value = true;
  resizeStart.mouseX = event.clientX;
  resizeStart.mouseY = event.clientY;
  resizeStart.width = size.value.width;
  resizeStart.height = size.value.height;
  resizeStart.posX = position.value.x;
  resizeStart.posY = position.value.y;
  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup', stopResize);
}

// 리사이즈 동작 (각 방향에 따라 크기/위치 업데이트)
function onResize(event) {
  const dx = event.clientX - resizeStart.mouseX;
  const dy = event.clientY - resizeStart.mouseY;
  let newWidth = resizeStart.width;
  let newHeight = resizeStart.height;
  let newX = resizeStart.posX;
  let newY = resizeStart.posY;

  switch (initialResizeDirection.value) {
    case 'right':
      newWidth = Math.max(200, resizeStart.width + dx);
      break;
    case 'left':
      newWidth = Math.max(200, resizeStart.width - dx);
      newX = resizeStart.posX + dx;
      break;
    case 'bottom':
      newHeight = Math.max(150, resizeStart.height + dy);
      break;
    case 'top':
      newHeight = Math.max(150, resizeStart.height - dy);
      newY = resizeStart.posY + dy;
      break;
    case 'top-left':
      newWidth = Math.max(200, resizeStart.width - dx);
      newX = resizeStart.posX + dx;
      newHeight = Math.max(150, resizeStart.height - dy);
      newY = resizeStart.posY + dy;
      break;
    case 'top-right':
      newWidth = Math.max(200, resizeStart.width + dx);
      newHeight = Math.max(150, resizeStart.height - dy);
      newY = resizeStart.posY + dy;
      break;
    case 'bottom-left':
      newWidth = Math.max(200, resizeStart.width - dx);
      newX = resizeStart.posX + dx;
      newHeight = Math.max(150, resizeStart.height + dy);
      break;
    case 'bottom-right':
      newWidth = Math.max(200, resizeStart.width + dx);
      newHeight = Math.max(150, resizeStart.height + dy);
      break;
  }
  size.value = { width: newWidth, height: newHeight };
  position.value = { x: newX, y: newY };
}

// 리사이즈 종료
function stopResize() {
  isResizing.value = false;
  initialResizeDirection.value = null;
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', stopResize);
}

// 컨트롤 버튼 동작 (store 액션 호출)
function toggleMinimized() {
  if (windowData.value) {
    windowStore.toggleMinimized(windowData.value.id);
  }
}
function toggleMaximized() {
  if (windowData.value) {
    windowStore.toggleMaximized(windowData.value.id);
  }
}
function closeWindow() {
  if (windowData.value) {
    windowStore.closeWindow(windowData.value.id);
  }
}

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', stopResize);
});
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
  background-position: center;
  background-repeat: no-repeat;
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
  overflow: auto;
  max-height: calc(100% - 40px);
  padding: 12px;
  color: #333;
}
</style>
