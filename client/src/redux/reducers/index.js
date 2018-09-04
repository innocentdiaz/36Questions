import { combineReducers } from 'redux';

const defaultUser = {
 firstName: 'user',
 isDefault: true
}

const userReducer = (state = defaultUser, action) => {
  switch(action.type) {
    case "SET_USER":
      return {...action.payload, loading: false}

    default:
      return {...state, loading: true};
  }
}

export default combineReducers({
  user: userReducer
})
