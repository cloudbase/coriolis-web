// @flow

export default (size: number) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="96px" height="96px" viewBox="0 0 ${96 * (96 / size)} ${96 * (96 / size)}" version="1.1" xmlns:svg="http://www.w3.org/2000/svg"
   xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g stroke-width="2">
      <circle
            r="47"
            cx="48"
            cy="48"
            fill="transparent"
            stroke="#C8CCD7"
          />
        <circle
        r="47"
            cx="48"
            cy="48"
            fill="transparent"
            stroke="#0044CB"
            stroke-dasharray="300 1000"
            stroke-dashoffset="${300 - (25 * 3)}"
        />
    </g>
</svg>`
