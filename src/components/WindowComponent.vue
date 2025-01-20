<template>
  <div id="resize-drag" class="resize-drag" v-show="!windowData.minimized && !windowData.closed" :style="{
    transform: `translate(${position.x}px, ${position.y}px)`,
    width: size.width + 'px',
    height: size.height + 'px',
  }" @mousemove="checkResizeCursor" @mousedown="startResizeSave" @mouseleave="resetCursor">
    <div class="window-header" @mousemove="checkResizeCursor" @mousedown="startDragOrResize" @mouseleave="resetCursor">
      <div class="window-controls">
        <button class="window-close" @click="closeWindow"></button>
        <button class="window-minimize" @click="toggleMinimized"></button>
        <button class="window-maximize" @click="toggleMaximized"></button>
      </div>
      <div class="window-title">제목</div>
    </div>
    <div class="window-content">
      <p>내용</p>
    </div>
  </div>
</template>


<script setup>
// Vue 및 관련 라이브러리에서 필요한 기능 임포트
import { useWindowStore } from '@/stores/WindowStore';
import { ref, reactive, computed } from 'vue';
import { useNotionStore } from '@/stores/notionStore';
import { onMounted } from 'vue';

const notionStore = useNotionStore();

onMounted(async () => {
  // 최신순(내림차순) 데이터 가져오기
  const data = await notionStore.fetchDatabase('descending'); // ascending으로 변경 가능
  console.log('Notion Data:', data);
});


// WindowStore를 사용하여 'blog' 윈도우 데이터 가져오기
const windowStore = useWindowStore();
const windowData = computed(() => windowStore.windows.find(win => win.name === 'blog'));

// 윈도우의 위치와 크기를 저장하는 반응형 객체
const position = reactive({ x: 0, y: 0 });
const size = reactive({ width: 500, height: 300 });

// 드래그 및 리사이즈 상태를 추적
const isDragging = ref(false);
const isResizing = ref(false);

// 리사이즈 방향과 초기 상태를 추적
const initialResizeDirection = ref(null); // 리사이즈 시작 시 방향
const resizeDirection = ref(null);
const resizeStart = reactive({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });

// 리사이즈 감지 영역의 범위 설정
const buffer = 10;

// 윈도우 최소화/최대화/닫기 동작
const toggleMinimized = () => {
  windowStore.toggleMinimized('blog'); // 최소화 상태 토글
};

const toggleMaximized = () => {
  // 최대화 여부에 따라 크기 및 위치 설정
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
  windowStore.toggleMaximized('blog'); // 최대화 상태 토글
};

const closeWindow = () => {
  windowStore.closeWindow('blog'); // 윈도우 닫기
};

// 마우스 위치에 따라 리사이즈 방향 설정
const checkResizeCursor = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();

  // 감지 영역 내에서 방향을 결정
  const isTop = event.clientY >= rect.top - buffer && event.clientY <= rect.top + buffer;
  const isBottom = event.clientY >= rect.bottom - buffer && event.clientY <= rect.bottom + buffer;
  const isLeft = event.clientX >= rect.left - buffer && event.clientX <= rect.left + buffer;
  const isRight = event.clientX >= rect.right - buffer && event.clientX <= rect.right + buffer;

  // 각 방향에 맞는 커서와 리사이즈 방향 설정
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
    resetCursor(event); // 커서 초기화
  }
};

// 커서를 기본값으로 리셋
const resetCursor = (event) => {
  if (!isResizing.value) {
    resizeDirection.value = null;
    event.currentTarget.style.cursor = 'default';
  }
};

// 드래그 또는 리사이즈 동작 시작
const startDragOrResize = (event) => {
  if (resizeDirection.value) {
    initialResizeDirection.value = resizeDirection.value; // 방향 저장
    startResize(event); // 리사이즈 시작
  } else {
    startDrag(event); // 드래그 시작
  }
};

// 드래그 또는 리사이즈 동작 시작
const startResizeSave = (event) => {
  if (resizeDirection.value) {
    initialResizeDirection.value = resizeDirection.value; // 방향 저장
    startResize(event); // 리사이즈 시작
  }
};

// 드래그 시작
const startDrag = (event) => {
  if (isResizing.value) return; // 리사이즈 중이면 드래그 중단
  isDragging.value = true; // 드래그 상태 활성화
  resizeStart.x = event.clientX - position.x;
  resizeStart.y = event.clientY - position.y;

  // 드래그 이벤트 리스너 추가
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
};

// 드래그 동작
const onDrag = (event) => {
  if (isDragging.value) {
    position.x = event.clientX - resizeStart.x;
    position.y = event.clientY - resizeStart.y;
  }
};

// 드래그 종료
const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
};

// 리사이즈 시작
const startResize = (event) => {
  isResizing.value = true;
  resizeStart.x = event.clientX;
  resizeStart.y = event.clientY;
  resizeStart.width = size.width;
  resizeStart.height = size.height;
  resizeStart.posX = position.x;
  resizeStart.posY = position.y;

  // 리사이즈 이벤트 리스너 추가
  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup', stopResize);
};

// 리사이즈 동작
const onResize = (event) => {
  const dx = event.clientX - resizeStart.x; // X축 변화량
  const dy = event.clientY - resizeStart.y; // Y축 변화량

  // 각 방향에 따른 리사이즈 계산
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

// 리사이즈 종료
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
