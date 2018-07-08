import React, { Component } from 'react';
import openSocket from 'socket.io-client';
import Router from './components/Router';

class App extends Component {
  handleChange(event) {
    this.setState({gender: event.target.value});
  }
  handleSubmit() {
    let interests = []
    if (this.state.interestedInFemale) interests.push('female') 
    if (this.state.interestedInMale) interests.push('male') 

    if (interests.length < 1) return alert("Select an interest")

    const socket = openSocket('http://localhost:5000');

    openSocket.connect('http://localhost:5000')

    socket.emit('subscribeToQue', {name: this.state.name, interests, gender: this.state.gender});

    socket.on('match success', function(matchname){
      alert('You have been matched with ' + matchname + '!')
    })
  }
  constructor(props){
    super(props);
    this.state = {name: '', interestsedInMale: false, interestedInFemale: false, gender: 'male'};
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  };
  render() {
    return (
      <div className="main">
        <Router />
      </div>
    );
  }
}

export default App;
