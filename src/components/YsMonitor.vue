<template>
  <div class="monitor-container">
    <div id="video-container" class="video-content">
      <div v-if="loading" class="loading-overlay">
        <el-icon class="loading-icon" :size="24"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import EZUIKit from 'ezuikit-js'

const props = defineProps({
  accessToken: {
    type: String,
    required: true
  },
  serialNumber: {
    type: String,
    required: true
  },
  monitorUrl: {
    type: String,
    required: true
  }
})

const loading = ref(true)
let player = null

const initPlayer = () => {
  console.log('初始化播放器，参数如下：')
  console.log('accessToken:', props.accessToken)
  console.log('serialNumber:', props.serialNumber)
  console.log('monitorUrl:', props.monitorUrl)

  try {
    player = new EZUIKit.EZUIKitPlayer({
      id: 'video-container',
      accessToken: props.accessToken,
      url: props.monitorUrl,
      template: 'simple',
      autoplay: true,
      audio: 1,
      width: '100%',
      height: '100%',
      handleError: (e) => {
        console.error('播放器错误:', e)
        ElMessage.error(`播放器错误: ${e.msg || '未知错误'}`)
      }
    })
    loading.value = false
  } catch (error) {
    console.error('播放器初始化失败:', error)
    ElMessage.error('视频加载失败，请稍后重试')
    loading.value = false
  }
}

onMounted(() => {
  initPlayer()
})

onBeforeUnmount(() => {
  if (player) {
    player.destroy()
  }
})
</script>

<style scoped>
.monitor-container {
  width: 100%;
  height: calc(100vh - 120px);
  background: #000;
  padding: 20px;
  box-sizing: border-box;
}

.video-content {
  width: 100%;
  height: 100%;
  position: relative;
}

:deep(.ezuikit-video-main) {
  width: 100% !important;
  height: 100% !important;
}

:deep(.ezuikit-video-container) {
  width: 100% !important;
  height: 100% !important;
}

:deep(video) {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  z-index: 10;
}

.loading-icon {
  animation: rotate 1s linear infinite;
  margin-bottom: 8px;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media screen and (max-width: 768px) {
  .monitor-container {
    height: calc(100vh - 100px);
    padding: 10px;
  }
}
</style> 