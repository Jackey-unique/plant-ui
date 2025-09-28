import request from '@/utils/request'

// 获取大棚列表
export function getGreenhouses() {
  return request({
    url: '/greenhouse/list',
    method: 'get'
  })
}

// 获取大棚设备列表
export function getDevices(greenhouseId) {
  return request({
    url: '/device/list',
    method: 'get',
    params: { greenhouseId }
  })
}

// 获取设备实时数据
export function getDeviceRealTimeData(greenhouseId, serialNumbers) {
  return request({
    url: `/device-data/greenhouse/${greenhouseId}`,
    method: 'post',
    data: serialNumbers
  })
}

// 获取设备历史数据
export function getDeviceHistoryData(serialNumber) {
  return request({
    url: `/device-data/soil/${serialNumber}/stats`,
    method: 'get'
  })
}

// 获取萤石云token
export function getYsAccessToken() {
  return request({
    url: '/monitor/ys-token',
    method: 'get'
  })
}

// 获取仪表板概览数据
export function getDashboardOverview() {
  return request({
    url: '/dashboard/overview',
    method: 'get'
  })
} 