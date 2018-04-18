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

import CopyButton from '../CopyButton'
import DomUtils from '../../../utils/DomUtils'
import NotificationStore from '../../../stores/NotificationStore'

const Wrapper = styled.div`
  cursor: pointer;
  display: flex;
  &:hover > span:last-child {
    opacity: 1;
  }
`
const Value = styled.span`
  width: ${props => `${props.width || 'auto'}`};
  ${props => props.maxWidth ? `max-width: ${props.maxWidth};` : ''}
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  margin-right: 4px;
`

type Props = {
  value: string,
  width?: string,
  maxWidth?: string,
  'data-test-id'?: string,
}
@observer
class CopyValue extends React.Component<Props> {
  handleCopyIdClick(e: Event) {
    e.stopPropagation()

    let succesful = DomUtils.copyTextToClipboard(this.props.value)

    if (succesful) {
      NotificationStore.notify('The value has been copied to clipboard.')
    } else {
      NotificationStore.notify('The value couldn\'t be copied', 'error')
    }
  }

  render() {
    return (
      <Wrapper
        onClick={e => { this.handleCopyIdClick(e) }}
        onMouseDown={e => { e.stopPropagation() }}
        onMouseUp={e => { e.stopPropagation() }}
        data-test-id={this.props['data-test-id'] || 'copyValue'}
      >
        <Value
          width={this.props.width}
          maxWidth={this.props.maxWidth}
        >{this.props.value}</Value>
        <CopyButton />
      </Wrapper>
    )
  }
}

export default CopyValue
