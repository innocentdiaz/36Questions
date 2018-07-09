import React, {Component} from 'react';
import {connect} from 'react-redux';
import Header from '../components/Header';
import io from 'socket.io-client'
import config from '../config';

class Match extends Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.user === false) window.location = '/login';
  }
  subscribeToSearch() {
    let socket = io(config.apiURL + '/matching');
    socket.emit('subscribeToQue', this.props.user);
    socket.on('subscribe success', (que_length) => {
      this.setState({display: 'Joined matching. There are ' + que_length + ' users matching.'})
    });
    socket.on('que length', (que_length) => {
      this.setState({display: 'There are ' + que_length + ' user(s) in the que.'})
    })
    socket.on('subscribe disconnect', () => {
      this.setState({display: 'Failed matching'})
    });
    socket.on('match success', ({name, roomName}) => {
      alert('You have been matched with ' + name + '. Joining room.');
      window.location = '/room?id=' + roomName;
    });
    socket.on('disconnect', () => {
      this.setState({display: 'Disconnected from the matching'})
    });
    socket.on('invalid information', () => {
      this.setState({display: 'You have provided invalid information to the server'})
    })
  }
  constructor(props){
    super(props);

    this.state = {display: ''};
    this.subscribeToSearch = this.subscribeToSearch.bind(this);
  };
  render(){
    return !this.props.user || this.props.user === 'pending' ? <h1>You are not logged in</h1> : (
      <div className="main">
        <Header />
        <div className="container-fluid flex align-items-center">
          <h1>Ready to match</h1>
          <p>{this.state.display}</p>
          <button className="btn-main" onClick={this.subscribeToSearch}>Search for a match</button>
        </div>
      </div>
    )
  }
};

const mapStateToProps = state => ({
  user: state.user
})

export default connect(mapStateToProps)(Match);
