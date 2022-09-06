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

const search = (color: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="14px" height="14px" viewBox="0 0 14 14" version="1.1"
xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 47 (45396) - http://www.bohemiancoding.com/sketch -->

    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="Coriolis" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="Replica-List-and-Notifications" transform="translate(-770.000000, -137.000000)"
        stroke="${color}">
            <g id="Icon/Search/Dark" transform="translate(768.000000, 135.000000)">
                <circle id="Oval-32" cx="8" cy="8" r="5.5"></circle>
                <path d="M12,12 L15.5,15.5" id="Line" stroke-linecap="round"></path>
            </g>
        </g>
    </g>
</svg>`;

export default search;
