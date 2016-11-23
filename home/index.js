import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
require('es6-promise').polyfill();
require('isomorphic-fetch');

class PairSwitching extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      secondsRemaining: 10
    };
    this.timer = this.timer.bind(this);
  }

  componentDidMount(){

  };

  startTimer(){
    let interval = setInterval(this.timer, 1000);
    this.setState({ secondsRemaining: this.state.secondsRemaining })
    this.setState({ interval: interval });
  };

  componentWillUnmount() {
    clearInterval(this.state.interval);
  };

  timer = () => {
    if (this.state.secondsRemaining >0){
      this.setState({ secondsRemaining: this.state.secondsRemaining -1 });
    }
    else {
      clearInterval(this.state.interval);
      //this.postToSlack();
    }
  };

  postToSlack(){
    let Slack = require('browser-node-slack');
    let slackName = 'Rich Matthews';
    let pairSlackName = 'Rob Jones';
    let slack = new Slack('https://hooks.slack.com/services/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');
    slack.send({
      channel: "#rich-test-public",
      username: "pear-bot",
      icon_emoji: ":pear:",
      text: slackName + ' has started driving, enjoy the ride!'
    });
  };

  render(){
    return (
      <div>
        <h1> Pair Switching </h1>
        <div>
          <form>
            <p><input type="text" id="name" placeholder="your slack name" /></p>
            <p><input type="text" id="pairName" placeholder="your pairs slack name" /></p>
            <p><input type="text" id="pairName" placeholder="driving time (mins)" /></p>
          </form>
          <p><input type="submit" value="Start Timer!" onClick={this.startTimer}/></p>
          <div> Seconds remaining : {this.state.secondsRemaining} </div>
        </div>
      </div>
    )
  };
};


  ReactDOM.render(
    <PairSwitching />, document.getElementById('content')
  );
