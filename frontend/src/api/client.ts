import axios from 'axios'

const client = axios.create({ baseURL: '/api' })

client.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('igna_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem('igna_token')
      sessionStorage.removeItem('igna_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default client
