<template>
  <div class="automation-page">
    <div class="cards">
      <el-card class="card" shadow="hover">
        <template #header>
          <div class="card-header">环境联动控制</div>
        </template>
        <div class="control-row">
          <span>自动模式</span>
          <el-switch v-model="autoMode" />
        </div>
        <div class="grid">
          <div class="item">
            <div class="label">温度(℃)</div>
            <el-input-number v-model="targets.temp" :min="0" :max="50" />
          </div>
          <div class="item">
            <div class="label">湿度(%)</div>
            <el-input-number v-model="targets.hum" :min="0" :max="100" />
          </div>
          <div class="item">
            <div class="label">CO₂(ppm)</div>
            <el-input-number v-model="targets.co2" :min="300" :max="2000" :step="50" />
          </div>
          <div class="item">
            <div class="label">光照(lux)</div>
            <el-input-number v-model="targets.lux" :min="0" :max="200000" :step="100" />
          </div>
        </div>
        <div class="actions">
          <el-button type="primary" :loading="saving" @click="saveTargets">保存策略</el-button>
        </div>
      </el-card>

      <el-card class="card" shadow="hover">
        <template #header>
          <div class="card-header">设备手动控制</div>
        </template>
        <div class="devices">
          <div class="dev">
            <div>风机</div>
            <el-switch v-model="deviceStates.fan" @change="onDeviceToggle('fan')" />
          </div>
          <div class="dev">
            <div>加热</div>
            <el-switch v-model="deviceStates.heater" @change="onDeviceToggle('heater')" />
          </div>
          <div class="dev">
            <div>灌溉</div>
            <el-switch v-model="deviceStates.irrigation" @change="onDeviceToggle('irrigation')" />
          </div>
          <div class="dev">
            <div>补光</div>
            <el-switch v-model="deviceStates.lamp" @change="onDeviceToggle('lamp')" />
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { saveAutomationTargets, toggleDevice } from '@/api/automation'

const autoMode = ref(true)
const saving = ref(false)
const targets = ref({ temp: 24, hum: 65, co2: 800, lux: 30000 })
const deviceStates = ref({ fan: false, heater: false, irrigation: false, lamp: false })

async function saveTargets() {
  saving.value = true
  try {
    await saveAutomationTargets({
      temp: targets.value.temp,
      hum: targets.value.hum,
      co2: targets.value.co2,
      lux: targets.value.lux,
      auto: autoMode.value,
    })
    ElMessage.success('策略已保存')
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

async function onDeviceToggle(key) {
  try {
    await toggleDevice({ key, on: deviceStates.value[key] })
    ElMessage.success(`${key} 已切换`)
  } catch (e) {
    ElMessage.error('操作失败')
  }
}
</script>

<style scoped>
.automation-page { padding: 1.5vw; background: #f5f7fa; height: 100%; }
.cards { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2vw; }
.card { min-height: 320px; }
.card-header { font-weight: 600; }
.control-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(180px, 1fr)); gap: 16px; }
.item { display: flex; flex-direction: column; gap: 6px; }
.label { color: #666; }
.actions { margin-top: 12px; }
.devices { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.dev { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border: 1px solid #eee; border-radius: 6px; background: #fff; }
@media (max-width: 1024px) { .cards { grid-template-columns: 1fr; } }
</style>

