import { combineReducers } from 'redux';

const userReducer = (state = {}, action) => {
  switch(action.type) {
    case "SET_USER":
    console.log(action.payload)
      return {...action.payload, loading: false}
    break;

    default:
      return {...state, loading: true};
  }
}

export default combineReducers({
  user: userReducer
})