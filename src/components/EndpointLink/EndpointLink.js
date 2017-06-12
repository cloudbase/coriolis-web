/*
Copyright (C) 2017  Cloudbase Solutions SRL

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import React, { Component, PropTypes } from 'react';
import Location from '../../core/Location';
import Reflux from 'reflux';
import ConnectionStore from '../../stores/ConnectionsStore';

function isLeftClickEvent(event) {
  return event.button === 0;
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

class EndpointLink extends Reflux.Component {

  static propTypes = {
    connectionId: PropTypes.string
  };

  constructor(props) {
    super(props)

    this.store = ConnectionStore;

    this.state = {
      connection: null
    }
  }

  componentWillMount() {
    super.componentWillMount.call(this)
  }

  componentDidMount() {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps(props) {
    if (this.state && this.state.connections) {
      this.state.connections.forEach(connection => {
        if (connection.id == props.connectionId) {
          this.setState({ connection: connection })
        }
      })
    }
  }


  handleClick = (event) => {
    let allowTransition = true;
    let clickResult;

    if (this.props && this.props.onClick) {
      clickResult = this.props.onClick(event);
    }

    if (isModifiedEvent(event) || !isLeftClickEvent(event)) {
      return;
    }

    if (clickResult === false || event.defaultPrevented === true) {
      allowTransition = false;
    }

    event.preventDefault();

    if (allowTransition) {
      const link = event.currentTarget;
      if (this.props && this.props.to) {
        Location.push(this.props.to);
      } else {
        Location.push({ pathname: link.pathname, search: link.search });
      }
    }
  };

  render() {
    const { to, ...props } = this.props; // eslint-disable-line no-use-before-define
    if (this.state && this.state.connection) {
      return <a
        href={Location.createHref(`/cloud-endpoints/${this.state.connection.id}`)}
        {...props}
        onClick={this.handleClick}
      >{this.state.connection.name}</a>;
    } else {
      return null
    }

  }

}

export default EndpointLink;
