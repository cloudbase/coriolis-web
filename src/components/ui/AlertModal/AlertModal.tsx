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

import React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'

import Modal from '@src/components/ui/Modal'
import Button from '@src/components/ui/Button'
import StatusImage from '@src/components/ui/StatusComponents/StatusImage'

import { ThemePalette } from '@src/components/Theme'
import KeyboardManager from '@src/utils/KeyboardManager'

const Wrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
`
const Message = styled.div<any>`
  font-size: 18px;
  text-align: center;
  margin-top: 48px;
`
const ExtraMessage = styled.div<any>`
  color: ${ThemePalette.grayscale[4]};
  margin: 11px 0 48px 0;
  text-align: center;
`
const Buttons = styled.div<any>`
  display: flex;
  justify-content: ${props => (props.centered ? 'center' : 'space-between')};
  width: 100%;
`

type AlertType = 'error' | 'confirmation' | 'loading'
type Props = {
  message?: string,
  extraMessage?: string,
  type?: AlertType,
  isOpen?: boolean,
  title?: string,
  onRequestClose?: () => void,
  onConfirmation?: () => void,
}
@observer
class AlertModal extends React.Component<Props> {
  static defaultProps = {
    type: 'confirmation',
  }

  id: string | undefined

  componentDidMount() {
    this.id = `${new Date().getTime().toString()}-${Math.random()}`
    KeyboardManager.onEnter(`alert-${this.id}`, () => {
      if (this.props.isOpen && this.props.onConfirmation) {
        this.props.onConfirmation()
      }
    }, 2)
  }

  componentWillUnmount() {
    KeyboardManager.removeKeyDown(`alert-${this.id}`)
  }

  renderDismissButton() {
    if (this.props.type !== 'error') {
      return null
    }

    return (
      <Buttons centered>
        <Button secondary onClick={this.props.onRequestClose}>Dismiss</Button>
      </Buttons>
    )
  }

  renderConfirmationButtons() {
    if (this.props.type !== 'confirmation') {
      return null
    }

    return (
      <Buttons>
        <Button secondary onClick={this.props.onRequestClose}>No</Button>
        <Button onClick={this.props.onConfirmation}>Yes</Button>
      </Buttons>
    )
  }

  render() {
    const status = this.props.type === 'loading' ? 'RUNNING' : (this.props.type || 'confirmation')

    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <Modal {...this.props} isOpen={this.props.isOpen || false}>
        <Wrapper>
          <StatusImage status={status} />
          {this.props.message ? <Message>{this.props.message}</Message> : null}
          {this.props.extraMessage ? <ExtraMessage>{this.props.extraMessage}</ExtraMessage> : null}
          {this.renderConfirmationButtons()}
          {this.renderDismissButton()}
        </Wrapper>
      </Modal>
    )
  }
}

export default AlertModal
