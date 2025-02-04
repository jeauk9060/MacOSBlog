<template>
  <div class="blog-container">
    <h2>📌 Notion 블로그 게시글</h2>

    <div v-if="databaseItems.length > 0" class="blog-list">
      <div v-for="item in databaseItems" :key="item.id" class="blog-card" @click="goToDetail(item.uniqueId)">
        <img :src="getThumbnail(item)" alt="Thumbnail" class="blog-thumbnail" />
        <div class="blog-content">
          <h3 class="blog-title">{{ getTitle(item) }}</h3>
          <div class="blog-meta">
            <span class="blog-category" v-for="category in getCategories(item)" :key="category.id">
              {{ category.name }}
            </span>
            <span class="blog-date">🕒 {{ formatDate(item.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <p v-else>⏳ 데이터를 불러오는 중...</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import dayjs from "dayjs";

const databaseItems = ref([]);
const router = useRouter();

const NOTION_API_KEY = "Bearer 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";
const DATABASE_ID = "17eb7cf2f7a080cc8bc0f1e287dc122b";

// 🔹 상세 페이지 이동 (unique_id.number 사용)
const goToDetail = (uniqueId) => {
  router.push(`/post/${uniqueId}`); // URL: /post/3 (예시)
};

// 🔹 제목 가져오기
const getTitle = (item) => {
  return item?.title || "제목 없음";
};

// 🔹 카테고리 가져오기
const getCategories = (item) => {
  return item?.categories || [];
};

// 🔹 썸네일 가져오기 (없으면 기본 이미지)
const getThumbnail = (item) => {
  return item?.thumbnailUrl || "https://via.placeholder.com/150";
};

// 🔹 날짜 변환 (YYYY-MM-DD)
const formatDate = (dateString) => {
  return dayjs(dateString).format("YYYY-MM-DD");
};

// 🔹 Notion API에서 데이터 가져오기
const fetchNotionData = async () => {
  try {
    const response = await fetch(`/notion-api/v1/databases/${DATABASE_ID}/query`, {
      method: "POST",
      headers: {
        "Authorization": NOTION_API_KEY,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태 코드: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    databaseItems.value = data.results.map((item) => ({
      id: item.id,
      uniqueId: item.properties.ID.unique_id.number, // 🔹 unique_id.number 값 사용
      title: item.properties.title.title[0]?.plain_text || "제목 없음",
      createdAt: item.properties.createdAt.created_time,
      updatedAt: item.properties.updatedAt.last_edited_time,
      thumbnailUrl: item.properties.thumbnailUrl.url,
      categories: item.properties.category.multi_select || [],
    }));
  } catch (error) {
    console.error("❌ Notion API 요청 실패:", error);
  }
};

onMounted(fetchNotionData);
</script>

<style>
.blog-container {
  max-width: 700px;
  margin: auto;
  padding: 20px;
  font-family: "Inter", sans-serif;
}

.blog-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.blog-card {
  display: flex;
  align-items: center;
  background: #f9f9f9;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: background 0.2s;
}

.blog-card:hover {
  background: #e9e9e9;
}

.blog-thumbnail {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 10px;
}

.blog-content {
  flex: 1;
}

.blog-title {
  font-size: 18px;
  margin: 0;
}

.blog-meta {
  display: flex;
  gap: 10px;
  font-size: 14px;
  color: #666;
}

.blog-category {
  background: #ddd;
  padding: 3px 8px;
  border-radius: 5px;
  font-size: 12px;
}
</style>
