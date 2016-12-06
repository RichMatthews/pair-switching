import React from 'react';
import './index.scss';

export default class SigninPage extends React.Component{
  render() {
    return (
      <div>
        <h1> Who are you pairing with? </h1>
        <p><input type="text" className="inputs" id="pairName" value={this.props.pairNameValue} onChange={this.props.handlePairNameChange} placeholder="your pairs slack name" /></p>
        <p><input type="text" className="inputs" id="drivingTime" value={this.props.secondsValue} onChange={this.props.handleSeconds}placeholder="driving time (mins)" /></p>
        <p><input type="submit" id="confirmButton" value="Confirm Pairing" onClick={this.props.decidePair}/></p>
        <div id="pairsTable">
          {
            this.props.mappedPairsObject.length
            ? this.props.mappedPairsObject.map(function(num, index){
              return <div id="pairsRows" key={ index }>Name: {num.name} Pair Name: {num.pairName}
              </div>;
            }, this)
            : <span>No one is currently pairing</span>
          }
          <input type="submit" value="Start Timer!" id="buttons" onClick={() => this.props.startTimer()}/>
          <input type="submit" value="Reset Timer" id="buttons" onClick={() => this.props.resetTimer()}/>
          <br />
        </div>
        Time Remaining: {this.props.time.m}:{this.props.time.s}
        <p><input type="submit" id="logOutButton" value="Log out" onClick={this.props.logOut}/></p>
      </div>
    )
  }
}
