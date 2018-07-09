import React, {Component} from 'react';
import Header from '../components/Header';
import AnimatedWrapper from '../components/AnimatedWrapper';

class About extends Component {
  render(){
    return(
      <div className="main">
        <Header />
        <p>About 36 Questions</p>
      </div>
    );
  }
};

export default AnimatedWrapper(About);