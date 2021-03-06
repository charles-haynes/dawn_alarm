import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SketchPicker } from 'react-color';
import * as d3color from 'd3-color';

export default class ShowColor extends Component {
  static propTypes = {
    color: PropTypes.shape({
      r: PropTypes.number.isRequired,
      g: PropTypes.number.isRequired,
      b: PropTypes.number.isRequired,
    }).isRequired,
    handleChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    color: d3color.rgb('#f19'),
    handleChange: () => {},
  };

  state = {
    displayColorPicker: false,
    color: this.props.color.toString(),
  };

  componentWillReceiveProps = nextProps => {
    if (nextProps.color === this.props.color) return;
    const c = d3color.rgb(nextProps.color);
    this.setState({ color: c });
  };

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker });
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false });
  };

  handleChange = color => {
    const c = d3color.rgb(color.rgb.r, color.rgb.g, color.rgb.b);
    this.setState({ color: c });
    this.props.handleChange(c);
  };

  render() {
    return (
      <div className="show-color">
        <button className="ledframe" onClick={this.handleClick}>
          <div
            className="ledemitter"
            style={{ background: this.state.color }}
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
