/*
Copyright (C) 2021  Cloudbase Solutions SRL
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

import { css } from 'styled-components'

const exactWidth = (width: string) => css`
  min-width: ${width};
  max-width: ${width};
`

const exactHeight = (height: string) => css`
  min-height: ${height};
  max-height: ${height};
`

export const ThemePalette = {
  primary: '#0044CB',
  primaryLight: '#000EA9',
  secondary: '#D9DCE3',
  secondaryLight: '#777A8B',
  black: '#202134',
  alert: '#F91661',
  success: '#4CD964',
  warning: '#FDC02F',
  grayscale: [
    '#D8DBE2', // 0
    '#ECEDF1', // 1
    '#C8CCD7', // 2
    '#A4AAB5', // 3
    '#616770', // 4
    '#7F8795', // 5
    '#1B2733', // 6
    '#F2F3F4', // 7
    '#858B93', // 8
  ],
}

export const ThemeProps = {
  fontWeights: {
    extraLight: 200,
    light: 300,
    regular: 400,
    medium: 500,
    bold: 600,
  },

  inputSizes: {
    regular: { width: 208, height: 32 },
    large: { width: 224, height: 32 },
    wizard: { width: 384 },
  },

  borderRadius: '4px',
  contentWidth: '928px',
  boxShadow: 'box-shadow: rgba(0, 0, 0, 0.1) 0 0 6px 2px;',

  animations: {
    swift: '.45s cubic-bezier(0.3, 1, 0.4, 1) 0s',
    rotation: css`
        animation: rotate 2s infinite linear;
        @keyframes rotate {
          from {transform: rotate(0deg);}
          to {transform: rotate(360deg);}
        }
      `,
    disabledLoading: css`
        animation: opacityToggle 750ms linear infinite alternate-reverse;
        @keyframes opacityToggle {
          0% {opacity: 1;}
          100% {opacity: 0.3;}
        }
      `,
  },

  mobileMaxWidth: 1350,

  exactWidth,
  exactHeight,
  exactSize: (size: string) => css`
      ${exactWidth(size)}
      ${exactHeight(size)}
    `,
}
