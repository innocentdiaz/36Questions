import React, { Component } from 'react';
import { connect } from 'react-redux';

class Chat extends Component {
  componentDidUpdate() {
    let chat = document.getElementsByClassName('chat')[0];
    chat.scrollTop = chat.scrollHeight
  }
  render(){
    return(
      <div className="chat">
        {this.props.data.map((message, i) => {
          return(<li key={i} className={message.sender === this.props.user.firstName ? 'list-group-item text-right' : 'list-group-item text-left'}>
            <div className={message.sender === this.props.user.firstName ? "d-flex w-100 justify-content-end" : "d-flex w-100 justify-content-between"}>
              <small>{message.sender}</small>
            </div>
            <p className="mb-1">{message.content}</p>
          </li>)
        })}
      </div>
    );
  }
};

const mapStateToProps = state => ({
  user: state.user
})

export default connect(mapStateToProps)(Chat);