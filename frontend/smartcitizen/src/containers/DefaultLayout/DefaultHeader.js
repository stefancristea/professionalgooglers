import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Badge, UncontrolledDropdown, DropdownItem, DropdownMenu, DropdownToggle, Nav, NavItem, Button } from 'reactstrap';
import PropTypes from 'prop-types';

import {AppSidebarToggler}  from '@coreui/react';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultHeader extends Component {

  constructor(props) {
    super(props);
  }

  doLogout = e => {
    e.preventDefault();
    window.LoggedIn = false;
    this.forceUpdate();        
    window.location = '/';
  }

  render() {

    // eslint-disable-next-line
    const { children, ...attributes } = this.props;

    return (
      <React.Fragment>
        <AppSidebarToggler className="d-lg-none" display="md" mobile />
        <AppSidebarToggler className="d-md-down-none" display="lg" />
        <Nav className="ml-auto" navbar>
          
        <NavItem className="d-md-down-none">
          {
            (window.LoggedIn == false || window.LoggedIn == undefined)  ?
            ( <span>
            <NavLink to="/login" className="nav-link"><i className="icon-key"></i> Log In</NavLink> </span>) :
            <span>
            <NavLink to = '' className="nav-link" onClick={e =>this.doLogout(e)}><i className="icon-key"></i> Log Out</NavLink>
            </span>
          }
          </NavItem>
          <NavItem className="d-md-down-none">
          </NavItem>
         
        </Nav>

      </React.Fragment>
    );
  }
}

DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

export default DefaultHeader;
