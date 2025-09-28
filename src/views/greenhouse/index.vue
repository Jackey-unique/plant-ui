<template>
  <div>
    <div class="header-actions">
      <h2>大棚管理</h2>
      <el-button type="primary" @click="handleAdd">新增大棚</el-button>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <el-table 
        v-loading="loading"
        :data="tableData"
        style="width: 100%;"
        @row-click="handleRowClick"
        class="clickable-table"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="大棚名称" min-width="150" />
        <el-table-column prop="address" label="地址" min-width="250" show-overflow-tooltip />
        <el-table-column prop="area" label="面积（亩）" width="100" />
        <el-table-column prop="boxNo" label="大棚设备号" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '异常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="200" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" @click.stop="handleEdit(row)">编辑</el-button>
              <el-button link type="danger" @click.stop="handleDelete(row)">删除</el-button>
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
      :title="dialogType === 'add' ? '新增大棚' : '编辑大棚'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="大棚名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入大棚名称" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="面积" prop="area">
          <el-input-number v-model="form.area" :min="0" :precision="2" placeholder="请输入面积" />
        </el-form-item>
        <el-form-item label="大棚设备号">
          <el-input v-model="form.boxNo" placeholder="请输入大棚设备号" />
        </el-form-item>
        <el-form-item label="访问令牌">
          <el-input v-model="form.accessToken" placeholder="请输入访问令牌" />
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
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { useRouter } from 'vue-router'
import { 
  getGreenhouseList, 
  createGreenhouse, 
  updateGreenhouse,
  deleteGreenhouse 
} from '@/api/greenhouse'

const router = useRouter()

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
  address: '',
  area: 0,
  boxNo: '',
  accessToken: ''
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入大棚名称', trigger: 'blur' }],
  area: [{ required: true, message: '请输入面积', trigger: 'blur' }]
}

// 获取列表数据
const getList = async () => {
  loading.value = true
  try {
    const res = await getGreenhouseList({
      page: currentPage.value - 1,
      size: pageSize.value
    })
    tableData.value = res.data
    total.value = res.data.length
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 新增按钮
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  editingId.value = null
  form.value = {
    name: '',
    address: '',
    area: 0,
    boxNo: '',
    accessToken: ''
  }
}

// 编辑按钮处理
const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  editingId.value = row.id
  form.value = {
    name: row.name,
    address: row.address,
    area: row.area,
    boxNo: row.boxNo,
    accessToken: row.accessToken || ''
  }
}

// 提交表单
const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    if (dialogType.value === 'add') {
      await createGreenhouse(form.value)
      ElMessage.success('创建成功')
    } else {
      await updateGreenhouse(editingId.value, form.value)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    getList()
  } catch (error) {
    console.error(error)
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

// 删除按钮处理
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确认删除大棚"${row.name}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteGreenhouse(row.id)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      console.error(error)
    }
  })
}

// 处理行点击
const handleRowClick = (row) => {
  router.push({
    path: '/device',
    query: {
      greenhouseId: row.id
    }
  })
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.table-container {
  padding: 24px;
  background-color: #fff;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-dialog__body) {
  padding-top: 20px;
}

/* 表格样式优化 */
:deep(.el-table) {
  --el-table-header-bg-color: #fafafa;
}

:deep(.el-table th) {
  font-weight: 600;
  color: #1f2329;
}

/* 操作按钮样式 */
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

:deep(.el-button--link.el-button--danger:hover) {
  color: var(--el-color-danger-light-3);
}

/* 设备信息弹窗样式 */
:deep(.device-info-dialog) {
  width: 400px;
}

:deep(.device-info-dialog .el-message-box__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

:deep(.device-info-dialog .el-message-box__title) {
  font-size: 16px;
  font-weight: 500;
}

:deep(.device-info-dialog .el-message-box__content) {
  padding: 20px;
  font-size: 14px;
  color: #606266;
}

/* 可点击行的样式 */
:deep(.clickable-table) {
  cursor: pointer;
}

:deep(.clickable-table tr:hover) {
  background-color: var(--el-table-row-hover-bg-color);
}
</style> 