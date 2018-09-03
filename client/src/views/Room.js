import React, {Component} from 'react';
import Chat from '../components/Chat';
import io from 'socket.io-client';
import api from '../api';
import { connect } from 'react-redux';
import '../assets/stylesheets/chat.css';
import messageAudio from '../assets/audio/message.mp3';
import turnAudio from '../assets/audio/turn.mp3';
import leaveAudio from '../assets/audio/leave.mp3';

let messageSound = new Audio(messageAudio);
let turnSound = new Audio(turnAudio);
let leaveSound = new Audio(leaveAudio);

class Room extends Component {
  handleSubmit(event) {
    event.preventDefault();

    this.state.socket.emit('message', this.state.message);
    this.setState({message: ''});
  }
  doneAnswering() {
    this.setState({ isActive: null }); // loading
    this.state.socket.emit('done'); // let the server know we are done answering
  }
  onReady() {
    // We are ready to start the game
    let btn = document.getElementById('on-ready');
    btn.className += ' hidden';

    // Let the socket know this user is ready to begin!
    this.state.socket.emit('ready');
  }
  bindSocket(socket) {
    this.setState({ bindedSocket: true })

    socket.emit('join room', this.props.user); // let socket know we want to join

    socket.on('joined', ({res, message}) => {
      if (!res) {
        alert(message)
      }

      this.setState({ joined: res });
    });
    socket.on('isActive', isActive => {
      turnSound.play();
      this.setState({ isActive });
    });
    socket.on('user disconnected', name => {
      leaveSound.play();

      this.setState({display: name + ' was disconnected... Waiting for users...'})
    });
    socket.on('display', (message) => {
      this.setState({display: message})
    });
    socket.on('message', (message) => {
      messageSound.play()
      this.setState({messages: [...this.state.messages, message]});
    });
  }
  componentDidMount() {
    const { roomID } = this.props.match.params
    let socket = io(api.getBaseURL() + '/rooms?id=' + roomID)

    if (!roomID) return window.location = '/'
    this.setState({socket});
  }
  componentDidUpdate() { // wait till we get the user and socket
    let { user } = this.props;
    let { bindedSocket, socket } = this.state;

    if (user.loading) return
    if (bindedSocket) return
    if (!socket) return

    this.bindSocket(socket);
  }
  constructor(props){
    super(props);

    this.state = {
      display: '',
      messages: [],
      message: '',
      socket: null,
      joined: null,
      isActive: false
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.bindSocket = this.bindSocket.bind(this);
    this.onReady = this.onReady.bind(this);
    this.doneAnswering = this.doneAnswering.bind(this)
  };
  render(){
    let { isActive, joined } = this.state;

    if (joined === null) {
      return (<div className="container-fluid">
        <div className="container">
          <p><i className="fas fa-spinner"></i> Patiently joining...</p>
        </div>
      </div>)
    }
    if (joined === false) {
      return <p>Could not join room</p>
    }
    return(
      <div className="chat-container">
        <div className="container-fluid">
          <div>
            <h1>36 Questions</h1>
            <p>{this.state.display}</p>
          </div>
          <button className={'btn btn-light on-done ' + (isActive === false ? 'hidden' : isActive === true ? '' : 'loading')} disabled={!isActive} onClick={this.doneAnswering}>
            {isActive === null ? <i class="fas fa-spinner"></i> : null} Done answering!
          </button>
          <button className="btn btn-light" id="on-ready" onClick={this.onReady}>
            Ready to play
          </button>
          <Chat data={this.state.messages}/>
          <form className="input-group form-group" onSubmit={this.handleSubmit}>
            <input className="form-control" value={this.state.message} onChange={event => this.setState({message: event.target.value})} placeholder="Type a message here" />
            <button className="btn btn-light">Send</button>
          </form>
        </div>

      </div>
    );
  }
};

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(Room);
