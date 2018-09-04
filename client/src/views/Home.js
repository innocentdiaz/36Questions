import React, {Component} from 'react';
import { Parallax, ParallaxLayer } from 'react-spring'
import Header from '../components/Header';
import {connect} from 'react-redux'
import '../assets/stylesheets/home.css';

class Home extends Component {
  render(){
    let { user } = this.props;
    
    return(
      <Parallax pages={2}>
        <ParallaxLayer offset={0} speed={0.5}>
          <Header />
        </ParallaxLayer>
        <ParallaxLayer offset={0.4} speed={0.1}>
          {user ? <div className="home-screen">
            <h1>Welcome, {user.firstName}.</h1>
            <hr/>
            <button className="btn-main" onClick={() => window.location='/match'}>GET MATCHED</button>
          </div> : <div className="home-screen">
            <h1>Fall in love in 36 questions</h1>
            <hr/>
            <hr/>
            <button className="btn-main" onClick={() => window.location='/signup'}>GET STARTED</button>
          </div>}
        </ParallaxLayer>
      </Parallax>
    );
  }
};

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(Home);
