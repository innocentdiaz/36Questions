import React, {Component} from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';
import config from '../config';
import { connect } from 'react-redux';
import '../assets/stylesheets/chat.css';

class Room extends Component {
  handleSubmit() {
    this.state.socket.emit('message', this.state.message);
    this.setState({message: ''});
  }
  bindSocket() {
    this.setState({bindedSocket: true})
    let {socket} = this.state;
    socket.emit('join room', this.props.user);

    socket.on('user disconnect', (name) => this.setState({display: name + ' has disconnected'}));
    socket.on('display', (message) => {
      this.setState({display: message})
    });
    this.state.socket.on('message', (message) => {
      console.log(message)
      this.setState({messages: [...this.state.messages, message]});
    });
    socket.on('set speech', condition => {
      this.setState({canTalk: condition})
    });
  }
  componentDidMount() {
    const parsed = queryString.parse(this.props.location.search);
    let roomID = parsed.id ? parsed.id : false;

    this.setState({socket: io(config.apiURL + '/rooms?id=' + roomID)});
  }
  componentDidUpdate() {
    if (this.state.bindedSocket) return
    if (!this.props.user || this.props.user === 'pending') return
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
      canTalk: true
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.bindSocket = this.bindSocket.bind(this);
  };
  render(){
    return(
      <div className="chat-container">
        <div className="container-fluid">
          <div>
            <h1>36 Questions</h1>
            <p>{this.state.display}</p>
          </div>

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
        </div>
        <div className="input-group form-group">
          <input className="form-control" disabled={!this.state.canTalk} readOnly={!this.state.canTalk} value={this.state.message} onChange={event => this.setState({message: event.target.value})} placeholder="Type a message here" />
          <button className="btn btn-light" onClick={this.handleSubmit}>Send</button>
        </div>
      </div>
    );
  }
};

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(Room);
