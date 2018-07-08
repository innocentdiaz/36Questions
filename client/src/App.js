import React, { Component } from 'react';
import Router from './components/Router';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import reducers from './redux/reducers';

import { fetchUser } from './redux/actions/userActions';

const store = createStore(reducers, applyMiddleware(thunk))

class App extends Component {
  componentWillMount() {
    // Fetch user using token here if it is present
  }
  render() {
    return (
      <div className="main">
        <Provider store={store}>
          <Router />
        </Provider>
      </div>
    );
  }
}

export default App;
