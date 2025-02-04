<template>
  <div>
    <h2>Notion 데이터베이스 항목</h2>
    <ul>
      <li v-for="item in databaseItems" :key="item.id">
        <a :href="item.public_url" target="_blank">
          {{ item.properties.title.title[0].text.content }}
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const databaseItems = ref([]);

onMounted(async () => {
  try {
    const response = await fetch("/notion-api/v1/databases/17eb7cf2f7a080cc8bc0f1e287dc122b/query", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
    }

    const data = await response.json();
    databaseItems.value = data.results;
  } catch (error) {
    console.error("Notion API 요청 실패:", error);
  }
});
</script>

<style scoped>
h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin: 5px 0;
}

a {
  text-decoration: none;
  color: #0070f3;
}

a:hover {
  text-decoration: underline;
}
</style>
