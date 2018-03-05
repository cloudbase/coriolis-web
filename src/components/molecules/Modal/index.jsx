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

// @flow

import * as React from 'react'
import styled from 'styled-components'
import Modal from 'react-modal'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'
import KeyboardManager from '../../../utils/KeyboardManager'

const Title = styled.div`
  height: 48px;
  font-size: 24px;
  font-weight: ${StyleProps.fontWeights.light};
  background: ${Palette.grayscale[1]};
  text-align: center;
  line-height: 48px;
`

type Props = {
  children: React.Node,
  isOpen: boolean,
  contentLabel: string,
  onRequestClose: () => void,
  contentStyle: { [string]: mixed },
  topBottomMargin: number,
  title: string,
}
class NewModal extends React.Component<Props> {
  static defaultProps: $Shape<Props> = {
    topBottomMargin: 8,
  }

  scrollableRef: HTMLDivElement
  windowScrollY: number
  modalDiv: ?HTMLDivElement

  constructor() {
    super()

    const self :any = this
    self.positionModal = this.positionModal.bind(this)
  }

  componentDidMount() {
    window.addEventListener('resize', this.positionModal, true)
    setTimeout(() => { this.positionModal(0) }, 100)
  }

  componentWillReceiveProps(newProps: Props) {
    if (!this.props.isOpen && newProps.isOpen) {
      KeyboardManager.onKeyDown('modal', null, 1)
    } else if (this.props.isOpen && !newProps.isOpen) {
      KeyboardManager.removeKeyDown('modal')
      this.handleModalClose()
    }
  }

  componentWillUpdate() {
    setTimeout(() => { this.positionModal(0) }, 100)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.positionModal, true)
  }

  handleChildUpdate(scrollableRef: HTMLDivElement, scrollOffset: number) {
    if (scrollableRef) {
      this.scrollableRef = scrollableRef
    }

    setTimeout(() => {
      this.positionModal(scrollOffset)
    }, 100)
  }

  handleModalOpen() {
    if (!document.body) {
      return
    }

    this.windowScrollY = window.scrollY
    document.body.style.top = `${-this.windowScrollY}px`
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.body.style.height = '100%'
  }

  handleModalClose() {
    if (!document.body) {
      return
    }

    document.body.style.top = ''
    document.body.style.position = ''
    document.body.style.width = ''
    document.body.style.height = ''
    window.scroll(0, this.windowScrollY)
  }

  positionModal(scrollOffset: number) {
    // $FlowIssue
    let pageNode = this.modalDiv && this.modalDiv.node.firstChild
    let contentNode = pageNode && pageNode.firstChild
    if (!contentNode || !pageNode) {
      return
    }
    let scrollableNode = this.scrollableRef || contentNode
    let scrollTop = scrollableNode.scrollTop
    contentNode.style.height = 'auto'
    let left = (pageNode.offsetWidth / 2) - (contentNode.offsetWidth / 2)
    let top = (pageNode.offsetHeight / 2) - (contentNode.offsetHeight / 2)
    let height = 'auto'

    if (top < this.props.topBottomMargin) {
      top = this.props.topBottomMargin
      height = `${pageNode.offsetHeight - (this.props.topBottomMargin * 2)}px`
    }

    contentNode.style.left = `${left}px`
    contentNode.style.top = `${top}px`
    contentNode.style.height = height
    contentNode.style.opacity = 1
    // $FlowIssue
    scrollableNode.scrollTo(0, scrollTop + scrollOffset)
  }

  renderTitle() {
    if (!this.props.title) {
      return null
    }

    return <Title>{this.props.title}</Title>
  }

  render() {
    let modalStyle = {
      overlay: {
        position: 'fixed',
        zIndex: 1000,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(164, 170, 181, 0.69)',
      },
      content: {
        padding: 0,
        width: '576px',
        overflowX: 'hidden',
        borderRadius: '4px',
        border: 'none',
        bottom: 'auto',
        top: 'auto',
        left: 'auto',
        right: 'auto',
        transition: 'all 0.2s',
        opacity: 0,
        display: 'flex',
        flexDirection: 'column',
      },
    }

    modalStyle.content = {
      ...modalStyle.content,
      ...this.props.contentStyle,
    }

    let children = React.Children.map(this.props.children,
      child => React.cloneElement(child, {
        onResizeUpdate: (scrollableRef, scrollOffset) => { this.handleChildUpdate(scrollableRef, scrollOffset) },
      })
    )

    return (
      <Modal
        ref={(m: ?HTMLDivElement) => { this.modalDiv = m }}
        isOpen={this.props.isOpen}
        contentLabel={this.props.contentLabel || this.props.title}
        style={modalStyle}
        onRequestClose={this.props.onRequestClose}
        onAfterOpen={() => { this.handleModalOpen() }}
      >
        {this.renderTitle()}
        {children}
      </Modal>
    )
  }
}

export default NewModal
