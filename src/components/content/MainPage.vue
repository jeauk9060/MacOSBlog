<template>
  <div class="home-container">
    <h1>블로그 홈</h1>
    <p>블로그 글 목록 등이 표시됩니다.</p>
    <!-- 예시: 다른 블로그 페이지로 이동하는 버튼 -->
    <router-link to="/post" class="start-button">블로그 보러가기 →</router-link>
  </div>
</template>

<script setup>
</script>

<style scoped>
.home-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h1 {
  font-size: 2rem;
  margin-bottom: 10px;
}

p {
  font-size: 1.2rem;
  color: #555;
  line-height: 1.5;
}

.start-button {
  display: inline-block;
  margin-top: 10px;
  padding: 10px 20px;
  font-size: 1.1rem;
  background-color: #007aff;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.2s ease-in-out;
}

.start-button:hover {
  background-color: #005ecb;
}
</style>
