import React, {Component} from 'react';
import {connect} from 'react-redux';

class Match extends Component {
  render(){
    return !this.props.user || this.props.user === 'pending' ? <h1>You are not logged in</h1> : <h1>Ready to match</h1>
  }
};

const mapStateToProps = state => ({
  user: state.user
})

export default connect(mapStateToProps)(Match);