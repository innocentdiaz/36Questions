import React, {Component} from 'react';
import {connect} from 'react-redux';
import Header from '../components/Header';
import io from 'socket.io-client'
import api from '../api';

let socket = io(api.getBaseURL() + '/matching');

class Match extends Component {
  componentDidUpdate() {
    let { user } = this.props;

    if (!user.authenticated) window.location = '/login';
  }
  subscribeToSearch() {
    let { user } = this.props;

    if (!user.authenticated) {
      return window.location = '/login'
    }
    console.log(user)
    socket.emit('subscribeToQue', user.authToken);
    
    socket.on('subscribe success', () => {
      this.setState({
        matching: true
      });
    });
    socket.on('que length', (que_length) => {
      let display = que_length > 1 ? `There are ${que_length-1} other users in the que.` : 'Waiting for users to join...'
      this.setState({ display })
    });
    socket.on('subscribe disconnect', () => {
      this.setState({
        display: 'Disconnected from matching',
        matching: false
      });
    });
    socket.on('match success', ({name, roomID}) => {
      alert('You have been matched with ' + name + '. Joining room.');
      window.location = '/room/' + roomID;
    });
    socket.on('disconnect', () => {
      this.setState({
        display: 'Disconnected from the matching',
        matching: false
      });
    });
    socket.on('invalid information', () => {
      this.setState({
        display: 'You have provided invalid information to the server',
        matching: false
      });
    });
  }
  constructor(props){
    super(props);

    this.state = {
      display: '',
      matching: false
    };
    this.subscribeToSearch = this.subscribeToSearch.bind(this);
  };
  render(){
    let { user } = this.props;
    let { matching, display } = this.state;

    return !user.authenticated ? <h1>You are not <a href="/login">logged in</a></h1> : (
      <div className="main">
        <Header />
        <div className="container-fluid flex align-items-center">
          <h1>Ready to match</h1>
          <p>{display}</p>
          {matching ? null : <button className="btn-main" onClick={this.subscribeToSearch}>Search for a match</button>}
        </div>
      </div>
    )
  }
};

const mapStateToProps = state => ({
  user: state.user
})

export default connect(mapStateToProps)(Match);
