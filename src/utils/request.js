import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api', // 这里的 /api 会被代理转发
  timeout: 5000    // 请求超时时间
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.message || `请求失败: ${res.code}`)
      return Promise.reject(res)
    }
    return res
  },
  error => {
    ElMessage.error(error.response?.data?.message || error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request 