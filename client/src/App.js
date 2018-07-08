import React, { Component } from 'react';
import './App.css';
import openSocket from 'socket.io-client';


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
      <div className="App">
        <label>Name</label>
        <input value={this.state.name} onChange={(event) => this.setState({name: event.target.value})} />
        <br />
        <label>Interests</label>
        <hr/>
        <label>Female</label>
        <input type="radio" value={this.state.interestedInFemale} onChange={(interestedInFemale) => this.setState({interestedInFemale})} />
        <label>Male</label>
        <input type="radio" value={this.state.interestedInMale} onChange={(interestedInMale) => this.setState({interestedInMale})} />
        <br/>
        <label>Gender</label>
        <hr />
        <select value={this.state.gender} onChange={this.handleChange}>
          <option vale="male">Male</option>
          <option vale="female">Female</option>
        </select>
        <button onClick={this.handleSubmit}>Join search</button>
      </div>
    );
  }
}

export default App;
