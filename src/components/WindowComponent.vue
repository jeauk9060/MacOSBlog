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
    @mouseleave="resetCursor"
    @mousedown="handleMouseDown"
  >
    <!-- window-header: 드래그 및 리사이즈 (헤더에서는 상단, 상단 대각(좌/우), 좌, 우 리사이즈 허용) -->
    <div class="window-header">
      <div class="window-controls">
        <button class="window-close" @click.stop="closeWindow"></button>
        <button class="window-minimize" @click.stop="toggleMinimized"></button>
        <button class="window-maximize" @click.stop="toggleMaximized"></button>
      </div>
      <div class="window-title">버그맛 커피</div>
    </div>
    <!-- window-content -->
    <div class="window-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onBeforeUnmount } from 'vue';
import { useWindowStore } from '@/stores/WindowStore';

const MIN_Y = 0;
const buffer = 10; // 리사이즈 감지 영역 (픽셀)

const windowStore = useWindowStore();
const windowData = computed(() => windowStore.windows.find(win => win.name === 'blog'));

const position = computed({
  get() {
    return windowData.value?.position || { x: 0, y: MIN_Y };
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

function checkResizeCursor(event) {
  let targetElement;
  if (event.target.closest('.window-header')) {
    targetElement = event.target.closest('.window-header');
  } else {
    targetElement = event.currentTarget;
  }
  const rect = targetElement.getBoundingClientRect();
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  const nearTop = mouseY - rect.top <= buffer;
  const nearBottom = rect.bottom - mouseY <= buffer;
  const nearLeft = mouseX - rect.left <= buffer;
  const nearRight = rect.right - mouseX <= buffer;

  if (targetElement.classList.contains('window-header')) {
    if (nearTop && nearLeft) {
      resizeDirection.value = 'top-left';
      targetElement.style.cursor = 'nw-resize';
    } else if (nearTop && nearRight) {
      resizeDirection.value = 'top-right';
      targetElement.style.cursor = 'ne-resize';
    } else if (nearTop) {
      resizeDirection.value = 'top';
      targetElement.style.cursor = 'n-resize';
    } else if (nearLeft) {
      resizeDirection.value = 'left';
      targetElement.style.cursor = 'w-resize';
    } else if (nearRight) {
      resizeDirection.value = 'right';
      targetElement.style.cursor = 'e-resize';
    } else {
      resizeDirection.value = null;
      targetElement.style.cursor = 'default';
    }
  } else {
    if (nearBottom && nearLeft) {
      resizeDirection.value = 'bottom-left';
      targetElement.style.cursor = 'sw-resize';
    } else if (nearBottom && nearRight) {
      resizeDirection.value = 'bottom-right';
      targetElement.style.cursor = 'se-resize';
    } else if (nearBottom) {
      resizeDirection.value = 'bottom';
      targetElement.style.cursor = 's-resize';
    } else if (nearLeft) {
      resizeDirection.value = 'left';
      targetElement.style.cursor = 'w-resize';
    } else if (nearRight) {
      resizeDirection.value = 'right';
      targetElement.style.cursor = 'e-resize';
    } else {
      resizeDirection.value = null;
      targetElement.style.cursor = 'default';
    }
  }
}

function resetCursor(event) {
  if (!isResizing.value) {
    resizeDirection.value = null;
    event.currentTarget.style.cursor = 'default';
  }
}

function handleMouseDown(event) {
  const isHeader = event.target.closest('.window-header');
  if (resizeDirection.value) {
    initialResizeDirection.value = resizeDirection.value;
    startResize(event);
  } else if (isHeader) {
    startDrag(event);
  }
}

function startDrag(event) {
  if (isResizing.value) return;
  isDragging.value = true;
  resizeStart.mouseX = event.clientX;
  resizeStart.mouseY = event.clientY;
  resizeStart.posX = position.value.x;
  resizeStart.posY = position.value.y;
  windowStore.focusWindow(windowData.value.id);
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
}

function onDrag(event) {
  if (isDragging.value) {
    const deltaX = event.clientX - resizeStart.mouseX;
    const deltaY = event.clientY - resizeStart.mouseY;
    const newX = resizeStart.posX + deltaX;
    const newY = Math.max(MIN_Y, resizeStart.posY + deltaY);
    position.value = { x: newX, y: newY };
  }
}

function stopDrag() {
  isDragging.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
}

function startResize(event) {
  isResizing.value = true;
  resizeStart.mouseX = event.clientX;
  resizeStart.mouseY = event.clientY;
  resizeStart.width = size.value.width;
  resizeStart.height = size.value.height;
  resizeStart.posX = position.value.x;
  resizeStart.posY = position.value.y;
  windowStore.focusWindow(windowData.value.id);
  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup', stopResize);
}

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
    case 'top': {
      const rawNewY = resizeStart.posY + dy;
      newY = Math.max(MIN_Y, rawNewY);
      const effectiveDy = newY - resizeStart.posY;
      newHeight = Math.max(150, resizeStart.height - effectiveDy);
      break;
    }
    case 'top-left': {
      const rawNewY = resizeStart.posY + dy;
      newY = Math.max(MIN_Y, rawNewY);
      const effectiveDy = newY - resizeStart.posY;
      newHeight = Math.max(150, resizeStart.height - effectiveDy);
      newWidth = Math.max(200, resizeStart.width - dx);
      newX = resizeStart.posX + dx;
      break;
    }
    case 'top-right': {
      const rawNewY = resizeStart.posY + dy;
      newY = Math.max(MIN_Y, rawNewY);
      const effectiveDy = newY - resizeStart.posY;
      newHeight = Math.max(150, resizeStart.height - effectiveDy);
      newWidth = Math.max(200, resizeStart.width + dx);
      break;
    }
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

function stopResize() {
  isResizing.value = false;
  initialResizeDirection.value = null;
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', stopResize);
}

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
  box-shadow: 0 0 10px rgba(0,0,0,0.3);
  overflow: hidden;
  touch-action: none;
  box-sizing: border-box;
}

/* window-header 스타일 */
.window-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 12px;
  background-color: #2b2b2b;
  border-bottom: 1px solid #d6d6d6;
  position: relative;
  cursor: move;
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

/* window-content 스타일 - cursor를 inherit로 변경하여 부모의 커서 스타일을 반영 */
.window-content {
  position: relative;
  z-index: 1;
  overflow: auto;
  max-height: calc(100% - 40px);
  padding: 12px;
  color: #333;
  user-select: text;
  cursor: inherit;
}
</style>
