<template>
  <div class="app-container">
    <!-- 全局顶部栏 -->
    <div class="app-header">
      <div class="header-left">
        <span class="system-name">智慧大棚监管系统</span>
      </div>
      <div class="header-right">
        <!-- 可以添加其他顶部栏内容 -->
      </div>
    </div>
    
    <!-- 路由视图 -->
    <router-view></router-view>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isLoginPage = computed(() => route.path === '/login')
</script>

<style>
/* CSS Reset */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

#app {
  width: 100%;
  height: 100%;
}

.app-container {
  height: 100%;
}

/* 顶部栏样式 */
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  z-index: 1000;
  font-weight: bold;
}

.header-left {
  display: flex;
  align-items: center;
}

.system-name {
  font-size: 18px;
  font-weight: 700;
  color: #001529;
  letter-spacing: 2px;
}

/* Element Plus 样式覆盖 */
:root {
  --el-menu-bg-color: #001529;
  --el-menu-text-color: rgba(255, 255, 255, 0.65);
  --el-menu-hover-bg-color: #1890ff;
  --el-menu-active-color: #fff;
}

.el-container {
  height: 100%;
}

.el-aside {
  background-color: var(--el-menu-bg-color);
}

.el-main {
  padding: 20px;
  background-color: #f0f2f5;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* 主内容区域通用样式 */
.main-content {
  height: 100%;
  background-color: #f5f7fa;
}

.page-container {
  background-color: #fff;
  height: 100%;
  width: 100%;
  padding: 0;
}

.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-content {
  height: 100%;
  width: 100%;
  padding: 24px;
}
</style>
