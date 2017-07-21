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
import s from './ValidateEndpoint.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import LoadingIcon from '../LoadingIcon';
import ConnectionsActions from '../../actions/ConnectionsActions';


class ValidateEndpoint extends Component {

  static propTypes = {
    endpoint: PropTypes.object,
    closeHandle: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = {
      status: 0,
      message: null
    }
  }

  componentDidMount() {
    this.validate()
  }

  close() {
    this.props.closeHandle()
  }

  validate() {
    this.setState({
      status: 0,
      message: null
    })
    ConnectionsActions.validateConnection(this.props.endpoint, (response) => {
      this.setState({
        status: response.data["validate-connection"].valid ? 1 : -1,
        message: response.data["validate-connection"].valid ?
          "Endpoint is valid" : response.data["validate-connection"].message
      })
    })
  }

  render() {
    let buttons
    switch (this.state.status) {
      case -1:
        buttons = (<div className={s.dualBtn}>
          <button className="gray" onClick={(e) => this.close(e)}>Cancel</button>
          <button onClick={(e) => this.validate(e)}>Retry</button>
        </div>)
        break;
      case 1:
        buttons = (<div className={s.singleBtn}>
          <button onClick={(e) => this.close(e)}>Dismiss</button>
        </div>)
        break;
      default:
        buttons = (<div className={s.singleBtn}>
          <button className="gray" onClick={(e) => this.close(e)}>Cancel</button>
        </div>)
    }
    return (<div className={s.root}>
      <div className={s.container + (this.state.status != 0 ? s.hidden : "")}>
        { this.state.status == 0 ? <LoadingIcon /> : <div className={s.message}>{this.state.message}</div> }
      </div>
      {buttons}
    </div>)
  }

}

export default withStyles(ValidateEndpoint, s);
