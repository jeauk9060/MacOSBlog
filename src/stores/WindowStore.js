import { defineStore } from 'pinia';
import router from '@/router';

export const useWindowStore = defineStore('window', {
  state: () => ({
    windows: [
      {
        id: 1,                      // 고유 식별자
        name: 'blog',               // 창 이름 (Dock이나 링크 연동 시 사용)
        minimized: false,           // 최소화 여부
        maximized: false,           // 최대화 여부
        closed: false,              // 닫힘 여부
        position: { x: 100, y: 100 }, // 현재 위치
        size: { width: 850, height: 800 },  // 현재 크기
        zIndex: 101,                // 창 포커싱을 위한 z-index
        // 창이 처음 생성되었을 때의 기본 상태를 저장합니다.
        defaultPosition: { x: 0, y: 0 },
        defaultSize: { width: 850, height: 800 },
        prevPosition: { x: 100, y: 100 },     // 최대화 전 복원용 위치
        prevSize: { width: 850, height: 800 }, // 최대화 전 복원용 크기
        content: '',                // 창 내에 표시할 콘텐츠 (필요시)
        route: '/',                 // 창에 연결된 초기 라우트 (MainPage)
      },
    ],
    zIndexCounter: 101,
  }),
  actions: {
    // 동적으로 창을 추가 (새 창 생성)
    addWindow(windowData) {
      const newWindow = {
        id: Date.now(),
        name: windowData.name,
        minimized: false,
        maximized: false,
        closed: false,
        position: windowData.position || { x: 100, y: 100 },
        size: windowData.size || { width: 850, height: 800 },
        zIndex: ++this.zIndexCounter,
        defaultPosition: windowData.position || { x: 100, y: 100 },
        defaultSize: windowData.size || { width: 850, height: 800 },
        prevPosition: windowData.position || { x: 100, y: 100 },
        prevSize: windowData.size || { width: 850, height: 800 },
        content: windowData.content || '',
        route: windowData.route || '/',
      };
      this.windows.push(newWindow);
    },
    // 최소화 토글 (열려 있다면 최소화, 이미 최소화되었거나 닫혀 있다면 복원)
    toggleMinimized(id) {
      const win = this.windows.find(win => win.id === id);
      if (win && !win.closed) {
        if (win.minimized) {
          this.restoreWindow(id);
        } else {
          win.minimized = true;
        }
      }
    },
    // 최대화 토글 (최대화 시 현재 상태 저장 후 전체 화면, 복원 시 이전 상태 복원)
    toggleMaximized(id) {
      const win = this.windows.find(win => win.id === id);
      if (win && !win.closed) {
        win.maximized = !win.maximized;
        if (win.maximized) {
          // 복원을 위해 현재 상태 저장 후 전체 화면 적용
          win.prevPosition = { ...win.position };
          win.prevSize = { ...win.size };
          win.position = { x: 0, y: 0 };
          win.size = { width: window.innerWidth, height: window.innerHeight };
        } else {
          // 저장된 상태로 복원
          win.position = { ...win.prevPosition };
          win.size = { ...win.prevSize };
        }
      }
    },
    // 창 닫기: 닫힘 상태로 전환 (Dock에서 다시 열 수 있도록 복원 액션 필요)
    closeWindow(id) {
      const win = this.windows.find(win => win.id === id);
      if (win) {
        win.closed = true;
        win.minimized = false;
        win.maximized = false;
      }
    },
    // 창 복원: 닫힘 또는 최소화 상태에서 창을 다시 열기
    // 이때, 닫힌 상태라면 기본(default) 상태로(즉, MainPage 화면으로) 복원합니다.
    restoreWindow(id) {
      const win = this.windows.find(win => win.id === id);
      if (win) {
        if (win.closed) {
          // 닫힌 창이면 기본 상태로 복원
          win.position = { ...win.defaultPosition };
          win.size = { ...win.defaultSize };
          win.route = '/'; // 창에 연결된 라우트를 MainPage(기본 화면)로 재설정
          router.push('/'); // 전역 라우터를 통해 MainPage로 이동
        }
        win.closed = false;
        win.minimized = false;
        win.maximized = false;
        this.focusWindow(id);
      }
    },
    // 창의 위치 업데이트 (드래그 후 호출)
    updateWindowPosition({ id, position }) {
      const win = this.windows.find(win => win.id === id);
      if (win) {
        win.position = position;
      }
    },
    // 창의 크기 업데이트 (리사이즈 후 호출)
    updateWindowSize({ id, size }) {
      const win = this.windows.find(win => win.id === id);
      if (win) {
        win.size = size;
      }
    },
    // 창 포커스: 클릭 시 z-index 값을 최신으로 업데이트하여 최상단에 표시
    focusWindow(id) {
      const win = this.windows.find(win => win.id === id);
      if (win) {
        win.zIndex = ++this.zIndexCounter;
      }
    },
  },
});
