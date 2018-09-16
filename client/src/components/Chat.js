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
          let { user } = message
          let sameUser = user._id === this.props.user._id
          
          return(<div key={i} className={sameUser ? 'chat-bubble right' : 'chat-bubble left'}>
            <div className={sameUser ? "d-flex w-100 justify-content-end" : "d-flex w-100 justify-content-between"}>
              <small>{user.name}</small>
            </div>
            <p className="mb-1">{message.text}</p>
          </div>)
        })}
      </div>
    );
  }
};

const mapStateToProps = state => ({
  user: state.user
})

export default connect(mapStateToProps)(Chat);