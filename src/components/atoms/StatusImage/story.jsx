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
import { storiesOf } from '@storybook/react'
import StatusImage from '.'

type State = {
  loadingProgress: number,
}
class LoadingProgress extends React.Component<{}, State> {
  state = {
    loadingProgress: 50,
  }

  componentDidMount() {
    setInterval(() => {
      this.setState({ loadingProgress: this.state.loadingProgress === 50 ? 75 : 50 })
    }, 1000)
  }

  render() {
    return <StatusImage loading loadingProgress={this.state.loadingProgress} />
  }
}

storiesOf('StatusImage', module)
  .add('completed', () => (
    <StatusImage status="COMPLETED" />
  ))
  .add('running', () => (
    <StatusImage status="RUNNING" />
  ))
  .add('running - custom size', () => (
    <StatusImage
      status="RUNNING"
      size={48}
    />
  ))
  .add('loading progress', () => (
    <StatusImage loading loadingProgress={45} />
  ))
  .add('loading progress animated', () => (
    <LoadingProgress />
  ))
  .add('error', () => (
    <StatusImage status="ERROR" />
  ))
  .add('question', () => (
    <StatusImage status="QUESTION" />
  ))
