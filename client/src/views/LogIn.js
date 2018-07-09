import React, {Component} from 'react';
import {connect} from 'react-redux';
import Header from '../components/Header';
import Axios from '../../node_modules/axios';
import config from '../config';
import {setUser} from '../redux/actions/userActions';

class LogIn extends Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.user && nextProps.user !== 'pending') window.location = '/';
  }
  handleSubmit(event) {
    this.setState({display: 'Logging in'});

    event.preventDefault();

    let {email, password} = this.state;

    Axios.post(config.apiURL + '/api/auth', {email, password})
    .then(res => {
      this.setState({display: 'Logged in!'})
      let { user, token } = res.data;

      localStorage.setItem('36QUESTIONS_TOKEN', token);
      this.props.setUser(user);
    })
    .catch(err => {
      this.setState({display: err.response.data.message || 'Failed to log in'})
    })
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