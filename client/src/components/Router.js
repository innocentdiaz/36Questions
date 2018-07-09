import React, {Component} from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import Home from '../views/Home';
import About from '../views/About';
import Match from '../views/Match';
import SignUp from '../views/SignUp';
import LogIn from '../views/LogIn';
import Room from '../views/Room';

class Router extends Component {
  render(){
    return(
      <BrowserRouter>
        <div>
          <Route exact path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/match" component={Match} />
          <Route path="/signup" component={SignUp} />
          <Route path="/login" component={LogIn} />
          <Route path="/room" component={Room} />
        </div>
      </BrowserRouter>
    );
  }
};

export default Router;
