import React, {Component} from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';
import config from '../config';
import { connect } from 'react-redux';
import '../assets/stylesheets/chat.css';
import messageAudio from '../assets/audio/message.mp3';
import turnAudio from '../assets/audio/turn.mp3';
let messageSound = new Audio(messageAudio);
let turnSound = new Audio(turnAudio);

class Room extends Component {
  handleSubmit(event) {
    event.preventDefault();

    this.state.socket.emit('message', this.state.message);
    this.setState({message: ''});
  }
  onReady() {
    // We are ready to start the game
    let btn = document.getElementById('on-ready');
    btn.className += ' fade-out';

    // Let the socket know this user is ready to begin!
    this.state.socket.emit('ready');
  }
  bindSocket() {
    this.setState({bindedSocket: true})
    let { socket } = this.state;
    socket.emit('join room', this.props.user);

    socket.on('isActive', isActive => {
      turnSound.play()
      this.setState({ isActive })
    });
    socket.on('user disconnected', name => {
      alert(name + ' has disconnected')
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
    const parsed = queryString.parse(this.props.location.search);
    let roomID = parsed.id ? parsed.id : false;

    if (!roomID) return window.location = '/'
    this.setState({socket: io(config.apiURL + '/rooms?id=' + roomID)});
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
      canTalk: true,
      isActive: false
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.bindSocket = this.bindSocket.bind(this);

    this.onReady = this.onReady.bind(this)
  };
  render(){
    return(
      <div className="chat-container">
        <div className="container-fluid">
          <div>
            <h1>36 Questions</h1>
            <p>{this.state.display}</p>
          </div>
          <button className="btn btn-light" id="on-ready" onClick={this.onReady}>
            Ready to play
          </button>
          { this.state.isActive ? 
            <button className="btn btn-light on-done" disabled={!this.state.isActive} onClick={() => this.state.socket.emit('done')}>
              Done answering!
            </button>
            : null
          } 
          

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
