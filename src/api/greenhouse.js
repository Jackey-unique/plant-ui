import request from '@/utils/request'

// 获取大棚列表
export function getGreenhouseList(params) {
  return request({
    url: '/greenhouse/list',
    method: 'get',
    params
  })
}

// 创建大棚
export function createGreenhouse(data) {
  return request({
    url: '/greenhouse',
    method: 'post',
    data
  })
}

// 更新大棚信息
export function updateGreenhouse(id, data) {
  return request({
    url: `/greenhouse/${id}`,
    method: 'put',
    data
  })
}

// 删除大棚
export function deleteGreenhouse(id) {
  return request({
    url: `/greenhouse/${id}`,
    method: 'delete'
  })
} 