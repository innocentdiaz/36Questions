import React, {Component} from 'react';
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
  bindSocket() {
    this.setState({bindedSocket: true})
    let { socket } = this.state;
    socket.emit('join room', this.props.user);

    socket.on('joined', ({res, message}) => {
      if (!res) {
        alert(message)
      }

      this.setState({ joined: res });
    });
    socket.on('isActive', isActive => {
      this.setState({ isActive });
      turnSound.play();
    });
    socket.on('user disconnected', name => {
      leaveSound.play();

      this.setState({display: name + ' was disconnected... Waiting for users...'})
    });
    socket.on('display', (message) => {
      this.setState({display: message})
    });
    this.state.socket.on('message', (message) => {
      messageSound.play()
      this.setState({messages: [...this.state.messages, message]});
    });
    socket.on('set speech', condition => {
      this.setState({canTalk: condition})
    });
  }
  componentDidMount() {
    const { roomID } = this.props.match.params

    if (!roomID) return window.location = '/'
    this.setState({socket: io(api.getBaseURL() + '/rooms?id=' + roomID)});
  }
  componentDidUpdate() {
    if (this.state.bindedSocket) return
    if (!this.props.user) return
    if (!this.state.socket) return

    this.bindSocket()
  };
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
          <p><i className="fas fa-spinner"></i> Paitiently joining...</p>
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

          <ul className="chat list-group">
            {this.state.messages.map((message, i) => {
              return(<li key={i} className={message.sender === this.props.user.firstName ? 'list-group-item text-right' : 'list-group-item text-left'}>
                <div className={message.sender === this.props.user.firstName ? "d-flex w-100 justify-content-end" : "d-flex w-100 justify-content-between"}>
                  <small>{message.sender}</small>
                </div>
                <p className="mb-1">{message.content}</p>
              </li>)
            })}

          </ul>
          <form className="input-group form-group" onSubmit={this.handleSubmit}>
            <input className="form-control" disabled={!this.state.canTalk} readOnly={!this.state.canTalk} value={this.state.message} onChange={event => this.setState({message: event.target.value})} placeholder="Type a message here" />
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
