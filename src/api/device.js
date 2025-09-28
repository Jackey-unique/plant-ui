import request from '@/utils/request'

// 获取设备列表
export function getDeviceList(params) {
  return request({
    url: '/device/list',
    method: 'get',
    params
  })
}

// 创建设备
export function createDevice(data) {
  return request({
    url: '/device',
    method: 'post',
    data
  })
}

// 更新设备
export function updateDevice(id, data) {
  return request({
    url: `/device/${id}`,
    method: 'put',
    data
  })
}

// 删除设备
export function deleteDevice(id) {
  return request({
    url: `/device/${id}`,
    method: 'delete'
  })
} 