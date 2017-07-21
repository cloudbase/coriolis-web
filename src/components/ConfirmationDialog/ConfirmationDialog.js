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
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ConfirmationDialog.scss';
import Modal from 'react-modal';

class ConfirmationDialog extends Component {
  static propTypes = {
    message: PropTypes.string,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    visible: PropTypes.bool
  }

  static defaultProps = {
    message: "Are you sure?",
    visible: false,
    place: "right"
  }

  onCancel() {
    if (this.props.onCancel) {
      this.props.onCancel()
    }
  }

  onConfirm() {
    if (this.props.onConfirm) {
      this.props.onConfirm()
    }
  }

  render() {
    let modalStyle = {
      content: {
        padding: "16px",
        borderRadius: "4px",
        bottom: "auto",
        width: "250px",
        height: "auto",
        left: "50%",
        top: "40%",
        marginLeft: "-75px"
      }
    }
    if (this.props.visible) {
      return (
        <div className={s.root}>
          <Modal
            isOpen={this.props.visible}
            contentLabel="Add new cloud connection"
            style={modalStyle}
          >
            <p className={s.message}>{this.props.message}</p>
            <div className={s.buttons}>
              <button className={s.leftBtn + " gray"} onClick={(e) => this.onCancel(e)}>Cancel</button>
              <button className={s.rightBtn} onClick={(e) => this.onConfirm(e)}>Yes</button>
            </div>
          </Modal>
        </div>
      );
    } else {
      return null
    }
  }
}

export default withStyles(ConfirmationDialog, s);
