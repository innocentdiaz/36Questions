import React, { Component } from 'react';

class TypeWriter extends Component {
  constructor(props){
    super(props);
    this.state = {
      display: '',
      typing: Function
    }
  };
  componentWillUnmount(){
      clearInterval(this.state.typing);
  }
  componentDidUpdate(prevProps){
    if (this.props.text === prevProps.text) {
      return
    }
    this.setState({display: ''});
    clearInterval(this.state.typing);
    let i = 0;

    let { text } = this.props;
    let self = this;
    this.setState({
      typing: setInterval(function(){
        let display = self.state.display + text.charAt(i);

        self.setState({display});
        i++
        if(i >= text.length){
          clearInterval(self.state.typing);
        }
    }, 25)})
  }
  render(){
    return(
      <span>{this.state.display}</span>
    );
  }
};

export default TypeWriter