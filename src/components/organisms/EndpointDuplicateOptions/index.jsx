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

import StatusImage from '../../atoms/StatusImage'
import Button from '../../atoms/Button'
import WizardOptionsField from '../../molecules/WizardOptionsField'

import KeyboardManager from '../../../utils/KeyboardManager'
import type { Project } from '../../../types/Project'
import Palette from '../../styleUtils/Palette'

import duplicateImage from './images/duplicate.svg'
import Tooltip from '../../atoms/Tooltip'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 32px 32px 32px;
`
const Options = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`
const Image = styled.div`
  margin-top: 48px;
  margin-bottom: 80px;
  width: 128px;
  height: 96px;
  background: url('${duplicateImage}') no-repeat center;
`
const Message = styled.div`
  margin-top: 48px;
  text-align: center;
`
const Title = styled.div`
  font-size: 18px;
  margin-bottom: 8px;
`
const Subtitle = styled.div`
  color: ${Palette.grayscale[4]};
`
const Form = styled.div`
  margin-bottom: 128px;
`
const Loading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 32px;
`
const Buttons = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`
const WizardOptionsFieldStyled = styled(WizardOptionsField) `
  width: 319px;
  justify-content: space-between;
`
type Props = {
  projects: Project[],
  selectedProjectId: string,
  duplicating: boolean,
  onCancelClick: () => void,
  onDuplicateClick: (projectId: string) => void,
}
type State = {
  selectedProjectId: string,
}
@observer
class EndpointDuplicateOptions extends React.Component<Props, State> {
  componentWillMount() {
    this.setState({ selectedProjectId: this.props.selectedProjectId })
  }

  componentDidMount() {
    KeyboardManager.onEnter('duplicate-options', () => {
      this.props.onDuplicateClick(this.state.selectedProjectId)
    }, 2)
  }

  componentWillUnmount() {
    KeyboardManager.removeKeyDown('duplicate-options')
  }

  renderDuplicating() {
    return (
      <Loading>
        <StatusImage loading />
        <Message>
          <Title>Duplicating Endpoint</Title>
          <Subtitle>Please wait ...</Subtitle>
        </Message>
      </Loading>
    )
  }

  renderOptions() {
    return (
      <Options>
        <Image />
        <Form>
          <WizardOptionsFieldStyled
            name="duplicate_to_project"
            type="string"
            enum={this.props.projects}
            skipNullValue
            value={this.state.selectedProjectId}
            onChange={projectId => { this.setState({ selectedProjectId: projectId }) }}
            width={318}
          />
          <Tooltip />
          {Tooltip.rebuild()}
        </Form>
        <Buttons>
          <Button secondary onClick={this.props.onCancelClick}>Cancel</Button>
          <Button onClick={() => { this.props.onDuplicateClick(this.state.selectedProjectId) }}>Duplicate</Button>
        </Buttons>
      </Options>
    )
  }

  render() {
    return (
      <Wrapper>
        {this.props.duplicating ? this.renderDuplicating() : this.renderOptions()}
      </Wrapper>
    )
  }
}

export default EndpointDuplicateOptions
