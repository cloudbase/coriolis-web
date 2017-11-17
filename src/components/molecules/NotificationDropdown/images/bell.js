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

const bell = color => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="32px" height="32px" viewBox="0 0 32 32" version="1.1" 
xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 47 (45396) - http://www.bohemiancoding.com/sketch -->
    <title>Icon/Notification/Normal</title>
    <desc>Created with Sketch.</desc>
    <defs>
        <rect id="path-1" x="12" y="24" width="8" height="4"></rect>
    </defs>
    <g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="Icon/Notification/Normal">
            <path
            d="M16,5 L16,5 L16,5 C20.418278,5 24,8.581722 24,13 
            L24,23 L8,23 L8,13 L8,13 C8,8.581722 11.581722,5 16,5 Z"
            id="Rectangle-9" fill="${color}"></path>
            <mask id="mask-2" fill="white">
                <use xlink:href="#path-1"></use>
            </mask>
            <g id="Mask"></g>
            <circle id="Oval" fill="${color}" mask="url(#mask-2)" cx="16" cy="25" r="3"></circle>
        </g>
    </g>
</svg>`

export default bell
