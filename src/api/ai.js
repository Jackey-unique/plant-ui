import request from '@/utils/request'

export function askAI(data) {
  return request({
    url: '/ai/ask',
    method: 'post',
    data
  })
}


