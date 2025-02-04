import { defineStore } from 'pinia'

export const useWindowStore = defineStore('window', {

  state: () => ({
    windows: [
      {
        name: 'blog',
        minimized: false, // 최소화 여부
        maximized: false, // 최대화 여부
        closed: false, // 닫힘 여부
      },
      {
        name: 'Premiere Pro',
        minimized: false,
        maximized: false,
        closed: false,
      },
      {
        name: 'Settings',
        minimized: false,
        maximized: false,
        closed: false,
      },
    ],
  }),
  actions: {
    /**
     * 창 최소화 상태를 토글
     * @param {string} name - 최소화하거나 복구하려는 창의 이름
     */
    toggleMinimized(name) {
      const window = this.windows.find((win) => win.name === name)
      if (window && !window.closed) {
        window.minimized = !window.minimized // 최소화 상태를 토글
        if (window.minimized) {
          window.maximized = false // 최소화 시 최대화 상태 해제
        }
      }
    },

    /**
     * 창 최대화 상태를 토글
     * @param {string} name - 최대화하거나 복구하려는 창의 이름
     */
    toggleMaximized(name) {
      const window = this.windows.find((win) => win.name === name)
      if (window && !window.closed) {
        window.maximized = !window.maximized // 최대화 상태를 토글
        if (window.maximized) {
          window.minimized = false // 최대화 시 최소화 상태 해제
        }
      }
    },

    /**
     * 창을 닫음
     * @param {string} name - 닫으려는 창의 이름
     */
    closeWindow(name) {
      const window = this.windows.find((win) => win.name === name)
      if (window) {
        window.closed = true // 창을 닫힌 상태로 설정
        window.minimized = false // 닫힐 때 최소화 상태 해제
        window.maximized = false // 닫힐 때 최대화 상태 해제
        window.content = window.defaultContent // 창 내용을 초기화
      }
    },
  },
})
