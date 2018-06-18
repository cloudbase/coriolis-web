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
import styled from 'styled-components'

import TextInput from '../../atoms/TextInput'
import StyleProps from '../../styleUtils/StyleProps'

const Wrapper = styled.div`
  margin-bottom: 16px;
  margin-left: 16px;
`
const FormFieldLabel = styled.div`
  color: white;
  text-transform: uppercase;
  margin-bottom: 6px;
  font-weight: ${StyleProps.fontWeights.medium};
  font-size: 9px;
`
const StyledTextInput = styled(TextInput) `
  width: ${StyleProps.inputSizes.regular.width}px;
`

type Props = {
  label: string,
  onChange: (e: SyntheticInputEvent<EventTarget>) => void,
}
const LoginFormField = (props: Props) => {
  return (
    <Wrapper>
      <FormFieldLabel data-test-id="loginFormField-label">{props.label}</FormFieldLabel>
      <StyledTextInput data-test-id="loginFormField-input" {...props} onChange={props.onChange} />
    </Wrapper>
  )
}

export default LoginFormField
