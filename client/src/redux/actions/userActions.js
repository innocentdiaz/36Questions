import api from '../../api';
import store from 'store';

export const fetchUser = (token) => {
  return dispatch => {
    api.get(`/auth/${token}`)
    .then(res => {
      if (res.ok) {
        dispatch(
          setUser({...res.data, authToken: token})
        )
      } else {
        if (res.status === 401) {
          store.remove('TSQ_TOKEN')
        }
        dispatch(setUserDefault());
      }
    });
  }
};

export const setUser = user => ({
  type: 'SET_USER',
  payload: user
});
export const setUserDefault = () => ({
  type: 'SET_USER_DEFAULT'
});
