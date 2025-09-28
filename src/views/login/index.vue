<template>
  <div class="login-container">
    <div class="login-box">
      <el-tabs v-model="activeTab" class="login-tabs">
        <el-tab-pane label="登录" name="login">
          <el-form 
            ref="loginFormRef"
            :model="loginForm" 
            :rules="loginRules"
            class="login-form"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                :prefix-icon="User"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码" 
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <el-button 
                type="primary" 
                :loading="loading"
                class="submit-btn"
                @click="handleLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="注册" name="register">
          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            class="register-form"
          >
            <el-form-item prop="username">
              <el-input
                v-model="registerForm.username"
                placeholder="请输入用户名"
                :prefix-icon="User"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            <el-form-item prop="realName">
              <el-input
                v-model="registerForm.realName"
                placeholder="请输入真实姓名"
                :prefix-icon="User"
              />
            </el-form-item>
            <el-form-item prop="phone">
              <el-input
                v-model="registerForm.phone"
                placeholder="请输入手机号码"
                :prefix-icon="Phone"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                :loading="loading"
                class="submit-btn"
                @click="handleRegister"
              >
                注册
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Phone } from '@element-plus/icons-vue'
import { login, register } from '@/api/auth'

const router = useRouter()
const loading = ref(false)
const activeTab = ref('login')
const loginFormRef = ref()
const registerFormRef = ref()

// 登录表单
const loginForm = reactive({
  username: '',
  password: ''
})

// 注册表单
const registerForm = reactive({
  username: '',
  password: '',
  realName: '',
  phone: ''
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 登录处理
const handleLogin = async () => {
  await loginFormRef.value.validate()//调用表单验证检测输入内容是否规范
  
  loading.value = true
  try {
    const res = await login(loginForm)//调用login接口 loginform数据传后端
    localStorage.setItem('token', res.data)//用户storage存放token
    ElMessage.success('登录成功')//登陆成功输出
    router.push('/')
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 注册处理
const handleRegister = async () => {
  await registerFormRef.value.validate()
  
  loading.value = true
  try {
    await register(registerForm)
    ElMessage.success('注册成功')
    activeTab.value = 'login'
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.login-box {
  width: 100%;
  max-width: 380px;
  padding: 35px;
  margin: 0 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-tabs {
  :deep(.el-tabs__nav) {
    width: 100%;
    display: flex;
  }

  :deep(.el-tabs__item) {
    flex: 1;
    text-align: center;
    font-size: 15px;
    color: #606266;
  }
}

.login-form,
.register-form {
  margin-top: 25px;
}

:deep(.el-input__wrapper) {
  background-color: #fff;
  border: 1px solid #dcdfe6;
  box-shadow: none !important;
  transition: all 0.3s;
  padding: 0 15px;
}

:deep(.el-input__wrapper:hover) {
  border-color: #606266;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #303133;
  box-shadow: 0 0 0 1px #303133 !important;
}

:deep(.el-input__inner) {
  height: 40px;
  line-height: 40px;
}

:deep(.el-input__prefix) {
  color: #909399;
}

.submit-btn {
  width: 100%;
  height: 40px;
  font-size: 16px;
  font-weight: 500;
  background-color: #303133;
  border-color: #303133;
  margin-top: 10px;
}

.submit-btn:hover,
.submit-btn:focus {
  background-color: #404244;
  border-color: #404244;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: #dcdfe6;
}

:deep(.el-tabs__active-bar) {
  background-color: #303133;
}

:deep(.el-tabs__item.is-active) {
  color: #303133;
  font-weight: 500;
}

:deep(.el-tabs__item:hover) {
  color: #303133;
}

:deep(.el-form-item) {
  margin-bottom: 25px;
}

:deep(.el-form-item__error) {
  padding-top: 4px;
  color: #f56c6c;
}

/* 响应式处理 */
@media screen and (max-width: 480px) {
  .login-box {
    margin: 0 15px;
    padding: 25px;
  }
}
</style> 