import React, {Component} from 'react';
import {connect} from 'react-redux';
import Header from '../components/Header';
import store from 'store';
import api from '../api';
import {setUser} from '../redux/actions/userActions';

class SignUp extends Component {
  componentDidUpdate() {
    let { user } = this.props;
    if (user.authenticated) window.location = '/';
  }
  handleSelect(key, event) {
    if (key === 'gender') {
      this.setState({[key]: event.target.value});
    } else {
      let options = event.target.options;
      let value = [];

      for (var i = 0, l = options.length; i < l; i++) {
        if (options[i].selected) {
          value.push(options[i].value);
        }
      }
      this.setState({interests: value})
    }
  }
  handleSubmit(event) {
    this.setState({display: 'Signing up'});
    
    event.preventDefault();

    let {firstName, lastName, interests, gender, email, password} = this.state;

    api.post('/users', {
      email,
      password,
      firstName,
      lastName,
      interests,
      gender
    })
    .then(res => {
      if (res.ok) {
        this.setState({display: 'Signed in!'})
        let { token } = res.data;

        store.set('TSQ_TOKEN', token);
        window.location = '/'
      } else {
        this.setState({display: res.data.message || 'Failed to sign up'})
      }
    });
  }
  constructor(props){
    super(props);
    this.state = {firstName: '', lastName: '', interests: ['female'], gender: 'male', email: '', password: '', display: ''};
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  };
  render(){
    return(
      <div className="main">
        <Header />
        <div className="container-fluid">
          <h1>Welcome!</h1>
          <p>{this.state.display}</p>
          <form onSubmit={this.handleSubmit} encType="multipart/form-data">
            <div className="form-group">
              <label>first name</label>
              <input value={this.state.firstName} onChange={(event) => this.setState({firstName: event.target.value})} name="firstName" className="form-control" placeholder="John" required/>
            </div>
            <div className="form-group">
              <label>last name</label>
              <input value={this.state.lastName} onChange={(event) => this.setState({lastName: event.target.value})} name="lastName" className="form-control" placeholder="Smith" required/>
            </div>
            <div className="form-group">
              <label>i am a</label>
              <select value={this.state.gender} onChange={event => this.handleSelect('gender', event)} className="form-control">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="form-group">
              <label>i am interested in {this.state.interests.join(' and ')}. (Can select multiple)</label>
              <select className="form-control" multiple value={this.state.interests} onChange={event => this.handleSelect('interests', event)}>
                <option value="male">Men</option>
                <option value="female">Women</option>
                {/*Or we could do a "Both" option but that would be cheating lol*/}
              </select>
            </div>
            <div className="form-group">
              <label>email</label>
              <input value={this.state.email} onChange={(event) => this.setState({email: event.target.value})} name="email" className="form-control" placeholder="me@email.com" required/>
            </div>
            <div className="form-group">
              <label>password</label>
              <input value={this.state.password} onChange={(event) => this.setState({password: event.target.value})} name="password" type="password" className="form-control" placeholder="******" required/>
            </div>

            <button className="btn-main">Sign up</button>
          </form>
        </div>
      </div>
    );
  }
};

const mapStateToProps = state => ({
  user: state.user
})

export default connect(mapStateToProps, {setUser})(SignUp);