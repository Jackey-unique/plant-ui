<template>
  <div class="dashboard-container">
    <div class="content">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <div class="panel-item">
          <div class="panel-header">
            <h3>大棚概况</h3>
            <el-select 
              v-model="selectedGreenhouse" 
              placeholder="选择大棚"
              size="small"
              class="greenhouse-select"
            >
              <el-option
                v-for="item in greenhouseOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div class="data-overview">
            <div class="data-item">
              <div class="value">{{ greenhouseList.length }}</div>
              <div class="label">大棚总数</div>
            </div>
            <div class="data-item">
              <div class="value">{{ deviceList.length }}</div>
              <div class="label">在线设备</div>
            </div>
            <div class="data-item">
              <div class="value">{{ alerts.length }}</div>
              <div class="label">告警数量</div>
            </div>
          </div>
          <div class="greenhouse-details">
            <template v-for="device in soilDevices" :key="device.id">
              <div class="detail-item">
                <span class="detail-label">{{ device.name }}</span>
                <span class="detail-value">
                  {{ realTimeData[device.name] || '0' }}{{ device.unit }}
                </span>
              </div>
            </template>
          </div>
        </div>
        
        <div class="panel-item charts-container">
          <h3>环境监测</h3>
          <div class="charts-grid">
            <div 
              v-for="device in soilDevices.slice(0, Math.ceil(soilDevices.length / 2))" 
              :key="device.id" 
              class="chart-card"
            >
              <div class="chart-header">
                <span class="chart-title">{{ device.name }}</span>
                <span class="chart-value">{{ realTimeData[device.name] || '0' }}{{ device.unit }}</span>
              </div>
              <v-chart 
                class="chart" 
                :option="chartOptions[device.name]"
                :autoresize="true"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 中间区域 -->
      <div class="center-panel">
        <div class="panel-item full-height">
          <h3>实时监控</h3>
          <div class="video-container">
            <div id="video-container" class="video-content">
              <div v-if="!cameraDevice" class="video-placeholder">
                <el-icon class="placeholder-icon"><VideoCamera /></el-icon>
                <span>视频监控区域</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <div class="right-charts-container">
          <h3>环境监测</h3>
          <div class="charts-grid">
            <div 
              v-for="device in soilDevices.slice(Math.ceil(soilDevices.length / 2))" 
              :key="device.id" 
              class="chart-card"
            >
              <div class="chart-header">
                <span class="chart-title">{{ device.name }}</span>
                <span class="chart-value">{{ realTimeData[device.name] || '0' }}{{ device.unit }}</span>
              </div>
              <v-chart 
                class="chart" 
                :option="chartOptions[device.name]"
                :autoresize="true"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { VideoCamera } from '@element-plus/icons-vue'
import EZUIKit from 'ezuikit-js'
import { use } from 'echarts/core'
import { LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import {
  getGreenhouses,
  getDevices,
  getDeviceRealTimeData,
  getDeviceHistoryData,
  getYsAccessToken
} from '@/api/dashboard'

// 注册必要的 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  LegendComponent
])

// 大棚数据
const greenhouseList = ref([])
const selectedGreenhouse = ref('')
const greenhouseOptions = ref([])

// 设备数据
const deviceList = ref([])
const soilDevices = ref([])
const cameraDevice = ref(null)

// 监控相关
const videoPlayer = ref(null)
const videoContainer = ref(null)

// 实时数据
const realTimeData = ref({})

// 历史数据图表配置
const chartOptions = ref({
  temperature: {},
  humidity: {},
  ph: {},
  nitrogen: {},
  conductivity: {}
})

// 定时器
let dataTimer = null

// 告警信息
const alerts = ref([])

// 定时刷新数据
const startDataRefresh = () => {
  // 清除已有定时器
  if (dataTimer) {
    clearInterval(dataTimer)
  }
  
  // 创建新的定时器,每30秒刷新一次数据
  dataTimer = setInterval(async () => {
    if (selectedGreenhouse.value) {
      await getRealTimeData()
      await getHistoryData()
    }
  }, 30000)
}

// 停止数据刷新
const stopDataRefresh = () => {
  if (dataTimer) {
    clearInterval(dataTimer)
    dataTimer = null
  }
}

// 初始化大棚列表
const initGreenhouses = async () => {
  try {
    const res = await getGreenhouses()
    if (res.code === 200) {
      greenhouseList.value = res.data
      greenhouseOptions.value = greenhouseList.value.map(item => ({
        value: item.id,
        label: item.name
      }))
      if (greenhouseOptions.value.length > 0) {
        selectedGreenhouse.value = greenhouseOptions.value[0].value
      }
    }
  } catch (error) {
    console.error('获取大棚列表失败:', error)
  }
}

