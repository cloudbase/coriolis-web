export default (whiteTheme?: boolean) => `
  <svg width="32px" height="32px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g>
      <circle fill="none" stroke="${
        whiteTheme ? "white" : "#C8CCD7"
      }" stroke-width="1.5"  cx="16" cy="16" r="15"></circle>
      <path d="M 31 16 A 15 15 0 0 0 16 1" fill="none" stroke="#0044CB" stroke-width="1.5" />
    </g>
  </svg>
`;
