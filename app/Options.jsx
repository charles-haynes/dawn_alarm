import React, { Component } from 'react';
import { getOptions, setOptions, triggerAlarm } from './Utils';

export default class Options extends Component {
  static stateChanged(oldState, newState) {
    if (Object.keys(oldState).length !== Object.keys(newState).length) {
      return true;
    }
    return Object.keys(oldState).reduce(
      (acc, key) => acc || oldState[key] !== newState[key],
      false
    );
  }

  state = {};

  componentWillMount = () => {
    getOptions().then(options => {
      this.setState(options);
    });
  };

  componentDidUpdate = (_, prevState) => {
    if (!Options.stateChanged(prevState, this.state)) {
      return;
    }
    setOptions(this.state);
  };

  handleChange = event => {
    const target = event.target;
    let value = target.value;
    if (target.type === 'checkbox') value = target.checked;
    if (target.type === 'number') value = parseInt(target.value, 10);
    const name = target.name;

    this.setState({
      [name]: value,
    });
  };

  render() {
    const checkbox = key =>
      <div key={key}>
        <label htmlFor={key}>
          <input
            name={key}
            type="checkbox"
            onChange={this.handleChange}
            checked={this.state[key]}
          />
          {key}
        </label>
        <br />
      </div>;

    const text = key =>
      <div key={key}>
        <label htmlFor={key}>
          {key}
          <input
            name={key}
            type="text"
            value={this.state[key]}
            onChange={this.handleChange}
          />
        </label>
        <br />
      </div>;

    const num = key =>
      <div key={key}>
        <label htmlFor={key}>
          {key}
          <input
            name={key}
            type="number"
            value={this.state[key]}
            onChange={this.handleChange}
          />
        </label>
        <br />
      </div>;

    const options = () =>
      Object.keys(this.state).map(key => {
        if (typeof this.state[key] === 'boolean') return checkbox(key);
        if (typeof this.state[key] === 'number') return num(key);
        return text(key);
      });

    return (
      <div>
        <form>
          {options()}
        </form>
        <button className="trigger-alarm" onClick={triggerAlarm}>
          Trigger Alarm
        </button>
      </div>
    );
  }
}