// 初始化设备列表
const initDevices = async (greenhouseId) => {
  try {
    console.log('开始获取设备列表, 大棚ID:', greenhouseId)
    const res = await getDevices(greenhouseId)
    console.log('设备列表响应:', res)
    
    if (res.code === 200) {
      deviceList.value = res.data
      soilDevices.value = deviceList.value.filter(d => d.deviceType === 'SOIL_MOISTURE')
      cameraDevice.value = deviceList.value.find(d => d.deviceType === 'CAMERA')
      
      console.log('摄像头设备:', cameraDevice.value)
      console.log('土壤传感器:', soilDevices.value)

      // 初始化实时数据对象
      soilDevices.value.forEach(device => {
        realTimeData.value[device.name] = '0'
      })
      
      // 获取实时数据
      await getRealTimeData()
      // 获取历史数据
      await getHistoryData()
      // 初始化视频监控
      if (cameraDevice.value) {
        initVideoMonitor()
      } else {
        console.warn('未找到摄像头设备')
      }
      // 启动数据刷新
      startDataRefresh()
    }
  } catch (error) {
    console.error('获取设备列表失败:', error)
  }
}

// 获取实时数据
const getRealTimeData = async () => {
  try {
    // 直接使用设备列表中的 serialNumber
    const serialNumbers = soilDevices.value.map(d => d.serialNumber)
    // 确保有设备序列号才发送请求
    if (serialNumbers.length === 0) return
    
    const res = await getDeviceRealTimeData(
      selectedGreenhouse.value, 
      serialNumbers  // 使用原始的 serialNumber
    )
    
    if (res.code === 200) {
      // 更新实时数据
      res.data.forEach(item => {
        // 直接使用 serialNumber 匹配
        const device = soilDevices.value.find(d => d.serialNumber === item.id)
        if (device) {
          realTimeData.value = {
            ...realTimeData.value,
            [device.name]: Number(item.value).toFixed(1)
          }
          checkAlertCondition(device.name, item.value)
        }
      })
    }
  } catch (error) {
    console.error('获取实时数据失败:', error)
  }
}

// 获取历史数据
const getHistoryData = async () => {
  for (const device of soilDevices.value) {
    try {
      const res = await getDeviceHistoryData(device.serialNumber)
      if (res.code === 200) {
        const data = res.data.map(item => ({
          time: new Date(item.createTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          value: item.value
        })).reverse()
        
        // 为土壤PH值使用柱状图，其他使用折线图
        const isBarChart = device.name === '土壤PH值'
        
        chartOptions.value[device.name] = {
          backgroundColor: 'transparent',
          title: {
            show: false
          },
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderColor: 'rgba(255,255,255,0.2)',
            textStyle: { color: '#fff' }
          },
          grid: {
            top: '5%',
            left: '5%',
            right: '5%',
            bottom: '10%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: data.map(d => d.time),
            axisLabel: { 
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.7vw'
            },
            axisLine: {
              lineStyle: { color: 'rgba(255,255,255,0.1)' }
            }
          },
          yAxis: {
            type: 'value',
            name: device.unit,
            nameTextStyle: { color: 'rgba(255,255,255,0.7)' },
            axisLabel: { 
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.7vw'
            },
            splitLine: {
              lineStyle: { color: 'rgba(255,255,255,0.1)' }
            }
          },
          series: [{
            data: data.map(d => d.value),
            type: isBarChart ? 'bar' : 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            itemStyle: {
              color: '#36d1dc'
            },
            ...(isBarChart ? {
              barWidth: '60%',
              itemStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [{
                    offset: 0,
                    color: '#36d1dc'
                  }, {
                    offset: 1,
                    color: 'rgba(54,209,220,0.3)'
                  }]
                },
                borderRadius: [4, 4, 0, 0]
              }
            } : {
              lineStyle: {
                width: 2,
                color: '#36d1dc'
              },
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [{
                    offset: 0,
                    color: 'rgba(54,209,220,0.3)'
                  }, {
                    offset: 1,
                    color: 'rgba(54,209,220,0.05)'
                  }]
                }
              }
            })
          }]
        }
      }
    } catch (error) {
      console.error(`获取${device.name}历史数据失败:`, error)
    }
  }
}

