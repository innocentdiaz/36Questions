import React, {Component} from 'react';
import {connect} from 'react-redux';
import '../assets/stylesheets/header.css';

class Header extends Component {
  render(){
    return(
      <div className="header-main">
        <a className="title" href="/"><span id="number">36</span><span id="text">QUESTIONS</span></a>
        {
          this.props.user !== 'pending' ? this.props.user ? <a href='account'>Account</a> : <a href='login'>Log in</a> : null
        }
      </div>
    );
  }
};

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(Header);
