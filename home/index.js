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

class PairSwitching extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      time: {},
      seconds: 5,
      secondsValue: '',
      switchedTurnCounter: 0,
      logIn: false,
      signUp: true,
      signedIn: false,
      emailValue: '',
      nameValue: '',
      slackNameValue: '',
      pairNameValue: '',
      usersArray: [],
      mappedPairsObject: {},
      timer: 0
    };

    this.startTimer = this.startTimer.bind(this);
    this.decidePair = this.decidePair.bind(this);
    this.countDown = this.countDown.bind(this);
    this.postToSlack = this.postToSlack.bind(this);
  };

   testfunc(){
     return new Promise((resolve, reject) => {
      resolve(this.retrieveUsers());
     })
   };

  componentDidMount = () => {
    if (document.cookie.length > 0){
      this.setState({ signedIn: true })
    }
    this.testfunc().then(() => {
      return this.mapPairs();
    }).then(() =>{
      let timeLeftVar = this.secondsToTime(this.state.secondsValue);
      return this.setState({ time: timeLeftVar });
    });
  };

  pullPairs = (query) => {
    return new Promise((resolve, reject) => {
        firebase.database().ref(query).on('value', resolve);
      })
  };


  getCookie = (cname) => {
      var name = cname + "=";
      var ca = document.cookie.split(';');
      for(var i = 0; i <ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0)==' ') {
              c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
              return c.substring(name.length,c.length);
          }
      }
      return "";
  }

  retrieveUsers = () => {
    return new Promise((resolve, reject) => {
      this.pullPairs('/pairs/').then((allUsers) => {
        let usersArray = Object.keys(allUsers.val()).map(function(key) {
          return allUsers.val()[key];
        });
        var cookieValue = document.cookie.split('=')[1];
        this.setState({usersArray: usersArray});
        for (var i = 0; i < usersArray.length; i++) {
          if (usersArray[i].useruid == cookieValue){
            let loggedInUser = usersArray[i];
            this.setState({loggedInUser: loggedInUser})
          };
        }
        resolve();
      })
    })
  };

  decidePair = () => {
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

  startTimer = (pairName) => {
    if (this.state.timer == 0) {
      this.setState({
        timer: this.state.secondsValue * 60
      })
      this.state.interval = setInterval(this.countDown, 1000);
    }
  };

  resetTimer = (pairName) => {
    let seconds = 5;
    this.setState({
      time: this.secondsToTime(seconds),
      seconds: seconds,
    });
  };

  countDown = () => {
    let seconds = this.state.timer - 1;
    this.setState({
      timer: this.state.timer - 1,
      time: this.secondsToTime(seconds),
      seconds: seconds,
    });
    if (seconds == 0) {
      clearInterval(this.state.interval);
      this.postToSlack();
    }
  };

  secondsToTime(secs){
    let hours = Math.floor(secs / (60 * 60));
    let divisorForMinutes = secs % (60 * 60);
    let minutes = Math.floor(divisorForMinutes / 60);
    let divisorForSeconds = divisorForMinutes % 60;
    let seconds = Math.ceil(divisorForSeconds);

    let obj = {
      "h": hours,
      "m": minutes,
      "s": seconds
    };
    return obj;
  }

  componentWillUnmount = () => {
    clearInterval(this.timer);
  };

  logOut = () => {
    document.cookie = "useruid=; expires=Thu, 01 Jan 2000 00:00:00 GMT";
    this.setState({ signUp: true })
    this.setState({ signedIn: false })
  };

  postToSlack = () => {
    this.setState({switchedTurnCounter: this.state.switchedTurnCounter + 1});
    console.log(this.state.switchedTurnCounter, 'turn counter **');
    let Slack = require('browser-node-slack');
    let name = this.state.loggedInUser.name;
    let pairName = this.state.pairNameValue;
    let slack = new Slack('https://hooks.slack.com/services/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');
    if (this.state.switchedTurnCounter % 2 == 0){
      slack.send({
        channel: "#rich-test-public",
        username: "pear-bot",
        icon_emoji: ":pear:",
        text: name + ' has started driving, enjoy the ride!'
      });
    }
    else {
      slack.send({
        channel: "#rich-test-public",
        username: "pear-bot",
        icon_emoji: ":pear:",
        text: pairName + ' has started driving, enjoy the ride!'
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
    let postData = {
      pairName: pairName
    };
    let newPostKey = firebase.database().ref().child('date').push().key;
    let updates = {};
    updates['pairs/' + useruid + '/'  + 'date' + '/'] = postData;
    firebase.database().ref().update(updates, function(data){
    });
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

  handleSeconds = (event) => {
    this.setState({secondsValue: event.target.value})
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
          logOut={this.logOut.bind(this)}
          handlePairNameChange={this.handlePairNameChange.bind(this)}
          handleSeconds={this.handleSeconds.bind(this)}
          secondsValue={this.state.secondsValue}
          nameValue={this.state.nameValue}
          slackNameValue={this.state.slackNameValue}
          emailValue={this.state.emailValue}
          pairNameValue={this.state.pairNameValue}
          mappedPairsObject={this.state.mappedPairsObject}
          secondsRemaining={this.state.secondsRemaining}
          time={this.state.time}
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