// 初始化视频监控
const initVideoMonitor = async () => {
  try {
    console.log('开始初始化视频监控...')
    console.log('摄像头设备信息:', cameraDevice.value)
    
    const tokenRes = await getYsAccessToken()
    console.log('获取访问token响应:', tokenRes)
    
    if (tokenRes.code === 200) {
      const { accessToken } = tokenRes.data
      const videoUrl = `ezopen://open.ys7.com/${cameraDevice.value.serialNumber}/1.live`
      
      console.log('视频初始化参数:', {
        accessToken,
        videoUrl,
        deviceSerial: cameraDevice.value.serialNumber
      })

      // 初始化播放器
      videoPlayer.value = new EZUIKit.EZUIKitPlayer({
        id: 'video-container',
        accessToken,
        url: videoUrl,
        template: 'simple', // 使用简单模板
        autoplay: true,
        audio: 1,
        width: 800,
        height: 600,
        splitBasis: 1, // 设置分屏数
        handleSuccess: () => {
          console.log('视频播放器初始化成功')
          // 初始化成功后调整视频尺寸以适应容器
          videoPlayer.value.resize({
            width: document.getElementById('video-container').clientWidth,
            height: document.getElementById('video-container').clientHeight
          })
        },
        handleError: (e) => {
          console.error('视频播放器错误:', e)
        }
      })

      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        if (videoPlayer.value) {
          videoPlayer.value.resize({
            width: document.getElementById('video-container').clientWidth,
            height: document.getElementById('video-container').clientHeight
          })
        }
      })
    }
  } catch (error) {
    console.error('初始化视频监控失败:', error)
  }
}

// 监听大棚选择变化
watch(selectedGreenhouse, (newVal) => {
  if (newVal) {
    initDevices(newVal)
  }
})

// 组件挂载时初始化
onMounted(() => {
  initGreenhouses()
})

// 组件卸载时清理
onUnmounted(() => {
  stopDataRefresh()
  window.removeEventListener('resize', handleResize)
  if (videoPlayer.value) {
    console.log('销毁视频播放器')
    videoPlayer.value.destroy()
  }
})

// 添加告警检查方法
const checkAlertCondition = (name, value) => {
  const thresholds = {
    '土壤温度': { min: 15, max: 30 },
    '土壤含水率': { min: 40, max: 80 },
    '土壤PH值': { min: 6, max: 8 },
    '土壤氮含量': { min: 100, max: 200 },
    '土壤电导率': { min: 0.5, max: 2 }
  }

  const threshold = thresholds[name]
  if (threshold) {
    if (value < threshold.min) {
      addAlert('warning', `${name}过低: ${value}`)
    } else if (value > threshold.max) {
      addAlert('warning', `${name}过高: ${value}`)
    }
  }
}

// 添加告警信息方法
const addAlert = (level, message) => {
  const now = new Date()
  const time = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  alerts.value.unshift({
    id: Date.now(),
    time,
    message,
    level
  })
  // 最多保留10条告警信息
  if (alerts.value.length > 10) {
    alerts.value.pop()
  }
}

// 修改视频容器样式
const styles = `
<style>
  #video-container {
    width: 100%;
    height: 100%;
    background: #000;
  }
  .ezuikit-video {
    width: 100% !important;
    height: 100% !important;
  }
  .parent-wnd {
    width: 100% !important;
    height: 100% !important;
  }
</style>
`
// 添加样式到head
document.head.insertAdjacentHTML('beforeend', styles)
</script>

<style scoped>
.dashboard-container {
  width: 100%;
  height: 100vh;
  padding: 1vw;
  box-sizing: border-box;
  background: #1a1a1a;
  color: #fff;
}

.content {
  display: grid;
  grid-template-columns: 18vw 52vw 30vw;
  gap: 1vw;
  height: calc(100vh - 2vw);
}

.panel-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.3vw;
  padding: 0.8vw;
  margin-bottom: 0.5vw;
  display: flex;
  flex-direction: column;
}

.panel-item h3 {
  margin: 0;
  padding: 0.8vw;
  color: #36d1dc;
  font-size: 1vw;
  font-weight: normal;
}

.chart {
  height: 25vh;
}

.data-overview {
  display: flex;
  justify-content: space-around;
  margin: 0.5vw 0;
  padding: 0.5vw;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.3vw;
}

.data-item {
  text-align: center;
}

.value {
  font-size: 1.5vw;
  color: #36d1dc;
  margin-bottom: 0.3vw;
}

.label {
  font-size: 0.8vw;
  color: #999;
}

.alert-list {
  max-height: 25vh;
  overflow-y: auto;
}

.alert-item {
  padding: 0.5vw;
  border-radius: 0.2vw;
  margin-bottom: 0.5vw;
  display: flex;
  align-items: center;
}

.alert-time {
  margin-right: 0.5vw;
  font-size: 0.7vw;
}

.alert-item.warning {
  background: rgba(230, 162, 60, 0.2);
}

.alert-item.error {
  background: rgba(245, 108, 108, 0.2);
}

.alert-item.info {
  background: rgba(144, 147, 153, 0.2);
}

.full-height {
  height: calc(100% - 2vw);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8vw;
}

.greenhouse-select {
  width: 7vw;
}

:deep(.greenhouse-select .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: none !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.greenhouse-select .el-input__inner) {
  color: #fff;
  font-size: 0.8vw;
}

