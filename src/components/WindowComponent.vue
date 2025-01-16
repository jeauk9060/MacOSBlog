<template>
  <div id="resize-drag" class="resize-drag">
    <div class="window-header">
      <div class="window-controls">
        <button class="window-minimize"></button>
        <button class="window-maximize"></button>
        <button class="window-close"></button>
      </div>
      <div class="window-title">제목</div>
    </div>
    <div class="window-content">
      <p>내용 1<br>내용 2<br>내용 3</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import interact from "interactjs";

onMounted(() => {
  interact("#resize-drag")
    .resizable({
      edges: { left: true, right: true, bottom: true, top: true },
      listeners: {
        move(event) {
          const target = event.target;
          let x = parseFloat(target.getAttribute("data-x")) || 0;
          let y = parseFloat(target.getAttribute("data-y")) || 0;

          target.style.width = event.rect.width + "px";
          target.style.height = event.rect.height + "px";

          x += event.deltaRect.left;
          y += event.deltaRect.top;

          target.style.transform = `translate(${x}px, ${y}px)`;
          target.setAttribute("data-x", x);
          target.setAttribute("data-y", y);
        },
      },
      modifiers: [
        interact.modifiers.restrictSize({
          min: { width: 100, height: 50 },
        }),
      ],
    })
    .draggable({
      listeners: {
        move(event) {
          const target = event.target;
          let x = parseFloat(target.getAttribute("data-x")) || 0;
          let y = parseFloat(target.getAttribute("data-y")) || 0;

          x += event.dx;
          y += event.dy;

          // y가 30px 이상으로만 이동하도록 제한
          if (y < 0) y = 0;

          target.style.transform = `translate(${x}px, ${y}px)`;
          target.setAttribute("data-x", x);
          target.setAttribute("data-y", y);
        },
      },
    });
});
</script>

<style scoped>
.resize-drag {
  width: 500px;
  background-color: #f7f7f7;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  z-index: 2;
  touch-action: none;
  box-sizing: border-box;
}

.window-header {
  display: flex;
  justify-content: center;
  /* 제목을 중앙 정렬 */
  align-items: center;
  padding: 8px 12px;
  background-color: #2b2b2b;
  border-bottom: 1px solid #d6d6d6;
  position: relative;
  /* 컨트롤 버튼을 절대 위치로 배치하기 위해 상대 위치 설정 */
}

.window-title {
  margin: 0;
  font-size: 14px;
  font-weight: bold;
  color: #d6d6d6;
  text-align: center;
  /* 제목 텍스트 가운데 정렬 */
}

.window-controls {
  display: flex;
  position: absolute;
  /* 왼쪽으로 고정 */
  left: 12px;
  /* 왼쪽 여백 */
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
  background: #f7f7f7;
  color: #333333;
}
</style>
