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

import { css } from 'styled-components'

import RubikRegular from './Rubik-Regular.woff'
import RubikItalic from './Rubik-Italic.woff'
import RubikBold from './Rubik-Bold.woff'
import RubikLight from './Rubik-Light.woff'
import RubikExtraLight from './Rubik-ExtraLight.woff'
import RubikLightItalic from './Rubik-LightItalic.woff'
import RubikMedium from './Rubik-Medium.woff'
import RubikMediumItalic from './Rubik-MediumItalic.woff'

const Fonts = css`
  @font-face {
    font-family: 'Rubik';
    src: url('${RubikRegular}') format('woff');
    font-weight: 400;
    font-style: normal;
  }

  @font-face {
    font-family: 'Rubik';
    src: url('${RubikItalic}') format('woff');
    font-weight: 400;
    font-style: italic;
  }

  @font-face {
    font-family: 'Rubik';
    src: url('${RubikBold}') format('woff');
    font-weight: 600;
    font-style: normal;
  }

  @font-face {
    font-family: 'Rubik';
    src: url('${RubikLight}') format('woff');
    font-weight: 300;
    font-style: normal;
  }

  @font-face {
    font-family: 'Rubik';
    src: url('${RubikLightItalic}') format('woff');
    font-weight: 300;
    font-style: italic;
  }

  @font-face {
    font-family: 'Rubik';
    src: url('${RubikMedium}') format('woff');
    font-weight: 500;
    font-style: normal;
  }

  @font-face {
    font-family: 'Rubik';
    src: url('${RubikMediumItalic}') format('woff');
    font-weight: 500;
    font-style: italic;
  }

  @font-face {
    font-family: 'Rubik';
    src: url('${RubikExtraLight}') format('woff');
    font-weight: 200;
    font-style: normal;
  }
`

export default Fonts
