<template>
  <div class="notion-container">
    <!-- 썸네일 -->
    <div v-if="selectedItem?.thumbnailUrl" class="thumbnail">
      <img :src="selectedItem.thumbnailUrl" alt="썸네일" />
    </div>

    <!-- 제목 및 날짜 정보 -->
    <div class="article-info">
      <p class="article-date"><strong>작성일:</strong> {{ selectedItem?.createdAt }}</p>
      <p class="article-date"><strong>수정일:</strong> {{ selectedItem?.updatedAt }}</p>
    </div>

    <!-- Notion 본문 -->
    <NotionRenderer v-if="blockMap" :blockMap="blockMap" fullPage />
    <p v-else>⏳ 데이터를 불러오는 중...</p>

    <!-- 이전 글 / 다음 글 카드 -->
    <div class="article-nav">
      <router-link v-if="prevArticle" :to="`/post/${prevArticle.uniqueId}`" class="nav-card">
        <p><strong>이전 글</strong></p>
        <p>{{ prevArticle.title }}</p>
      </router-link>

      <router-link v-if="nextArticle" :to="`/post/${nextArticle.uniqueId}`" class="nav-card">
        <p><strong>다음 글</strong></p>
        <p>{{ nextArticle.title }}</p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { NotionRenderer, getPageBlocks } from "vue-notion";

const route = useRoute();
const blockMap = ref(null);
const databaseItems = ref([]);
const selectedItem = ref(null);
const prevArticle = ref(null);
const nextArticle = ref(null);

const NOTION_API_KEY = "Bearer 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";
const DATABASE_ID = "17eb7cf2f7a080cc8bc0f1e287dc122b";

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
    // 각 페이지의 정보를 매핑합니다.
    // 여기서 unique_id 값은 Notion 데이터베이스의 "ID" 속성 내의 unique_id.number를 사용합니다.
    databaseItems.value = data.results.map((item, index) => ({
      id: item.id,
      index: index,
      uniqueId: item.properties.ID.unique_id.number, // 고유번호 저장 (예, 1, 2, 3 등)
      title: item.properties.title.title[0]?.plain_text || "제목 없음",
      createdAt: item.properties.createdAt.created_time,
      updatedAt: item.properties.updatedAt.last_edited_time,
      thumbnailUrl: item.properties.thumbnailUrl.url,
      prevArticleId: item.properties.prevArticleId.number,
      nextArticleId: item.properties.nextArticleId.number,
    }));

    // URL 경로 /post/1 에서 숫자 1을 가져옵니다.
    const uniqueIdFromUrl = parseInt(route.params.index);

    // uniqueIdFromUrl와 일치하는 페이지를 데이터베이스에서 찾습니다.
    selectedItem.value = databaseItems.value.find(item => item.uniqueId === uniqueIdFromUrl);

    if (selectedItem.value) {
      // 선택한 페이지의 id로 Notion 블록 데이터를 불러옵니다.
      blockMap.value = await getPageBlocks(selectedItem.value.id);

      // 이전 글과 다음 글도 uniqueId를 기준으로 찾습니다.
      prevArticle.value = databaseItems.value.find(
        article => article.uniqueId === selectedItem.value.prevArticleId
      );

      nextArticle.value = databaseItems.value.find(
        article => article.uniqueId === selectedItem.value.nextArticleId
      );
    } else {
      console.error("❌ 해당 unique_id를 가진 데이터가 없습니다:", uniqueIdFromUrl);
    }
  } catch (error) {
    console.error("❌ Notion API 요청 실패:", error);
  }
};

onMounted(fetchNotionData);
</script>

<style>
@import "vue-notion/src/styles.css";

.notion-container {
  max-width: 700px;
  margin: auto;
  padding: 20px;
  font-family: "Inter", sans-serif;
}

/* 썸네일 스타일 */
.thumbnail img {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 10px;
}

/* 날짜 스타일 */
.article-info {
  text-align: auto;
  margin-top: 10px;
  color: #666;
}

.article-date {
  font-size: 14px;
  margin: 5px 0;
}

/* 이전 글, 다음 글 네비게이션 카드 */
.article-nav {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.nav-card {
  flex: 1;
  padding: 15px;
  border-radius: 10px;
  background: #f9f9f9;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  text-align: center;
  text-decoration: none;
  color: black;
  transition: 0.2s;
}

.nav-card:hover {
  background: #e9e9e9;
}

.nav-card p {
  margin: 5px 0;
  font-size: 16px;
}
</style>
