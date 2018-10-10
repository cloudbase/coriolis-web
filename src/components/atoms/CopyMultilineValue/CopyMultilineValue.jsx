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
import notificationStore from '../../../stores/NotificationStore'

const CopyButtonStyled = styled(CopyButton)`
  background-position-y: 4px;
  margin-left: 4px;
`
const Wrapper = styled.div`
  cursor: pointer;

  &:hover ${CopyButtonStyled} {
    opacity: 1;
  }
`

type Props = {
  'data-test-id'?: string,
  value: string,
  onCopy?: (value: string) => void,
  useDangerousHtml?: boolean,
}
@observer
class CopyMultineValue extends React.Component<Props> {
  handleCopy() {
    let value = this.props.value
    if (this.props.useDangerousHtml) {
      value = value.replace(/<br\s*\/>/g, '\n').replace(/<.*?>/g, '')
    }

    let succesful = DomUtils.copyTextToClipboard(value)
    if (this.props.onCopy) this.props.onCopy(value)

    if (succesful) {
      notificationStore.alert('The message has been copied to clipboard.')
    }
  }

  render() {
    let text = this.props.value
    if (this.props.useDangerousHtml) {
      text = <span dangerouslySetInnerHTML={{ __html: text }} />
    }

    return (
      <Wrapper
        onClick={() => { this.handleCopy() }}
        data-test-id={(this.props && this.props['data-test-id']) || 'copyMultilineValue'}
      >
        {text}
        <CopyButtonStyled />
      </Wrapper>
    )
  }
}

export default CopyMultineValue
