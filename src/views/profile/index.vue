<template>
  <div class="page-container">
    <div class="page-header">
      <h2>个人信息</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleEdit" v-if="!isEditing">编辑</el-button>
        <template v-else>
          <el-button type="primary" @click="handleSave">保存</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </template>
      </div>
    </div>

    <div class="page-content">
      <el-form 
        ref="formRef"
        :model="userForm"
        :rules="formRules"
        label-width="120px"
        :disabled="!isEditing"
        class="form-container"
      >
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          <el-form-item label="用户名" prop="username">
            <el-input v-model="userForm.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="真实姓名" prop="realName">
            <el-input v-model="userForm.realName" placeholder="请输入真实姓名" />
          </el-form-item>
          <el-form-item label="手机号码" prop="phone">
            <el-input v-model="userForm.phone" placeholder="请输入手机号码" />
          </el-form-item>
          <el-form-item label="创建时间">
            <el-input v-model="userForm.createTime" disabled />
          </el-form-item>
        </div>

        <div class="form-section" v-if="isEditing">
          <h3 class="section-title">修改密码</h3>
          <el-form-item label="原密码" prop="oldPassword">
            <el-input 
              v-model="userForm.oldPassword"
              type="password"
              placeholder="请输入原密码"
              show-password
            />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input 
              v-model="userForm.newPassword"
              type="password"
              placeholder="请输入新密码"
              show-password
            />
          </el-form-item>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getCurrentUser, updateUserInfo } from '@/api/auth'

const isEditing = ref(false)
const formRef = ref()

const userForm = reactive({
  username: '',
  realName: '',
  phone: '',
  createTime: '',
  oldPassword: '',
  newPassword: ''
})

const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur', validator: (rule, value, callback) => {
      if (isEditing.value && !value && userForm.newPassword) {
        callback(new Error('请输入原密码'))
      } else {
        callback()
      }
    }}
  ],
  newPassword: [
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 获取用户信息
const getUserInfo = async () => {
  try {
    const res = await getCurrentUser()
    const { username, realName, phone, createTime } = res.data
    Object.assign(userForm, { username, realName, phone, createTime })
  } catch (error) {
    console.error(error)
  }
}

// 编辑按钮处理
const handleEdit = () => {
  isEditing.value = true
  userForm.oldPassword = ''
  userForm.newPassword = ''
}

// 保存按钮处理
const handleSave = async () => {
  await formRef.value.validate()
  try {
    await updateUserInfo(userForm)
    ElMessage.success('保存成功')
    isEditing.value = false
    getUserInfo() // 重新获取用户信息
  } catch (error) {
    console.error(error)
  }
}

// 取消按钮处理
const handleCancel = () => {
  isEditing.value = false
  getUserInfo() // 重置表单数据
}

onMounted(() => {
  getUserInfo()
})
</script>

<style scoped>
.page-container {
  background-color: #fff;
  min-height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-content {
  flex: 1;
  padding: 24px;
}

.form-container {
  max-width: 1200px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 24px;
  padding: 24px;
  background-color: #fafafa;
  border-radius: 4px;
  width: 100%;
}

.section-title {
  margin: 0 0 20px;
  font-size: 16px;
  font-weight: 500;
  color: #1f2329;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #4e5969;
}

:deep(.el-input__wrapper) {
  background-color: #fff;
  box-shadow: none;
  border: 1px solid #dcdfe6;
}

:deep(.el-input__wrapper.is-disabled) {
  background-color: #f5f7fa;
}

:deep(.el-input__wrapper:hover) {
  border-color: #909399;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 1px #409eff;
}

/* 响应式处理 */
@media screen and (max-width: 768px) {
  .profile-container {
    padding: 16px;
  }

  .profile-form {
    padding: 0;
  }

  .form-section {
    padding: 16px;
  }

  :deep(.el-form-item__label) {
    float: none;
    display: block;
    text-align: left;
    margin-bottom: 8px;
  }

  .el-form :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }
}
</style> 