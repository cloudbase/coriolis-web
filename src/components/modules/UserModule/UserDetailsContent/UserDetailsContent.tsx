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
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react'
import styled from 'styled-components'

import CopyValue from '../../../ui/CopyValue/CopyValue'
import CopyMultilineValue from '../../../ui/CopyMultilineValue/CopyMultilineValue'
import StatusImage from '../../../ui/StatusComponents/StatusImage/StatusImage'
import Button from '../../../ui/Button/Button'

import type { User } from '../../../../@types/User'
import type { Project } from '../../../../@types/Project'
import { ThemePalette, ThemeProps } from '../../../Theme'

const Wrapper = styled.div<any>`
  ${ThemeProps.exactWidth(ThemeProps.contentWidth)}
  margin: 0 auto;
  padding-left: 126px;
`
const Info = styled.div<any>`
  display: flex;
  flex-wrap: wrap;
  margin-top: 32px;
  margin-left: -32px;
`
const LinkStyled = styled(Link)`
  color: ${ThemePalette.primary};
  text-decoration: none;
`
const Field = styled.div<any>`
  ${ThemeProps.exactWidth('calc(50% - 32px)')}
  margin-bottom: 32px;
  margin-left: 32px;
`
const Value = styled.div<any>``
const Label = styled.div<any>`
  font-size: 10px;
  font-weight: ${ThemeProps.fontWeights.medium};
  color: ${ThemePalette.grayscale[3]};
  text-transform: uppercase;
  margin-bottom: 3px;
`
const LoadingWrapper = styled.div<any>`
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 32px 0 64px 0;
`
const Buttons = styled.div<any>`
  margin-top: 64px;
  display: flex;
  justify-content: space-between;
`
const ButtonsColumn = styled.div<any>`
  display: flex;
  flex-direction: column;
  button {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`

export const TEST_ID = 'userDetailsContent'

export type Props = {
  user: User | null,
  loading: boolean,
  projects: Project[],
  userProjects: Project[],
  isLoggedUser: boolean,
  onUpdatePasswordClick: () => void,
  onDeleteClick: () => void,
}

@observer
class UserDetailsContent extends React.Component<Props> {
  renderLoading() {
    if (!this.props.loading) {
      return null
    }

    return (
      <LoadingWrapper>
        <StatusImage />
      </LoadingWrapper>
    )
  }

  renderButtons() {
    if (this.props.loading) return null

    return (
      <Buttons>
        <ButtonsColumn>
          <Button
            hollow
            onClick={this.props.onUpdatePasswordClick}
            data-test-id={`${TEST_ID}-updateButton`}
          >Change password
          </Button>
        </ButtonsColumn>
        <ButtonsColumn>
          <Button
            alert
            hollow
            onClick={() => { this.props.onDeleteClick() }}
            disabled={this.props.isLoggedUser}
            data-test-id={`${TEST_ID}-deleteUserButton`}
          >Delete user
          </Button>
        </ButtonsColumn>
      </Buttons>
    )
  }

  renderUserProjects(projects: { label: string, id: string }[]): React.ReactNode {
    return projects.map((project, i) => (
      <span key={project.id}>
        {project.label ? (
          <LinkStyled to={`/projects/${project.id}`}>
            {project.label}
          </LinkStyled>
        ) : project.id}
        {i < projects.length - 1 ? ', ' : ''}
      </span>
    ))
  }

  renderInfo() {
    if (this.props.loading || !this.props.user) {
      return null
    }

    const user = this.props.user
    const primaryProject = this.props.projects.find(p => user.project_id === p.id)
    const primaryProjectName = primaryProject ? primaryProject.name : user.project_id
    const userProjects: { label: string, id: string }[] = this.props.userProjects.map(up => {
      const projectInfo = this.props.projects.find(p => p.id === up.id)
      if (projectInfo) {
        return { label: projectInfo.name, id: up.id }
      }
      return { label: '', id: up.id }
    })

    return (
      <Info>
        <Field>
          <Label>Name</Label>
          {this.renderValue(user.name, 'name')}
        </Field>
        <Field>
          <Label>Description</Label>
          {user.description ? <CopyMultilineValue value={user.description} /> : <Value>-</Value>}
        </Field>
        <Field>
          <Label>ID</Label>
          {this.renderValue(user.id, 'id')}
        </Field>
        <Field>
          <Label>Email</Label>
          {this.renderValue(user.email || '-', 'email')}
        </Field>
        <Field>
          <Label>Primary Project</Label>
          {this.renderValue(primaryProjectName || '-', 'primaryProject')}
        </Field>
        <Field>
          <Label>Project Membership</Label>
          {userProjects.length > 0 ? this.renderUserProjects(userProjects) : <Value>-</Value>}
        </Field>
        <Field>
          <Label>Enabled</Label>
          <Value data-test-id={`${TEST_ID}-enabled`}>{user.enabled ? 'Yes' : 'No'}</Value>
        </Field>
      </Info>
    )
  }

  renderValue(value: string, dataTestId?: string) {
    return value !== '-' ? (
      <CopyValue
        data-test-id={`${TEST_ID}-${dataTestId || ''}`}
        value={value}
        maxWidth="90%"
      />
    ) : <Value>{value}</Value>
  }

  render() {
    return (
      <Wrapper>
        {this.renderInfo()}
        {this.renderLoading()}
        {this.renderButtons()}
      </Wrapper>
    )
  }
}

export default UserDetailsContent
