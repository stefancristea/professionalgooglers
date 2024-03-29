import React, { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultFooter extends Component {
  render() {

    // eslint-disable-next-line
    const { children, ...attributes } = this.props;

    return (
      <React.Fragment>
        <span>Smart Citizen - book your parking spot</span>
        <span className="ml-auto">Powered by <a href="https://coreui.io/react">CoreUI for <s>React</s> <i className={'fa fa-heart'} style={{color: 'red'}}></i></a></span>
      </React.Fragment>
    );
  }
}

DefaultFooter.propTypes = propTypes;
DefaultFooter.defaultProps = defaultProps;

export default DefaultFooter;
