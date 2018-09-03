import React, {Component} from 'react';
import {connect} from 'react-redux';
import Header from '../components/Header';
import io from 'socket.io-client'
import api from '../api';

class Match extends Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.user === false) window.location = '/login';
  }
  subscribeToSearch() {
    let socket = io(api.getBaseURL() + '/matching');
    socket.emit('subscribeToQue', this.props.user);
    
    socket.on('subscribe success', (que_length) => {
      this.setState({
        matching: true
      })
    });
    socket.on('que length', (que_length) => {
      let display = que_length > 1 ? `There are ${que_length-1} other users in the que.` : 'Waiting for users to join...'
      this.setState({ display })
    })
    socket.on('subscribe disconnect', () => {
      this.setState({display: 'Disconnected from matching', matching: false})
    });
    socket.on('match success', ({name, roomName}) => {
      alert('You have been matched with ' + name + '. Joining room.');
      window.location = '/room/' + roomName;
    });
    socket.on('disconnect', () => {
      this.setState({
        display: 'Disconnected from the matching',
        matching: false
      })
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
    return !this.props.user ? <h1>You are not logged in</h1> : (
      <div className="main">
        <Header />
        <div className="container-fluid flex align-items-center">
          <h1>Ready to match</h1>
          <p>{this.state.display}</p>
          {this.state.matching ? null : <button className="btn-main" onClick={this.subscribeToSearch}>Search for a match</button>}
        </div>
      </div>
    )
  }
};

const mapStateToProps = state => ({
  user: state.user
})

export default connect(mapStateToProps)(Match);
