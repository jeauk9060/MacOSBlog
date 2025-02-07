<template>
  <div class="navbar-container">
    <div class="nav-left">
      <span class="iconify nav-text" data-icon="ion-logo-apple" data-inline="false"></span>
      <div class="nav-text hidden-small">Developer</div>
      <div class="nav-text hidden-small">Jae-Uk</div>
      <div class="nav-text hidden-small">Hwang</div>
    </div>
    <div class="nav-right">
      <div class="date text-right">
        <span>{{ date }}</span>
      </div>
      <div class="time text-right">
        <span>{{ time }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

dayjs.locale('ko');

const time = ref('');
const date = ref('');
const days = ['[일]', '[월]', '[화]', '[수]', '[목]', '[금]', '[토]']; // 요일 축약형 배열

onMounted(() => {
  setInterval(() => {
    const now = dayjs();
    time.value = dayjs().format('A hh:mm'); // 시간 형식
    date.value = `${now.format('YYYY-MM-DD')} ${days[now.day()]}`; // 날짜와 요일 축약형
  }, 1000);
});
</script>

<style scoped>
.navbar-container {
  width: 100%;
  height: 30px;
  padding-top: 5px;
  padding-bottom: 5px;
  background-color: #2c2f33;
  /* 어두운 배경 */
  backdrop-filter: blur(25px);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-left {
  display: flex;
  width: auto;
  margin-left: 15px;
  align-items: center;
}

.iconify {
  margin-right: 10px;
  font-size: 20px;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
  margin-left: 10px;
  margin-right: 10px;
  color: #ffffff;
  /* 텍스트 색상 흰색 */
}

.nav-right {
  display: flex;
  width: auto;
  justify-content: space-evenly;
  margin-right: 12px;
  color: #99aab5;
  /* 약간 밝은 회색 */
}

.text-right {
  font-size: 14px;
  font-weight: 500;
  margin-right: 5px;
}

.bold {
  font-weight: 700;
}

@media only screen and (max-width: 600px) {
  .hidden-small {
    display: none;
  }

  .nav-left {
    width: 150px;
    margin-left: 5px;
  }

  .nav-right {
    margin-right: 5px;
  }

  .text-right {
    margin-right: 5px;
    margin-left: 5px;
  }

  .nav-text {
    margin-right: 5px;
    margin-left: 5px;
  }
}
</style>