:deep(.greenhouse-select .el-select__caret) {
  color: #fff;
}

.greenhouse-details {
  margin-top: 0.5vw;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6vw;
  overflow-y: auto;
  max-height: calc(22vh - 10vw);
}

.detail-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.6vw;
  border-radius: 0.2vw;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 2.5vw;
}

.detail-label {
  color: #999;
  font-size: 0.8vw;
  margin-right: 1vw;
}

.detail-value {
  color: #36d1dc;
  font-size: 0.9vw;
  font-weight: 500;
  min-width: 4vw;
  text-align: right;
}

:deep(.el-select__popper) {
  background: #1a1a1a !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

:deep(.el-select-dropdown__item) {
  color: #fff !important;
}

:deep(.el-select-dropdown__item.hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}

:deep(.el-select-dropdown__item.selected) {
  background: rgba(54, 209, 220, 0.2) !important;
  color: #36d1dc !important;
}

/* 添加视频容器样式 */
.video-container {
  width: 100%;
  height: calc(100% - 3vw);
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.3vw;
  overflow: hidden;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: rgba(255, 255, 255, 0.6);
}

.placeholder-icon {
  font-size: 3vw;
  margin-bottom: 1vw;
}

/* 视频内容样式 */
.video-content {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 加载状态样式 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
}

.loading-icon {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 图表容器样式 */
.charts-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.8vw;
  padding: 0.8vw;
  overflow-y: auto;
  height: calc(100% - 2.5vw);
}

.chart-card {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.3vw;
  padding: 0.8vw;
  display: flex;
  flex-direction: column;
  height: 22vh;
  min-height: 160px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5vw;
  height: 30px;
}

.chart-title {
  color: #36d1dc;
  font-size: 0.8vw;
}

.chart-value {
  color: #fff;
  font-size: 0.9vw;
  font-weight: 500;
}

.chart {
  flex: 1;
  min-height: 150px;
  width: 100%;
  height: calc(100% - 30px);
}

/* 修改滚动条样式 */
.charts-grid::-webkit-scrollbar {
  width: 0.4vw;
  display: none;
}

.charts-grid::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 0.2vw;
}

.charts-grid::-webkit-scrollbar-thumb {
  background: rgba(54, 209, 220, 0.3);
  border-radius: 0.2vw;
}

.charts-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(54, 209, 220, 0.5);
}

.panel-item.charts-container h3 {
  padding: 0.8vw;
  margin: 0;
  background: rgba(0, 0, 0, 0.2);
  border-top-left-radius: 0.3vw;
  border-top-right-radius: 0.3vw;
}

/* 右侧面板专用样式 */
.right-panel {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.3vw;
  height: 100%;
  overflow: hidden;
  padding: 0;
}

.right-charts-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 0.3vw;
}

.right-charts-container h3 {
  margin: 0;
  padding: 1vw;
  color: #36d1dc;
  font-size: 1.1vw;
  background: rgba(0, 0, 0, 0.2);
  border-top-left-radius: 0.3vw;
  border-top-right-radius: 0.3vw;
}

/* 添加媒体查询以适应不同屏幕 */
@media screen and (max-height: 900px) {
  .chart-card {
    height: calc((100vh - 35vw) / 3);
    min-height: 160px;
  }
  
  .chart {
    min-height: 130px;
  }
}

@media screen and (max-height: 768px) {
  .chart-card {
    height: calc((100vh - 30vw) / 3);
    min-height: 140px;
  }
  
  .chart {
    min-height: 110px;
  }
}

/* 修改视频播放器容器样式 */
#video-container {
  width: 100% !important;
  height: 100% !important;
  background: #000;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 修改视频元素样式 */
:deep(.ezuikit-video) {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain;
}

:deep(.parent-wnd) {
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  background: #000;
}

/* 调整中间面板样式 */
.center-panel {
  flex: 1;
  height: 100%;
}

.center-panel .panel-item {
  padding: 1vw;
  margin: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.3vw;
}

.center-panel .panel-item h3 {
  padding: 0 0 0.8vw 0;
  font-size: 1.2vw;
  margin: 0;
}

/* 视频控制按钮样式优化 */
:deep(.video-toolbox) {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 0.3vw;
  padding: 0.5vw;
}

:deep(.video-toolbox button) {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  border-radius: 0.2vw;
  margin: 0 0.2vw;
}

:deep(.video-toolbox button:hover) {
  background: rgba(255, 255, 255, 0.2);
}

/* 调整图表卡片在右侧的显示 */
.right-panel .chart-card {
  height: 28vh;
  min-height: 200px;
}

/* 调整右侧图表间距 */
.right-panel .charts-grid {
  gap: 1vw;
  padding: 1vw;
}
</style> 