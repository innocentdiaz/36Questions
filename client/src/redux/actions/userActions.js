import axios from 'axios';
import config from '../../config';

export const fetchUser = (token) => {
  return dispatch => {
    axios.get(config.apiURL + '/api/auth?token=' + token)
    .then(res => {
      dispatch({type: 'SET_USER', payload: res.data})
    })
    .catch(err => {
      console.log(err.data.response)
    })
  }
};

export const setUser = user => ({
  type: 'SET_USER',
  payload: user
})