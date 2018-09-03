import api from '../../api';
import store from 'store';

export const fetchUser = (token) => {
  return dispatch => {
    api.get(`/auth/${token}`)
    .then(res => {
      if (res.ok) {
        dispatch(setUser(res.data))
      } else {
        if (res.status == 401) {
          store.remove('TSQ_TOKEN')
        }
        dispatch(setUser(false));
      }
    });
  }
};

export const setUser = user => ({
  type: 'SET_USER',
  payload: user
})
