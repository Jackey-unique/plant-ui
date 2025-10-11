<template>
  <el-container class="layout-container">
    <!-- 顶部栏 -->
    <el-header class="header">
      <div class="logo">青州农业大棚管理系统</div>
      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            <el-avatar :size="32" class="user-avatar">{{ userInfo.realName?.charAt(0) }}</el-avatar>
            <span class="username">{{ userInfo.realName }}</span>
            <el-icon class="el-icon--right"><CaretBottom /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">使用人员信息</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container class="main-container">
      <!-- 侧边栏 -->
      <el-aside class="sidebar" width="15vw">
        <el-menu
          :default-active="activeMenu"
          router
          :collapse="isCollapse"
          class="sidebar-menu"
          background-color="#001529"
          text-color="rgba(255, 255, 255, 0.65)"
          active-text-color="#fff"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/dashboard">
            <el-icon><Monitor /></el-icon>
            <span>总体设备参数展示</span>
          </el-menu-item>
          <el-menu-item index="/greenhouse">
            <el-icon><House /></el-icon>
            <span>统一管理温棚</span>
          </el-menu-item>
          <el-menu-item index="/profile">
            <el-icon><User /></el-icon>
            <span>使用人员信息</span>
          </el-menu-item>
          <el-menu-item index="/ai">
            <el-icon><User /></el-icon>
            <span>AI对话知识问答</span>
          </el-menu-item>
          <el-menu-item index="/automation">
            <el-icon><Monitor /></el-icon>
            <span>机械自动化控制</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主要内容区 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Monitor, House, User, CaretBottom } from '@element-plus/icons-vue'
import { getCurrentUser } from '@/api/auth'

const router = useRouter()
const route = useRoute()
const activeMenu = ref(route.path)
const userInfo = ref({})
const isCollapse = ref(false)
let navigationLock = false

// 获取用户信息
const getUserInfo = async () => {
  try {
    const res = await getCurrentUser()
    userInfo.value = res.data
  } catch (error) {
    console.error(error)
  }
}

// 处理菜单选择
const handleMenuSelect = (index) => {
  if (!navigationLock) {
    navigationLock = true
    activeMenu.value = index
    setTimeout(() => {
      navigationLock = false
    }, 300)
  }
}

// 处理下拉菜单命令
const handleCommand = (command) => {
  if (command === 'profile' && !navigationLock) {
    navigationLock = true
    router.push('/profile').finally(() => {
      setTimeout(() => {
        navigationLock = false
      }, 300)
    })
  }
}

onMounted(() => {
  getUserInfo()
})

onUnmounted(() => {
  navigationLock = false
})
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 6vh;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2vw;
}

.main-container {
  padding-top: 6vh;
  min-height: 94vh;
  display: flex;
  position: relative;
  width: 100%;
}

.sidebar {
  min-height: 94vh;
  background-color: #001529;
  position: relative;
  width: 15vw !important;
  flex-shrink: 0;
}

.sidebar-menu {
  border-right: none;
  min-height: 100%;
}

.main-content {
  padding: 0 !important;
  background-color: #fff;
  min-height: 94vh;
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
}

.logo {
  font-size: 18px;
  font-weight: bold;
  color: #001529;
  letter-spacing: 1px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 1vw;
  height: 6vh;
}

.user-info:hover {
  background: rgba(0,0,0,.025);
}

.user-avatar {
  background: #1890ff;
  margin-right: 1vw;
}

.username {
  font-size: 1vw;
  color: rgba(0,0,0,.85);
  margin-right: 0.5vw;
}

/* 响应式处理 */
@media screen and (max-width: 768px) {
  .sidebar {
    width: 5vw !important;
  }
}
</style> 