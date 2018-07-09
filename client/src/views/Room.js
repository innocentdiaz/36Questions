import React, {Component} from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';
import config from '../config';
import { connect } from 'react-redux';

class Room extends Component {
  componentWillReceiveProps(nextProps) {
    console.log(nextProps.user)
    if (!nextProps.user || nextProps.user === 'pending') return alert('You are not logged in');

    const parsed = queryString.parse(this.props.location.search);
    let roomID = parsed.id ? parsed.id : false;

    if (!roomID) {
      alert('No room id provided')
    } else {
      let socket = io(config.apiURL + '/rooms?id=' + roomID);
      socket.emit('join room', nextProps.user);

      socket.on('join success', () => this.setState({display: 'Joined room.'}));
      socket.on('begin', () => this.setState({display: 'Room is ready'}));
      socket.on('user disconnect', (name) => this.setState({display: name + ' has disconnected'}));
    }
  }
  constructor(props){
    super(props);

    this.state = {display: ''};
  };
  render(){
    return(
      <div className="container-fluid">
        <h1>Room</h1>
        <p>{this.state.display}</p>

      </div>
    );
  }
};

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(Room);
