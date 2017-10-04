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

import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './NewModal.scss';
import Modal from 'react-modal';

class NewModal extends React.Component {

  static defaultProps = {
    topBottomMargin: 8
  }

  static propTypes = {
    children: PropTypes.node.isRequired,
    isOpen: PropTypes.bool.isRequired,
    contentLabel: PropTypes.string,
    onRequestClose: PropTypes.func,
    contentStyle: PropTypes.object,
    topBottomMargin: PropTypes.number
  }

  componentDidMount() {
    window.addEventListener('resize', this.positionModal.bind(this), true)
    setTimeout(this.positionModal.bind(this), 100)
  }

  componentWillReceiveProps() {
    setTimeout(this.positionModal.bind(this), 100)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.positionModal.bind(this), true)
  }

  handleChildUpdate() {
    setTimeout(this.positionModal.bind(this), 100)
  }

  positionModal() {
    let pageNode = this.modalDiv && this.modalDiv.node.firstChild
    let contentNode = pageNode && pageNode.firstChild;
    if (!contentNode) {
      return
    }

    contentNode.style.height = 'auto'
    let left = pageNode.offsetWidth / 2 - contentNode.offsetWidth / 2
    let top = pageNode.offsetHeight / 2 - contentNode.offsetHeight / 2
    let height = 'auto';

    if (top < this.props.topBottomMargin) {
      top = this.props.topBottomMargin
      height = pageNode.offsetHeight - this.props.topBottomMargin * 2 + 'px'
    }

    contentNode.style.left = left + 'px'
    contentNode.style.top = top + 'px'
    contentNode.style.height = height
    contentNode.style.opacity = 1;
  }

  render() {
    let modalStyle = {
      overlay: {
        position: 'fixed',
        zIndex: 10000,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(164, 170, 181, 0.69)'
      },
      content: {
        padding: 0,
        overflowX: 'hidden',
        borderRadius: '4px',
        border: 'none',
        bottom: 'auto',
        top: 'auto',
        left: 'auto',
        right: 'auto',
        transition: 'all 0.2s',
        opacity: 0
      }
    }

    modalStyle.content = {
      ...modalStyle.content,
      ...this.props.contentStyle
    }

    let children = React.Children.map(this.props.children,
      child => React.cloneElement(child, {
        onResizeUpdate: this.handleChildUpdate.bind(this)
      })
    );

    return (
      <Modal
        ref={m => { this.modalDiv = m }}
        isOpen={this.props.isOpen}
        contentLabel={this.props.contentLabel}
        style={modalStyle}
        contentLabel={this.props.contentLabel}
        onRequestClose={this.props.onRequestClose}
      >
        {children}
      </Modal>
    )
  }
}

export default withStyles(NewModal, s);
