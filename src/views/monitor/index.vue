<template>
  <div class="page-container">
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/greenhouse' }">大棚管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/device', query: { greenhouseId } }">设备管理</el-breadcrumb-item>
        <el-breadcrumb-item>实时监控</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="monitor-content">
      <YsMonitor
        v-if="monitorReady"
        :access-token="accessToken"
        :serial-number="serialNumber"
        :monitor-url="monitorUrl"
      />
      <div v-else class="loading-container">
        <el-icon class="loading-icon" :size="32"><Loading /></el-icon>
        <span>正在获取监控信息...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import YsMonitor from '@/components/YsMonitor.vue'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()
const greenhouseId = route.query.greenhouseId
const deviceId = route.query.deviceId
const serialNumber = ref(route.query.serialNumber || '')
const monitorUrl = ref(route.query.monitorUrl || '')

const accessToken = ref('')
const monitorReady = ref(false)

// 获取萤石云 token
const getYsToken = async () => {
  try {
    const res = await request({
      url: '/monitor/ys-token',
      method: 'get'
    })
    accessToken.value = res.data.accessToken
    return res.data
  } catch (error) {
    ElMessage.error('获取监控授权失败')
    throw error
  }
}

// 初始化监控信息
const initMonitor = async () => {
  // 验证必要参数
  if (!serialNumber.value || !monitorUrl.value) {
    ElMessage.error('缺少必要的监控参数')
    router.back()
    return
  }

  try {
    const tokenInfo = await getYsToken()
    accessToken.value = tokenInfo.accessToken
    monitorReady.value = true
  } catch (error) {
    console.error('初始化监控失败:', error)
    router.back()
  }
}

onMounted(() => {
  initMonitor()
})
</script>

<style scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.monitor-content {
  flex: 1;
  padding: 24px;
  background: #fff;
  min-height: 500px;
}

.loading-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
}

.loading-icon {
  animation: rotate 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style> 