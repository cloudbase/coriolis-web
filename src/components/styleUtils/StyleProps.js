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

import { css } from 'styled-components'

const StyleProps = {
  fontWeights: {
    light: '300',
    regular: '400',
    medium: '500',
    bold: '600',
  },

  inputSizes: {
    regular: { width: 176, height: 32 },
    large: { width: 224, height: 32 },
  },

  borderRadius: '4px',

  animations: {
    swift: '.45s cubic-bezier(0.3, 1, 0.4, 1) 0s',
    rotation: css`
      animation: rotate 2s infinite linear;
      @keyframes rotate {
        from {transform: rotate(0deg);}
        to {transform: rotate(360deg);}
      }
    `,
  },

  media: {
    handheld: (...args) => css`
      @media (max-height: 760px) { 
        ${css(...args)}
      }
    `,
  },

  exactWidth: width => css`
    min-width: ${width};
    max-width: ${width};
  `,

  exactHeight: height => css`
    min-height: ${height};
    max-height: ${height};
  `,

  exactSize: size => css`
    ${StyleProps.exactWidth(size)}
    ${StyleProps.exactHeight(size)}
  `,
}

export default StyleProps
