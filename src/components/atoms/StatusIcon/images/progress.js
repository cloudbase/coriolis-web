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

const image = (bigColor, smallColor) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 47.1 (45422) - http://www.bohemiancoding.com/sketch -->
    <title>Icon-Progress</title>
    <desc>Created with Sketch.</desc>
    <defs>
        <path d="M8,16 C3.581722,16 0,12.418278 0,8 C0,3.581722 3.581722,0 8,0 C12.418278,0 16,3.581722 16,8 C16,12.418278 12.418278,16 8,16 Z M8,14 C11.3137085,14 14,11.3137085 14,8 C14,4.6862915 11.3137085,2 8,2 C4.6862915,2 2,4.6862915 2,8 C2,11.3137085 4.6862915,14 8,14 Z" id="path-1"></path>
    </defs>
    <g id="Coriolis" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="202-Replica-Executions" transform="translate(-392.000000, -376.000000)">
            <g id="Group-2" transform="translate(360.000000, 240.000000)">
                <g id="Group-3" transform="translate(0.000000, 79.000000)">
                    <g id="Icon/Progress/Darker" transform="translate(32.000000, 57.000000)">
                        <mask id="mask-2" fill="white">
                            <use xlink:href="#path-1"></use>
                        </mask>
                        <g id="Mask"></g>
                        <g id="Group-2" stroke-width="1" fill-rule="evenodd" mask="url(#mask-2)">
                            <circle id="Oval-2-Copy" fill="${bigColor}" cx="8" cy="8" r="8"></circle>
                            <path d="M16,8 C16,3.581722 12.418278,0 8,0 L8,8 L16,8 Z" id="Combined-Shape" fill="${smallColor}"></path>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </g>
</svg>`

export default image
