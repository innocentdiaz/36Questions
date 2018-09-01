import api from '../../api';
import store from 'store';

export const fetchUser = (token) => {
  return dispatch => {
    api.get('/auth?token=' + token)
    .then(res => {
      if (res.ok) {
        dispatch({type: 'SET_USER', payload: res.data})
      } else {
        dispatch({type: 'SET_USER', payload: false});
        if (res.status == 401) {
          store.remove('TSQ_TOKEN')
        }
      }
    });
  }
};

export const setUser = user => ({
  type: 'SET_USER',
  payload: user
})
