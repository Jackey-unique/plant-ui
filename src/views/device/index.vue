<template>
  <div class="page-wrapper">
    <div class="header-actions">
      <!-- 面包屑导航 -->
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/greenhouse' }">大棚管理</el-breadcrumb-item>
        <el-breadcrumb-item>{{ greenhouseName }}</el-breadcrumb-item>
      </el-breadcrumb>
      <el-button type="primary" @click="handleAdd">新增设备</el-button>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <el-table 
        v-loading="loading"
        :data="tableData"
        style="width: 100%;"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="设备名称" min-width="120" />
        <el-table-column prop="serialNumber" label="序列号" min-width="150" />
        <el-table-column label="设备类型" width="120">
          <template #default="{ row }">
            {{ getDeviceTypeName(row.deviceType) }}
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'warning'">
              {{ row.status === 1 ? '正常' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="primary" @click="handleMonitor(row)" v-if="row.deviceType === 'CAMERA'">
                监控
              </el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增设备' : '编辑设备'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="序列号" prop="serialNumber">
          <el-input v-model="form.serialNumber" placeholder="请输入序列号" />
        </el-form-item>
        <el-form-item label="设备类型" prop="deviceType">
          <el-select 
            v-model="form.deviceType" 
            placeholder="请选择设备类型"
            @change="handleDeviceTypeChange"
          >
            <el-option
              v-for="type in DEVICE_TYPES"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item 
          label="检测类型" 
          prop="subType"
          v-if="form.deviceType === 'SOIL_MOISTURE'"
        >
          <el-select 
            v-model="form.subType"
            placeholder="请选择检测类型"
            @change="handleSubTypeChange"
          >
            <el-option
              v-for="subType in getSubTypes(form.deviceType)"
              :key="subType.value"
              :label="subType.label"
              :value="subType.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="form.unit" placeholder="请输入单位" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getDeviceList, 
  createDevice,
  updateDevice,
  deleteDevice
} from '@/api/device'

const route = useRoute()
const router = useRouter()
const greenhouseId = route.query.greenhouseId
const greenhouseName = ref('')

// 表格数据
const loading = ref(false)
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 弹窗控制
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref()
const editingId = ref(null)
const form = ref({
  name: '',
  serialNumber: '',
  deviceType: '',
  subType: '',
  unit: '',
  description: '',
  monitorUrl: '',
  greenhouseId: route.query.greenhouseId
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  serialNumber: [{ required: true, message: '请输入序列号', trigger: 'blur' }],
  deviceType: [{ required: true, message: '请选择设备类型', trigger: 'change' }]
}

// 设备类型常量
const DEVICE_TYPES = [
  { 
    label: '土壤检测', 
    value: 'SOIL_MOISTURE',
    children: [
      { label: '土壤含水率', value: 'SOIL_MOISTURE_WATER' },
      { label: '土壤温度', value: 'SOIL_MOISTURE_TEMP' },
      { label: '土壤电导率', value: 'SOIL_MOISTURE_CONDUCT' },
      { label: '土壤PH值', value: 'SOIL_MOISTURE_PH' },
      { label: '土壤氮含量', value: 'SOIL_MOISTURE_N' }
    ]
  },
  { label: '摄像头', value: 'CAMERA' }
]

// 获取设备类型显示名称
const getDeviceTypeName = (type) => {
  const deviceType = DEVICE_TYPES.find(t => t.value === type)
  if (!deviceType) return type
  return deviceType.label
}

// 新增按钮
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  editingId.value = null
  form.value = {
    name: '',
    serialNumber: '',
    deviceType: '',
    subType: '',
    unit: '',
    description: '',
    monitorUrl: '',
    greenhouseId: route.query.greenhouseId
  }
}

// 编辑按钮
const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  editingId.value = row.id
  form.value = {
    name: row.name,
    serialNumber: row.serialNumber,
    deviceType: row.deviceType,
    subType: row.deviceType === 'SOIL_MOISTURE' ? getSoilMoistureSubType(row.name) : '',
    unit: row.unit,
    description: row.description,
    monitorUrl: row.monitorUrl || '',
    greenhouseId: row.greenhouseId
  }
}

