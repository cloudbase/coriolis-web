class BarChartNiceScale {
  minPoint: number;

  maxPoint: number;

  maxTicks = 10;

  tickSpacing!: number;

  range!: number;

  niceMinimum!: number;

  niceMaximum!: number;

  constructor(min: number, max: number, maxTicks = 10) {
    this.minPoint = min;
    this.maxPoint = max;
    this.maxTicks = maxTicks;
    this.calculate();
  }

  calculate() {
    this.range = this.niceNum(this.maxPoint - this.minPoint, false);
    this.tickSpacing = this.niceNum(this.range / (this.maxTicks - 1), true);
    this.niceMinimum =
      Math.floor(this.minPoint / this.tickSpacing) * this.tickSpacing;
    this.niceMaximum =
      Math.floor(this.maxPoint / this.tickSpacing) * this.tickSpacing;
  }

  niceNum(localRange: number, round: boolean) {
    const exponent = Math.floor(
      Math.log10(localRange)
    ); /** exponent of localRange */
    const fraction =
      localRange / 10 ** exponent; /** fractional part of localRange */
    let niceFraction; /** nice, rounded fraction */

    if (round) {
      if (fraction < 1.5) {
        niceFraction = 1;
      } else if (fraction < 3) {
        niceFraction = 2;
      } else if (fraction < 7) {
        niceFraction = 5;
      } else {
        niceFraction = 10;
      }
    } else if (fraction <= 1) {
      niceFraction = 1;
    } else if (fraction <= 2) {
      niceFraction = 2;
    } else if (fraction <= 5) {
      niceFraction = 5;
    } else {
      niceFraction = 10;
    }

    return niceFraction * 10 ** exponent;
  }

  setMinMaxPoints(localMinPoint: number, localMaxPoint: number) {
    this.minPoint = localMinPoint;
    this.maxPoint = localMaxPoint;
    this.calculate();
  }

  setMaxTicks(localMaxTicks: number) {
    this.maxTicks = localMaxTicks;
    this.calculate();
  }
}

export default BarChartNiceScale;
