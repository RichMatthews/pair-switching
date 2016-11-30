import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
let firebase = require('firebase');
import { rootRef, firebase_init, storage } from '../firebase/firebase_config.js';
import SignUp from '../signup/index';
import LogIn from '../login/index';
import SignedIn from '../signedin/index';
require('es6-promise').polyfill();
require('isomorphic-fetch');
let turnCounter = 0;

class PairSwitching extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      secondsRemaining: 10,
      switchedTurnCounter: 0,
      logIn: false,
      signUp: true,
      signedIn: false,
      emailValue: '',
      nameValue: '',
      slackNameValue: '',
      pairNameValue: '',
      usersArray: [],
      mappedPairsObject: [],
    };
    this.startTimer = this.startTimer.bind(this);
    this.decidePair = this.decidePair.bind(this);
  }

  pullPairs = (query) => {
    return new Promise((resolve, reject) => {
        firebase.database().ref(query).on('value', resolve);
      })
  };

  retrieveUsers = () => {
    return new Promise((resolve, reject) => {
      this.pullPairs('/pairs/').then((allUsers) => {
        let usersArray = Object.keys(allUsers.val()).map(function(key) {
          return allUsers.val()[key];
        });
        this.setState({usersArray: usersArray});
        let cookie_value = document.cookie.split('=')[1];
        for (var i = 0; i < this.state.usersArray.length; i++) {
          if (this.state.usersArray[i].useruid == cookie_value){
            let loggedInUser = this.state.usersArray[i];
            this.setState({loggedInUser: loggedInUser})
          };
        }
        resolve();
      })
    })
  };


  testfunc(){
    return new Promise((resolve, reject) => {
      resolve(this.retrieveUsers());
    })
  };

  decidePair = () => {
    let interval = setInterval(this.timer, 1000);
    let name = this.state.nameValue;
    let slackName = this.state.slackNameValue;
    let email = this.state.emailValue;
    let password = this.state.passwordValue;
    let pairName = this.state.pairNameValue;
    this.testfunc().then(() => {
      return this.submitPairToDatabase(this.state.loggedInUser.useruid, pairName)
    }).then(() => {
      return this.retrieveUsers();
    }).then(() =>{
      return this.mapPairs();
    });
  };

  startTimer = () => {
    this.setState({ secondsRemaining: this.state.secondsRemaining })
    this.setState({ interval: interval });
  };

  componentDidMount = () => {
    this.retrieveUsers();
  };

  componentWillUnmount = () => {
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

  resetTimer = () => {
    this.setState({ secondsRemaining: 10 });
  };

  postToSlack = () => {
    this.setState({switchedTurnCounter: this.state.switchedTurnCounter + 1});
    turnCounter += 1;
    let Slack = require('browser-node-slack');
    let slackName = this.state.nameValue;
    let pairSlackName = this.state.pairNameValue;
    let slack = new Slack('https://hooks.slack.com/services/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');
    if (turnCounter % 2 == 0){
      slack.send({
        channel: "#rich-test-public",
        username: "pear-bot",
        icon_emoji: ":pear:",
        text: slackName + ' has started driving, enjoy the ride!'
      });
    }
    else {
      slack.send({
        channel: "#rich-test-public",
        username: "pear-bot",
        icon_emoji: ":pear:",
        text: pairSlackName + ' has started driving, enjoy the ride!'
      });
    }
  };

  today(){
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth()+1;
    let yyyy = today.getFullYear();

    if(dd<10) {
        dd='0'+dd
    }
    if(mm<10) {
        mm='0'+mm
    }
    today = mm+'-'+dd+'-'+yyyy;
    return today;
  };

  submitPairToDatabase = (useruid, pairName) => {
    return new Promise((resolve, reject) => {
      let postData = {
        pairName: pairName
      };
      let newPostKey = firebase.database().ref().child('date').push().key;
      let updates = {};
      updates['pairs/' + useruid + '/'  + 'date' + '/'] = postData;
      firebase.database().ref().update(updates, function(data){
        resolve();
      });
    })
  };

  mapPairs = () => {
    return new Promise((resolve, reject) => {
      let mappedPairsObject = this.state.usersArray.map(function(user) {
        return {
          name: user.name,
          pairName: user.date.pairName
        }
      });
      this.setState({mappedPairsObject: mappedPairsObject})
      resolve();
    })
  };

  handleLogin = (event) => {
    this.setState({ logIn: true });
    this.setState({ signUp: false });
    event.preventDefault();
  };

  handleSignup(event) {
    this.setState({ logIn: false });
    this.setState({ signUp: true });
    event.preventDefault();
  };

  handleNameChange = (event) => {
    this.setState({nameValue: event.target.value})
  };

  handleSlackNameChange = (event) => {
    this.setState({slackNameValue: event.target.value})
  };

  handleEmailChange = (event) => {
    this.setState({emailValue: event.target.value})
  };

  handlePasswordChange = (event) => {
    this.setState({passwordValue: event.target.value})
  };

  handlePairNameChange = (event) => {
    this.setState({pairNameValue: event.target.value})
  };

  signUserUp = () => {
    let name = this.state.nameValue;
    let slackName = this.state.slackNameValue;
    let email = this.state.emailValue;
    let password = this.state.passwordValue;
      firebase.auth().createUserWithEmailAndPassword(email, password).then(
        function(result){
          document.cookie = "useruid=" + result.uid + ";";
          this.writeUserData(name, result.uid, email, slackName);
        }.bind(this),
        function(error){
          let errorCode = error.code;
          let errorMessage = error.message;
        }
      );
     this.setState({signedIn: true})
    };

    storeUseruid = (useruid) => {
      return this.useruid = useruid;
    };

    writeUserData = (name, useruid, email, slackName) => {
      firebase.database().ref('/pairs/' + useruid).set({
        name: name,
        useruid: useruid,
        email: email,
        slackName: slackName
      });
    };

    logUserIn = () => {
      let email = this.state.emailValue;
      let password = this.state.passwordValue;
      firebase.auth().signInWithEmailAndPassword(email, password).then(
        function(result) {
          document.cookie = "useruid=" + result.uid + ";";
          this.setState({signedIn: true})
        }.bind(this),
        function(error) {
          if (error) {
          var errorCode = error.code;
          var errorMessage = error.message;
        }
      });
  };

  render(){
    return (
      <div>
      {this.state.signedIn
        ?
        <SignedIn
          startTimer={this.startTimer.bind(this)}
          decidePair={this.decidePair.bind(this)}
          resetTimer={this.resetTimer.bind(this)}
          handlePairNameChange={this.handlePairNameChange.bind(this)}
          nameValue={this.state.nameValue}
          slackNameValue={this.state.slackNameValue}
          emailValue={this.state.emailValue}
          pairNameValue={this.state.pairNameValue}
          mappedPairsObject={this.state.mappedPairsObject}
          secondsRemaining={this.state.secondsRemaining}
        />
        :
        <div>
          {this.state.signUp
            ?
            <SignUp
              signUserUp={this.signUserUp.bind(this)}
              signup={this.handleSignup.bind(this)}
              login={this.handleLogin.bind(this)}
              handleNameChange={this.handleNameChange.bind(this)}
              handleSlackNameChange={this.handleSlackNameChange.bind(this)}
              handleEmailChange={this.handleEmailChange.bind(this)}
              handlePasswordChange={this.handlePasswordChange.bind(this)}
              nameValue={this.state.nameValue}
              slackNameValue={this.state.slackNameValue}
              emailValue={this.state.emailValue}
            />
            :
            <LogIn
              signup={this.handleSignup.bind(this)}
              login={this.handleLogin.bind(this)}
              logUserIn={this.logUserIn.bind(this)}
              handleEmailChange={this.handleEmailChange.bind(this)}
              handlePasswordChange={this.handlePasswordChange.bind(this)}
              slackNameValue={this.state.slackNameValue}
            />
          }
        </div>
      }
      </div>
    )
  };
};


  ReactDOM.render(
    <PairSwitching />, document.getElementById('content')
  );
