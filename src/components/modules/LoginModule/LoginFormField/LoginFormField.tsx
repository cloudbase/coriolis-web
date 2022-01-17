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
import styled from 'styled-components'
import { ThemeProps } from '@src/components/Theme'

import TextInput from '@src/components/ui/TextInput'

const Wrapper = styled.div<any>`
  margin-bottom: 16px;
  margin-left: 16px;
`
const FormFieldLabel = styled.div<any>`
  color: white;
  text-transform: uppercase;
  margin-bottom: 6px;
  font-weight: ${ThemeProps.fontWeights.medium};
  font-size: 9px;
`
const StyledTextInput = styled(TextInput)<any>`
  width: ${ThemeProps.inputSizes.regular.width}px;
`

type Props = {
  label: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  value: string
  name?: string
  type?: string
}
const LoginFormField = (props: Props) => (
  <Wrapper>
    <FormFieldLabel data-test-id="loginFormField-label">{props.label}</FormFieldLabel>
    <StyledTextInput
      data-test-id="loginFormField-input"
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      onChange={props.onChange}
    />
  </Wrapper>
)

export default LoginFormField
