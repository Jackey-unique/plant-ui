import request from '@/utils/request'

export function saveAutomationTargets(data) {
  return request({
    url: '/automation/targets',
    method: 'post',
    data
  })
}

export function toggleDevice(data) {
  return request({
    url: '/automation/toggle',
    method: 'post',
    data
  })
}


