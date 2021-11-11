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

import * as React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'
import Modal from 'react-modal'
import autobind from 'autobind-decorator'

import KeyboardManager from '@src/utils/KeyboardManager'

import { ThemeProps } from '@src/components/Theme'
import headerBackground from './images/header-background.png'
import headerBackgroundWide from './images/header-background-wide.png'

const headerHeight = 48

const Title = styled.div<any>`
  height: ${headerHeight}px;
  font-size: 24px;
  font-weight: ${ThemeProps.fontWeights.light};
  text-align: center;
  line-height: 48px;
  color: white;
  background: url('${props => (props.wide ? headerBackgroundWide : headerBackground)}') center/contain no-repeat;
`

type Props = {
  children: React.ReactNode,
  isOpen: boolean,
  contentLabel?: string,
  onRequestClose?: () => void,
  contentStyle?: { [prop: string]: any },
  topBottomMargin?: number,
  title?: string,
  componentRef?: (ref: any) => void,
  onScrollableRef?: () => HTMLElement | null | undefined,
  fixedHeight?: number,
}
@observer
class NewModal extends React.Component<Props> {
  scrollableRef: HTMLDivElement | undefined | null

  windowScrollY: number | undefined

  contentRef: HTMLDivElement | undefined | null

  overlayRef: HTMLDivElement | undefined | null

  UNSAFE_componentWillMount() {
    if (this.props.componentRef) {
      this.props.componentRef(this)
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize, true)
    setTimeout(() => { this.positionModal(0) }, 100)
  }

  UNSAFE_componentWillReceiveProps(newProps: Props) {
    if (!this.props.isOpen && newProps.isOpen) {
      KeyboardManager.onKeyDown('modal', null, 1)
    } else if (this.props.isOpen && !newProps.isOpen) {
      KeyboardManager.removeKeyDown('modal')
      this.handleModalClose()
    }
  }

  UNSAFE_componentWillUpdate() {
    setTimeout(() => { this.positionModal(0) }, 100)
  }

  componentWillUnmount() {
    this.handleModalClose()
    window.removeEventListener('resize', this.handleResize, true)
  }

  @autobind
  handleResize() {
    this.positionModal(0)
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
    window.scroll(0, this.windowScrollY || 0)
  }

  @autobind
  positionModal(scrollOffset: number) {
    const overlay = this.overlayRef as HTMLDivElement
    const content = this.contentRef as HTMLDivElement
    if (!overlay || !content) {
      return
    }
    const scrollableRef = this.props.onScrollableRef && this.props.onScrollableRef()
    const scrollableNode = (scrollableRef || this.scrollableRef || content) as HTMLDivElement
    const scrollTop = scrollableNode.scrollTop
    content.style.height = 'auto'
    const contentDesiredHeight = this.props.fixedHeight
      ? this.props.fixedHeight + headerHeight : content.offsetHeight
    const left = (overlay.offsetWidth / 2) - (content.offsetWidth / 2)
    let top = (overlay.offsetHeight / 2) - (contentDesiredHeight / 2)
    let height = this.props.fixedHeight ? `${this.props.fixedHeight + headerHeight}px` : 'auto'

    const topBottomMargin = this.props.topBottomMargin || 8
    if (top < topBottomMargin) {
      top = topBottomMargin
      height = `${overlay.offsetHeight - (topBottomMargin * 2)}px`
    }

    content.style.left = `${left}px`
    content.style.top = `${top}px`
    content.style.height = height
    content.style.opacity = '1'

    scrollableNode.scrollTop = scrollTop + scrollOffset
  }

  renderTitle(contentWidth: string) {
    if (!this.props.title) {
      return null
    }

    return <Title wide={contentWidth === '800px'}>{this.props.title}</Title>
  }

  render() {
    const modalStyle: Modal.Styles = {
      overlay: {
        position: 'fixed',
        zIndex: 1000,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(73, 76, 81, 0.69)',
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

    const children = React.Children.map(
      this.props.children,
      child => React.cloneElement(
        child as React.ReactElement<any>,
        {
          onResizeUpdate: (scrollableRef: HTMLDivElement, scrollOffset: number) => {
            this.handleChildUpdate(scrollableRef, scrollOffset)
          },
        },
      ),
    )

    return (
      <Modal
        contentRef={(m: HTMLDivElement) => { this.contentRef = m }}
        overlayRef={(m: HTMLDivElement) => { this.overlayRef = m }}
        isOpen={this.props.isOpen}
        contentLabel={this.props.contentLabel || this.props.title}
        style={modalStyle}
        onRequestClose={this.props.onRequestClose}
        onAfterOpen={() => { this.handleModalOpen() }}
        ariaHideApp={false}
      >
        {this.renderTitle(modalStyle.content.width as string)}
        {children}
      </Modal>
    )
  }
}

export default NewModal
