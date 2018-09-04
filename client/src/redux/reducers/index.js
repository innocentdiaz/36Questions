import { combineReducers } from 'redux';

const userReducer = (state = null, action) => {
  switch(action.type) {
    case "SET_USER":
      return {...action.payload, loading: false}

    default:
      return state;
  }
}

export default combineReducers({
  user: userReducer
})
