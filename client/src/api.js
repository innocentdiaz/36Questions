import {create} from 'apisauce'

let apiBaseURL = process.env.NODE_ENV == 'production' ? process.env.PORT : 'http://localhost:5000'

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