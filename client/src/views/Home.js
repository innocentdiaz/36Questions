import React, {Component} from 'react';
import Header from '../components/Header';
import {connect} from 'react-redux'

class Home extends Component {
  componentDidMount() {
    
  }
  render(){
    return(
      <div className="main">
        <Header />
        {this.props.user && this.props.user !== 'pending' ? <div className="home-screen">
          <h1>Welcome, {this.props.user.firstName}.</h1>
          <hr/>
          <button className="btn-main" onClick={() => window.location='/match'}>GET MATCHED</button>
        </div> : <div className="home-screen">
          <h1>Fall in love in 36 questions</h1>
          <hr/>
          <p></p>
          <hr/>
          <button className="btn-main" onClick={() => window.location='/signup'}>GET STARTED</button>
        </div>}
      </div>
    );
  }
};

const mapStateToProps = state => ({
  user: state.user
})

export default connect(mapStateToProps)(Home);