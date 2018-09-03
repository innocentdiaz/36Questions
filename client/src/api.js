import {create} from 'apisauce'

let apiBaseURL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api'

// define the api
const api = create({
  baseURL: apiBaseURL
});

api.addResponseTransform(res => {
  if (!res.data) {
    res.data = {}
  }
})

export default api;