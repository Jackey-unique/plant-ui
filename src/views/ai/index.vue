<template>
  <div class="ai-page">
    <div class="left">
      <div class="qa-panel">
        <div class="messages" ref="messagesRef">
          <div v-for="(m, i) in messages" :key="i" :class="['msg', m.role]">
            <div class="bubble">{{ m.text }}</div>
          </div>
        </div>
        <div class="input-bar">
          <el-input
            v-model="question"
            placeholder="请输入问题..."
            @keyup.enter.native="handleAsk"
            clearable
          />
          <el-button type="primary" :loading="asking" @click="handleAsk">提问</el-button>
        </div>
      </div>
    </div>
    <div class="right">
      <div class="knowledge">
        <div class="title">知识库</div>
        <el-input v-model="kbSearch" placeholder="搜索知识..." clearable />
        <el-empty v-if="filteredDocs.length === 0" description="没有匹配的内容" />
        <el-timeline v-else>
          <el-timeline-item
            v-for="(doc, idx) in filteredDocs"
            :key="idx"
            :timestamp="doc.updatedAt"
          >
            <div class="doc-item">
              <div class="doc-title">{{ doc.title }}</div>
              <div class="doc-desc">{{ doc.summary }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { askAI } from '@/api/ai'

const question = ref('')
const asking = ref(false)
const messages = ref([
  { role: 'assistant', text: '您好，我是智慧温棚 AI 助手，有什么可以帮您？' }
])
const messagesRef = ref(null)

const docs = ref([
  { title: '温湿度控制策略', summary: '基于作物生长曲线的温湿度设定方法。', updatedAt: '2025-01-10' },
  { title: '灌溉与施肥联动', summary: 'EC/PH 与灌溉时序规则。', updatedAt: '2025-02-08' },
  { title: '病虫害早期识别', summary: '图像识别要点与阈值。', updatedAt: '2025-03-21' }
])
const kbSearch = ref('')
const filteredDocs = computed(() => {
  const q = kbSearch.value.trim()
  if (!q) return docs.value
  return docs.value.filter(d => d.title.includes(q) || d.summary.includes(q))
})

function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

async function handleAsk() {
  const q = question.value.trim()
  if (!q) return
  messages.value.push({ role: 'user', text: q })
  question.value = ''
  scrollToBottom()
  asking.value = true
  try {
    const res = await askAI({ question: q })
    messages.value.push({ role: 'assistant', text: res.data.answer || '暂无答案' })
  } catch (e) {
    ElMessage.error('提问失败，请稍后再试')
  } finally {
    asking.value = false
    scrollToBottom()
  }
}
</script>

<style scoped>
.ai-page { display: flex; height: 100%; background: #f5f7fa; }
.left { flex: 2; padding: 1.5vw; }
.right { flex: 1; padding: 1.5vw; border-left: 1px solid #eee; background: #fff; }

.qa-panel { height: 100%; display: flex; flex-direction: column; background: #fff; border-radius: 8px; overflow: hidden; }
.messages { flex: 1; padding: 16px; overflow-y: auto; background: #fafafa; }
.msg { margin-bottom: 12px; display: flex; }
.msg.user { justify-content: flex-end; }
.msg.assistant { justify-content: flex-start; }
.bubble { max-width: 70%; padding: 10px 12px; border-radius: 8px; line-height: 1.6; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
.msg.user .bubble { background: #e6f4ff; }
.input-bar { display: flex; gap: 10px; padding: 12px; border-top: 1px solid #eee; }

.knowledge { height: 100%; display: flex; flex-direction: column; gap: 12px; }
.knowledge .title { font-weight: 600; font-size: 16px; margin-bottom: 4px; }
.doc-item { display: flex; flex-direction: column; gap: 4px; }
.doc-title { font-weight: 600; }
.doc-desc { color: #666; font-size: 13px; }
</style>

