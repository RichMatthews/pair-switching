import React from 'react';

export default class SigninPage extends React.Component{
  render() {
    return (
      <div>
        <p> Who are you pairing with? </p>
        <p><input type="text" id="pairName" value={this.props.pairNameValue} onChange={this.props.handlePairNameChange} placeholder="your pairs slack name" /></p>
        <p><input type="text" id="drivingTime" placeholder="driving time (mins)" /></p>
        <p><input type="submit" value="Confirm Pairing" onClick={this.props.decidePair}/></p>
        <p><input type="submit" value="Start Timer!" onClick={this.props.startTimer}/></p>
        <p><input type="submit" value="Reset Timer" onClick={this.props.resetTimer}/></p>
        <div>
          {
            this.props.mappedPairsObject.length
            ? this.props.mappedPairsObject.map(function(num, index){
              return <div key={ index }>Name: {num.name} Pair Name: {num.pairName} Time Remaining: {this.props.secondsRemaining}</div>;
            }, this)
            : <span>No one is currently pairing</span>
          }
        </div>
      </div>
    )
  }
}
