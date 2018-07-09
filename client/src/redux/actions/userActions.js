import axios from 'axios';
import config from '../../config';

export const fetchUser = (token) => {
  return dispatch => {
    console.log(token)
    axios.get(config.apiURL + '/api/auth?token=' + token)
    .then(res => {
      console.log(res.data)
      dispatch({type: 'SET_USER', payload: res.data.user})
    })
    .catch(err => {
      console.log(err)
    })
  }
};

export const setUser = user => ({
  type: 'SET_USER',
  payload: user
})