import React, { Component } from 'react';
import Router from './components/Router';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import reducers from './redux/reducers';

class App extends Component {
  render() {
    return (
      <div className="main">
        <Provider store={createStore(reducers)}>
          <Router />
        </Provider>
      </div>
    );
  }
}

export default App;