// 删除按钮
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确认删除设备"${row.name}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteDevice(row.id)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      if (error.response?.data?.message?.includes('foreign key constraint fails')) {
        ElMessage.error('该设备有关联的数据，无法删除')
      } else {
        ElMessage.error('删除失败：' + (error.response?.data?.message || '未知错误'))
      }
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    if (dialogType.value === 'add') {
      await createDevice(form.value)
      ElMessage.success('创建成功')
    } else {
      await updateDevice(editingId.value, form.value)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    getList()
  } catch (error) {
    console.error(error)
  }
}

// 获取设备列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getDeviceList({
      greenhouseId,
      page: currentPage.value - 1,
      size: pageSize.value
    })
    tableData.value = res.data.content
    total.value = res.data.totalElements
    if (res.data.content.length > 0) {
      greenhouseName.value = res.data.content[0].greenhouseName
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  getList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getList()
}

// 监控按钮处理
const handleMonitor = (row) => {
  if (!row.serialNumber) {
    ElMessage.warning('设备缺少序列号')
    return
  }
  
  // 构造标准的萤石云监控地址
  const monitorUrl = `ezopen://open.ys7.com/${row.serialNumber}/1.hd.live`
  
  router.push({
    path: '/monitor',
    query: {
      greenhouseId: route.query.greenhouseId,
      deviceId: row.id,
      serialNumber: row.serialNumber,
      monitorUrl: monitorUrl
    }
  })
}

// 获取子类型选项
const getSubTypes = (deviceType) => {
  const type = DEVICE_TYPES.find(t => t.value === deviceType)
  return type?.children || []
}

// 处理设备类型变更
const handleDeviceTypeChange = (value) => {
  form.value.subType = ''
  if (value === 'SOIL_MOISTURE') {
    form.value.unit = ''
  } else if (value === 'CAMERA') {
    form.value.unit = '无'
    // 如果有序列号，自动生成监控地址
    if (form.value.serialNumber) {
      form.value.monitorUrl = `ezopen://open.ys7.com/${form.value.serialNumber}/1.hd.live`
    }
  }
}

// 监听序列号变化，自动更新摄像头监控地址
watch(() => form.value.serialNumber, (newVal) => {
  if (form.value.deviceType === 'CAMERA' && newVal) {
    form.value.monitorUrl = `ezopen://open.ys7.com/${newVal}/1.hd.live`
  }
})

// 处理子类型变更
const handleSubTypeChange = (value) => {
  const subType = getSubTypes(form.value.deviceType).find(t => t.value === value)
  if (subType) {
    form.value.name = subType.label
    switch (value) {
      case 'SOIL_MOISTURE_WATER':
        form.value.unit = '%'
        form.value.description = '土壤含水率'
        break
      case 'SOIL_MOISTURE_TEMP':
        form.value.unit = '℃'
        form.value.description = '土壤温度'
        break
      case 'SOIL_MOISTURE_CONDUCT':
        form.value.unit = 'us/cm'
        form.value.description = '土壤电导率'
        break
      case 'SOIL_MOISTURE_PH':
        form.value.unit = 'pH'
        form.value.description = '土壤PH值'
        break
      case 'SOIL_MOISTURE_N':
        form.value.unit = 'mg/kg'
        form.value.description = '土壤氮含量'
        break
    }
  }
}

// 根据设备名称获取土壤检测的子类型
const getSoilMoistureSubType = (name) => {
  switch (name) {
    case '土壤含水率':
      return 'SOIL_MOISTURE_WATER'
    case '土壤温度':
      return 'SOIL_MOISTURE_TEMP'
    case '土壤电导率':
      return 'SOIL_MOISTURE_CONDUCT'
    case '土壤PH值':
      return 'SOIL_MOISTURE_PH'
    case '土壤氮含量':
      return 'SOIL_MOISTURE_N'
    default:
      return ''
  }
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.page-wrapper {
  margin: 0;
  padding: 0;
  min-height: 100%;
  background: #fff;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  margin: 0;
  width: 100%;
}

.table-container {
  padding: 24px;
  background-color: #fff;
  margin: 0;
  flex: 1;
  width: 100%;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.table-actions {
  display: flex;
  gap: 8px;
}

:deep(.el-button--link) {
  padding: 0 8px;
  font-size: 14px;
}

:deep(.el-button--link.el-button--danger) {
  color: var(--el-color-danger);
}

:deep(.el-breadcrumb) {
  font-size: 16px;
}
</style> 