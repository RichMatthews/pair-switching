import React from 'react';

export default class SigninPage extends React.Component{
  render() {
    return (
      <div>
        <button type="button" onClick={this.props.signup}>Sign Up</button>
        <button type="button" onClick={this.props.login}>Log In</button>
        <div id="container">
          <h1> Log In </h1>
          <form onSubmit={this.props.handleClick}>
            <p><input type="email" id="email"  value={this.props.emailValue} onChange={this.props.handleEmailChange}placeholder="email"/></p>
            <p><input type="password" id="password"  value={this.props.password} onChange={this.props.handlePasswordChange}placeholder="password" required/></p>
          </form>
          <p><input type="submit" value="Log in" onClick={this.props.logUserIn}/></p>
        </div>
      </div>
    )
  }
}
