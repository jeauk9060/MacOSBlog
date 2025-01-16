<template>
  <div>
    <RouterView></RouterView>
  </div>
</template>

<script setup>
</script>

<style>
/* 전역 스타일 */
body {
  -ms-overflow-style: none;
  /* IE, Edge */
  overflow: hidden;
  /* 스크롤 완전히 제거 */
}

::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari, Opera */
}

/* 특정 클래스에서 스크롤바 제거 */
.box {
  overflow: hidden;
  /* 스크롤 동작 제거 */
  -ms-overflow-style: none;
}

.box::-webkit-scrollbar {
  display: none;
}
</style>
