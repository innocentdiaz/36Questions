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
  handleSubmit(event) {
    this.setState({display: 'Signing up'});
  
    event.preventDefault();

    let formData = new FormData(event.target);

    api.post('/users', formData)
    .then(res => {
      if (res.ok) {
        this.setState({display: 'Signed in!'})
        let { token } = res.data;

        store.set('TSQ_TOKEN', token);
        window.location = '/'
      } else {
        let display = res.data && res.data.message && res.data.message.length > 0 ? res.data.message : 'Failed to sign up!'
        this.setState({ display });
      }
    });
  }
  constructor(props){
    super(props);
    this.state = {
      display: ''
    };
    this.handleSubmit = this.handleSubmit.bind(this);
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
              <label>Profile picture</label>
              <input
                name="profilePicture"
                className="form-control"
                type="file"
                accept="image/*"
              />
            </div>
            <div className="form-group">
              <label>first name</label>
              <input name="firstName" className="form-control" placeholder="John" required/>
            </div>
            <div className="form-group">
              <label>last name</label>
              <input name="lastName" className="form-control" placeholder="Smith" required/>
            </div>
            <div className="form-group">
              <label>i am a</label>
              <select name="gender" className="form-control" required>
                <option value={0}>Male</option>
                <option value={1}>Female</option>
              </select>
            </div>
            <div className="form-group">
              <label>i am interested in</label>
              <select name="interests" className="form-control" required>
                <option value={0}>Men</option>
                <option value={1}>Women</option>
                <option value={2}>Both</option>
              </select>
            </div>
            <div className="form-group">
              <label>email</label>
              <input name="email" className="form-control" placeholder="me@email.com" required/>
            </div>
            <div className="form-group">
              <label>password</label>
              <input name="password" type="password" className="form-control" placeholder="******" required/>
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