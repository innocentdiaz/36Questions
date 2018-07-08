export const fetchUser = (token) => {
  return dispatch => {
    //get token
    dispatch({type: 'SET_USER', payload: {username: 'John', }})
  }
}