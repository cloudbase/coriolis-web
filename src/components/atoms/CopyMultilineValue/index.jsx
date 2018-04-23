/*
Copyright (C) 2018  Cloudbase Solutions SRL
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

  &:hover > span {
    opacity: 1;
  }
  > span {
    background-position-y: 4px;
    margin-left: 4px;
  }
`

type Props = {
  'data-test-id'?: string,
  value: string,
}
@observer
class CopyMultineValue extends React.Component<Props> {
  handleCopy() {
    let succesful = DomUtils.copyTextToClipboard(this.props.value)

    if (succesful) {
      NotificationStore.notify('The message has been copied to clipboard.')
    }
  }

  render() {
    return (
      <Wrapper
        onClick={() => { this.handleCopy() }}
        data-test-id={this.props['data-test-id'] || 'copyMultilineValue'}
      >
        {this.props.value}
        <CopyButton />
      </Wrapper>
    )
  }
}

export default CopyMultineValue
