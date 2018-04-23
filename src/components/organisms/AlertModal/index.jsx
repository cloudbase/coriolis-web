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

import React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'

import Modal from '../../molecules/Modal'
import Button from '../../atoms/Button'
import StatusImage from '../../atoms/StatusImage'

import Palette from '../../styleUtils/Palette'
import KeyboardManager from '../../../utils/KeyboardManager'

import questionImage from './images/question.svg'
import errorImage from './images/error.svg'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
`
const Image = styled.div`
  width: 96px;
  height: 96px;
  background: url('${props => props.type === 'error' ? errorImage : questionImage}');
`
const Message = styled.div`
  font-size: 18px;
  text-align: center;
  margin-top: 48px;
`
const ExtraMessage = styled.div`
  color: ${Palette.grayscale[4]};
  margin: 11px 0 48px 0;
  text-align: center;
`
const Buttons = styled.div`
  display: flex;
  justify-content: ${props => props.centered ? 'center' : 'space-between'};
  width: 100%;
`

type AlertType = 'error' | 'confirmation' | 'loading'
type Props = {
  message: string,
  extraMessage: string,
  type: AlertType,
  isOpen: boolean,
  onRequestClose: () => void,
  onConfirmation: () => void,
}
@observer
class AlertModal extends React.Component<Props> {
  static defaultProps: $Shape<Props> = {
    type: 'confirmation',
  }

  id: string

  componentDidMount() {
    this.id = new Date().getTime().toString()
    KeyboardManager.onEnter(`alert-${this.id}`, () => {
      if (this.props.isOpen) {
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
    return (
      <Modal {...this.props}>
        <Wrapper data-test-id="alertModal">
          {this.props.type === 'loading' ? <StatusImage loading /> : <Image type={this.props.type} />}
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
