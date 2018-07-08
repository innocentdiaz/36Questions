import React, {Component} from 'react';

class Header extends Component {
  render(){
    return(
      <div className="header-main">
        <a className="title" href="/"><span id="number">36</span><span id="text">QUESTIONS</span></a>
        <a>Account</a>
      </div>
    );
  }
};

export default Header;