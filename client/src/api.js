import {create} from 'apisauce'
import config from './config.js';

// define the api
const api = create({
  baseURL: config.apiURL + '/api',
  headers: {'Accept': 'application/vnd.github.v3+json'}
});

api.addResponseTransform(res => {
  if (!res.data) {
    res.data = {}
  }
})

export default api;