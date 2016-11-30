import React from 'react';

export default class SigninPage extends React.Component{
  render() {
    return (
      <div>
        <button type="button" onClick={this.props.signup}>Sign Up</button>
        <button type="button" onClick={this.props.login}>Log In</button>
        <div id="container">
          <h1> Sign Up </h1>
          <form>
            <p><input type="text" id="name" value={this.props.nameValue} onChange={this.props.handleNameChange} placeholder="name" required/></p>
            <p><input type="text" id="slackName" value={this.props.slackNameValue} onChange={this.props.handleSlackNameChange} placeholder="slack name"/></p>
            <p><input type="email" id="email" value={this.props.emailValue} onChange={this.props.handleEmailChange} placeholder="email"/></p>
            <p><input type="password" id="password" value={this.props.passwordValue} onChange={this.props.handlePasswordChange} placeholder="password"/></p>
          </form>
          <p><input type="submit" value="Sign up" onClick={this.props.signUserUp}/></p>
        </div>
      </div>
    )
  }
}
