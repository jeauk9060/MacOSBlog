import { defineStore } from 'pinia'
import { Client } from '@notionhq/client'

export const useNotionStore = defineStore('notion', () => {
  // Notion Client 초기화
  const notion = new Client({
    auth: import.meta.env.VITE_NOTION_TOKEN,
  })

  const databaseId = import.meta.env.VITE_NOTION_DATABASE_ID

  // 데이터 가져오기 함수
  const fetchDatabase = async (sortDirection = 'descending') => {
    try {
      const response = await notion.databases.query({
        database_id: databaseId,
        sorts: [
          {
            timestamp: 'created_time', // created_time 기준 정렬
            direction: sortDirection, // ascending 또는 descending
          },
        ],
      })
      return response.results
    } catch (error) {
      console.error('Error fetching Notion database:', error)
      return []
    }
  }

  return {
    fetchDatabase,
  }
})
