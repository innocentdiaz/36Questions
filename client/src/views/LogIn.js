import React, {Component} from 'react';
import {connect} from 'react-redux';
import Header from '../components/Header';
import api from '../api';
import store from 'store';
import {setUser} from '../redux/actions/userActions';

class LogIn extends Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.user) window.location = '/';
  }
  handleSubmit(event) {
    this.setState({display: 'Logging in'});

    event.preventDefault();

    let {email, password} = this.state;

    api.post('/auth', { email, password })
    .then(res => {
      if (res.ok) {
        this.setState({display: 'Logged in!'})
        let { token } = res.data;

        store.set('TSQ_TOKEN', token)
        window.location = '/'
      } else {
        this.setState({display: res.data.message || 'Failed to log in'})
      }
    });
  }
  constructor(props){
    super(props);
    this.state = {email: '', password: '', display: ''};
    this.handleSubmit = this.handleSubmit.bind(this);
  };
  render(){
    return(
      <div className="main">
        <Header />
        <div className="container-fluid">
          <h1>Welcome Back</h1>
          <p>{this.state.display}</p>
          <form onSubmit={this.handleSubmit} encType="multipart/form-data">
            <div className="form-group">
              <label>email</label>
              <input value={this.state.email} onChange={(event) => this.setState({email: event.target.value})} name="email" className="form-control" placeholder="me@email.com" required/>
            </div>
            <div className="form-group">
              <label>password</label>
              <input value={this.state.password} onChange={(event) => this.setState({password: event.target.value})} name="password" type="password" className="form-control" placeholder="******" required/>
            </div>
            <button className="btn-main">Log in</button>
          </form>
        </div>
      </div>
    );
  }
};

const mapStateToProps = state => ({
  user: state.user
})

export default connect(mapStateToProps, {setUser})(LogIn);