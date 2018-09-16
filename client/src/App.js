import React, { Component } from 'react';
import store from 'store';
import Router from './components/Router';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import reducers from './redux/reducers';

import { fetchUser } from './redux/actions/userActions';

const redux_store = createStore(reducers, applyMiddleware(thunk))

class App extends Component {
  componentWillMount() {
    let jwt = store.get('TSQ_TOKEN');
  
    if (!!jwt) {
      redux_store.dispatch(fetchUser(jwt));
    }
  }
  render() {
    return (
      <Provider store={redux_store}>
        <Router />
      </Provider>
    );
  }
}

export default App;
