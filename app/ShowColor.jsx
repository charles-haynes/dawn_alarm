import React, { Component } from 'react';
import ReactProps from 'react-props';
import { SketchPicker } from 'react-color';
import tinycolor from 'tinycolor2';

// TODO use ReactProps to declare our props

export default class ShowColor extends Component {
  propTypes = {
    color: {
      r: ReactProps.string.isRequired,
      g: ReactProps.string.isRequired,
      b: ReactProps.string.isRequired,
    }.isRequired,
    handleChange: ReactProps.func.isRequired,
  };

  state = {
    displayColorPicker: false,
    color: tinycolor(this.props.color),
  };

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker });
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false });
  };

  handleChange = color => {
    const c = tinycolor(color.rgb);
    this.setState({ color: c });
    this.props.handleChange(c);
  };

  render() {
    return (
      <div>
        <button className="ledframe" onClick={this.handleClick}>
          <div
            className="ledemitter"
            style={{ background: this.state.color.toHexString() }}
          />
        </button>
        {this.state.displayColorPicker
          ? <div className="popover">
              <button className="cover" onClick={this.handleClose} />
              <SketchPicker
                color={this.state.color}
                onChangeComplete={this.handleChange}
              />
            </div>
          : null}
      </div>
    );
  }
}
