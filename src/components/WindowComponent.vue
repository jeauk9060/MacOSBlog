<template>
  <div id="resize-drag" class="resize-drag">
    <div class="window-header">
      <div class="window-controls">
        <div class="window-minimize"></div>
        <div class="window-maximize"></div>
        <div class="window-close"></div>
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
  background-color: #ffffff;
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
  background-color: #e6e6e6;
  border-bottom: 1px solid #d6d6d6;
  position: relative;
  /* 컨트롤 버튼을 절대 위치로 배치하기 위해 상대 위치 설정 */
}

.window-title {
  margin: 0;
  font-size: 14px;
  font-weight: bold;
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
  /* 버튼 간격 유지 */
  border-radius: 50%;
}

.window-minimize {
  background-color: #f7d54a;
}

.window-maximize {
  background-color: #62c462;
}

.window-close {
  background-color: #ee5f5b;
}

.window-content {
  padding: 12px;
  background: white;
}

@media (prefers-color-scheme: dark) {
  .resize-drag {
    background-color: #2b2b2b;
    /* 창 배경 */
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.7);
    /* 진한 그림자 */
  }

  .window-header {
    background-color: #000000;
    /* 헤더 배경 */
    border-bottom: 1px solid #444;
    /* 헤더 테두리 */
  }

  .window-title {
    color: #ffffff;
    /* 제목 텍스트 */
  }

  .window-controls .window-minimize {
    background-color: #f4c542;
    /* 노란색 */
  }

  .window-controls .window-maximize {
    background-color: #3fcf4e;
    /* 초록색 */
  }

  .window-controls .window-close {
    background-color: #f25353;
    /* 빨간색 */
  }

  .window-content {
    background: #2b2b2b;
    /* 콘텐츠 배경 */
    color: #d4d4d4;
    /* 콘텐츠 텍스트 */
  }

  /* 추가적으로 스타일링이 필요한 클래스 */
  .about-me {
    border: 1px solid #0B0A0B;
    background: #1C1C1D;
  }

  .top-bar {
    background: #333333;
  }

  .bar {
    background: #0B0A0B;
  }

  .hello,
  .header,
  .paragraph,
  .heading {
    color: white;
  }

  .textarea-content {
    caret-color: white;
    color: white;
  }
}
</style>
