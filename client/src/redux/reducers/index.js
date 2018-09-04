import { combineReducers } from 'redux';

const initialState = {
  firstName: 'anon',
  lastName: 'user',
  authToken: null,
  authenticated: false,
  interests: [],
  gender: null,
  loading: true
}

const userReducer = (state = initialState, action) => {
  switch(action.type) {
    case "SET_USER":
      return {
        ...state,
        ...action.payload,
        authenticated: true,
        loading: false
      }
    case "SET_USER_DEFAULT":
      return {
        ...state,
        authenticated: false,
        loading: false
      }
    
    default:
      return state;
  }
}

export default combineReducers({
  user: userReducer
})
