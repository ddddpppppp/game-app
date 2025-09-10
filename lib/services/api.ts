import api from '../api'

// 上传文件响应接口
export interface UploadResponse {
  original_name: string
  save_name: string
  save_path: string
  size: number
  mime_type: string
  extension: string
  md5: string
  sha1: string
  url: string
  storage: string
}

// 通用API服务（对应后端 Api.php 控制器）
class ApiService {
  // 上传文件
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/api/api/uploadFile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
}

export const apiService = new ApiService() 