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

const hamburger = () => {
  return `
<?xml version="1.0" encoding="UTF-8"?>
<svg width="30px" height="30px" viewBox="-7 -8 30 30" version="1.1" 
xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="Nav/Menu/Header" transform="translate(-22.000000, -24.000000)" fill="#FFFFFF">
            <g id="Group" transform="translate(22.000000, 24.000000)">
                <rect id="top-layer" x="0" y="0" width="20" height="2" rx="1"></rect>
                <rect id="middle-layer" x="0" y="7" width="20" height="2" rx="1"></rect>
                <rect id="bottom-layer" x="0" y="14" width="20" height="2" rx="1"></rect>
            </g>
        </g>
    </g>
</svg>`
}

export default hamburger
