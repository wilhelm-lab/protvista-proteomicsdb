import FeatureShape from "protvista-track/src/FeatureShape";

const symbolSize = 10;

export default class FeatureCustomSvgShape extends FeatureShape {
  getFeatureShape(aaWidth, ftHeight, ftLength, shape) {
    this._ftLength = ftLength;
    this._ftHeight = ftHeight;
    this._ftWidth = aaWidth * ftLength;
    this._OSHAPE_SIDE_ID = {
      RIGHT: 0,
      LEFT: 1,
      TOP: 2,
      BOTTOM: 3
    };

    this._OSHAPE_SIDE_TYPE = {
      LINE: 0,
      CURVE_I: 1,
      CURVE_O: 2,
      ONE_EDGE_I: 3,
      ONE_EDGE_O: 4,
      TWO_EDGE_I: 5,
      TWO_EDGE_O: 6
    };

    if (shape.rlShape || shape.tShape || shape.bShape) {
      return this._proteomicsdbShapes(shape);
    }

    if (typeof this["_" + shape] !== "function") {
      shape = "rectangle";
    }
    return this["_" + shape]();
  }

  _triangleTop() {
    return this._triangle();
  }

  _triangleBottom() {
    const centerx = symbolSize / 2;
    const m = this._ftWidth / 2;
    const shape =
      "M" + (-centerx + m) + " 0" + "L" + m + " " + symbolSize + "L" + (centerx + m) + " 0 M " + m + " " + symbolSize;
    return this._ftLength !== 1
      ? shape + "L" + m + " 0" + this._getMiddleLine(centerx, this._ftWidth) + "Z"
      : shape + "Z";
  }

  _triangleRight() {
    const centerx = symbolSize / 2;
    const centery = symbolSize / 2;
    const m = this._ftWidth / 2;
    const shape =
    "M" + (-centerx + m) + " 0" + "L" + (m + centerx) + " " + centery + "L" + (-centerx + m) + " " + symbolSize;
    return this._ftLength !== 1
      ? shape + this._getMiddleLine(centerx, this._ftWidth) + "Z"
      : shape + "Z";
  }

  _triangleLeft() {
    const centerx = symbolSize / 2;
    const centery = symbolSize / 2;
    const m = this._ftWidth / 2;
    const shape =
    "M" + (centerx + m) + " 0" + "L" + (m - centerx) + " " + centery + "L" + (centerx + m) + " " + symbolSize;
    return this._ftLength !== 1
      ? shape + this._getMiddleLine(centerx, this._ftWidth) + "Z"
      : shape + "Z";
  }

  _getMargin(iSize) {
    return this._getCircumscribedRadius(iSize) - iSize / 2;
  }

  _getCircumscribedRadius(iSize) {
    return iSize * Math.sqrt(2) / 2;
  }

  _lineSide(iSideNum, iSize, iCoord0x, iCoord0y) {
    var sPath;
    switch (iSideNum) {
      case this._OSHAPE_SIDE_ID.LEFT:
        sPath = " M" + iCoord0x + " " + (iCoord0y + iSize) + " V" + iCoord0y;
        break;
      case this._OSHAPE_SIDE_ID.RIGHT:
        sPath = " V" + (iCoord0y + iSize);
        break;
      case this._OSHAPE_SIDE_ID.TOP:
        sPath = " H" + (iCoord0x + iSize);
        break;
      case this._OSHAPE_SIDE_ID.BOTTOM:
        sPath = " Z";
        break;
      default:
        throw new RangeError("Error DomainDrawing.lineSide() - sideNum should be between 0 and 3. sideNum=" + iSideNum);
    }
    return sPath;
  }

  /**
 * Create the SVG curve-path for one side of the shape
 * @param {int} iSideNum		the side for which we create the points
 * @param {boolean} bOutward	if true curve outward, else curve inward
 * @param {int} iSize		the length of each side
 * @param {int} iRadius 		the radius of the circle used to define the arc
 * @param {int} iCoord0 		the coordinate of the top left corner of the square shape (iCoord0 = xMin = yMin)
 * @return {String}			the svg path defining one side
 */
  _curveSide(iSideNum, bOutward, iSize, iRadius, iCoord0x, iCoord0y) {
    var sPath;
    switch (iSideNum) {
      case this._OSHAPE_SIDE_ID.LEFT:
        sPath = " M" + iCoord0x + " " + (iCoord0y + iSize) + " A" + iRadius + " " + iRadius + " 0 0 " + +bOutward + " " + iCoord0x + " " + iCoord0y;
        break;
      case this._OSHAPE_SIDE_ID.RIGHT:
        sPath = " A" + iRadius + " " + iRadius + " 0 0 " + +bOutward + " " + (iCoord0x + iSize) + " " + (iCoord0y + iSize);
        break;
      case this._OSHAPE_SIDE_ID.TOP:
        sPath = " A" + iRadius + " " + iRadius + " 0 0 " + +bOutward + " " + (iCoord0x + iSize) + " " + iCoord0y;
        break;
      case this._OSHAPE_SIDE_ID.BOTTOM:
        sPath = " A" + iRadius + " " + iRadius + " 0 0 " + +bOutward + " " + iCoord0x + " " + (iCoord0y + iSize);
        break;
      default:
        throw new RangeError("Error DomainDrawing.curveSide() - sideNum should be between 0 and 3. sideNum=" + iSideNum);
    }
    return sPath;
  }

  /**
 * Create the SVG one-edge path for one side of the shape
 * @param {int} iSideNum 		the side for which we create the points
 * @param {boolean} bOutward 	if true curve outward, else curve inward
 * @param {int} iSize		the length of each side
 * @param {int} iCoord0 		the coordinate of the top left corner of the square shape (iCoord0 = xMin = yMin)
 * @param {int} iMargin 		the interval between the side and the edge
 * @return {String}			the svg path defining one side
 */
  _oneEdgeSide(iSideNum, bOutward, iSize, iCoord0x, iCoord0y, iMargin) {
    var sPath;
    var iCenterY = iCoord0y + iSize / 2;
    var iCenterX = iCoord0x + iSize / 2;
    var iCoordMaxY = iCoord0y + iSize;
    var iCoordMinEdgeX;
    var iCoordMinEdgeY;
    var iCoordMaxEdgeX;
    var iCoordMaxEdgeY;
    if (bOutward) {
      iCoordMinEdgeX = iCoord0x - iMargin; // TODO CHECK
      iCoordMinEdgeY = iCoord0y - iMargin;
      iCoordMaxEdgeX = iCoord0x + iSize + iMargin;
      iCoordMaxEdgeY = iCoord0y + iSize + iMargin;
    } else {
      iCoordMinEdgeX = iCoord0x + iMargin; // TODO CHECK
      iCoordMinEdgeY = iCoord0y + iMargin;
      iCoordMaxEdgeX = iCoord0x + iSize - iMargin;
      iCoordMaxEdgeY = iCoord0y + iSize - iMargin;
    }

    switch (iSideNum) {
      case this._OSHAPE_SIDE_ID.LEFT:
        sPath = " M" + iCoord0x + " " + iCoordMaxY + " L" + iCoordMinEdgeX + " " + iCenterY + " L" + iCoord0x + " " + iCoord0y;
        break;
      case this._OSHAPE_SIDE_ID.RIGHT:
        sPath = " L" + iCoordMaxEdgeX + " " + iCenterY + " L" + (iCoord0x + iSize) + " " + iCoordMaxY;
        break;
      case this._OSHAPE_SIDE_ID.TOP:
        sPath = " L" + iCenterX + " " + iCoordMinEdgeY + " L" + (iCoord0x + iSize) + " " + iCoord0y;
        break;
      case this._OSHAPE_SIDE_ID.BOTTOM:
        sPath = " L" + iCenterX + " " + iCoordMaxEdgeY + " Z";
        break;
      default:
        throw new RangeError("Error DomainDrawing.oneEdgeSide() - sideNum should be between 0 and 3. sideNum=" + iSideNum);
    }
    return sPath;
  }

  /**
 * Create the SVG two-edges path for one side of the shape
 * @param {int} iSideNum 		the side for which we create the points
 * @param {boolean} bOutward 	if true curve outward, else curve inward
 * @param {int} iSize		the length of each side
 * @param {int} iCoord0 		the coordinate of the top left corner of the square shape (iCoord0 = xMin = yMin)
 * @param {int} iMargin 		the interval between the side and the edges
 * @returns {String}		the svg path defining one side
 */
  _twoEdgeSide(iSideNum, bOutward, iSize, iCoord0x, iCoord0y, iMargin) {
    var sPath;
    var iCoordMaxX = iCoord0x + iSize;
    var iCoordMaxY = iCoord0y + iSize;
    var iCoordMinEdgeX;
    var iCoordMinEdgeY;
    var iCoordMaxEdgeX;
    var iCoordMaxEdgeY;
    if (bOutward) {
      iCoordMinEdgeX = iCoord0x - iMargin;
      iCoordMinEdgeY = iCoord0y - iMargin;
      iCoordMaxEdgeX = iCoordMaxX + iMargin;
      iCoordMaxEdgeY = iCoordMaxY + iMargin;
    } else {
      iCoordMinEdgeX = iCoord0x + iMargin;
      iCoordMinEdgeY = iCoord0y + iMargin;
      iCoordMaxEdgeX = iCoordMaxX - iMargin;
      iCoordMaxEdgeY = iCoordMaxY - iMargin;
    }

    var iCoordEdge1X = iCoord0x + iSize / 4;
    var iCoordEdge1Y = iCoord0y + iSize / 4;
    var iCoordEdge2X = iCoordMaxX - iSize / 4;
    var iCoordEdge2Y = iCoordMaxY - iSize / 4;

    switch (iSideNum) {
      case this._OSHAPE_SIDE_ID.LEFT:
        sPath = " M" + iCoord0x + " " + iCoordMaxY + " L" + iCoordMinEdgeX + " " + iCoordEdge2Y + " V" + iCoordEdge1Y + " L" + iCoord0x + " " + iCoord0y;
        break;
      case this._OSHAPE_SIDE_ID.RIGHT:
        sPath = " L" + iCoordMaxEdgeX + " " + iCoordEdge1Y + " V" + iCoordEdge2Y + " L" + iCoordMaxX + " " + iCoordMaxY;
        break;
      case this._OSHAPE_SIDE_ID.TOP:
        sPath = " L" + iCoordEdge1X + " " + iCoordMinEdgeY + " H" + iCoordEdge2X + " L" + iCoordMaxX + " " + iCoord0y;
        break;
      case this._OSHAPE_SIDE_ID.BOTTOM:
        sPath = " L" + iCoordEdge2X + " " + iCoordMaxEdgeY + " H" + iCoordEdge1X + " Z";
        break;
      default:
        throw new RangeError("Error DomainDrawing.twoEdgeSide() - sideNum should be between 0 and 3. sideNum=" + iSideNum);
    }
    return sPath;
  }

  /**
 * Append a line to the oSvg
 * @param {object} oSvg 	the svg in which to append the line
 * @param {string} sColor 	color of the line
 * @param {int} iLength 	length of the line
 * @param {int} iWidth	width of the line
 * @param {int} iYPosition 	y position of the line
 * @param {int} iLeftMargin the left margin
 */
  _drawLine(oSvg, sColor, iLength, iWidth, iYPosition, iLeftMargin) {
    oSvg.append("line")
      .attr("x1", iLeftMargin)
      .attr("y1", iYPosition)
      .attr("x2", iLength + iLeftMargin)
      .attr("y2", iYPosition)
      .style("stroke", sColor)
      .style("stroke-width", iWidth);
  }

  _createPoints(iSideNum, iShapeNum, iSize) {
    var iRadius = this._getCircumscribedRadius(iSize);
    var iMargin = this._getMargin(iSize);
    var iCoord0x = this._ftWidth / 2;
    var iCoord0y = 0;
    var sPath;
    switch (iShapeNum) {
      case this._OSHAPE_SIDE_TYPE.LINE:
        sPath = this._lineSide(iSideNum, iSize, iCoord0x, iCoord0y);
        break;
      case this._OSHAPE_SIDE_TYPE.CURVE_I:
        sPath = this._curveSide(iSideNum, false, iSize, iRadius, iCoord0x, iCoord0y);
        break;
      case this._OSHAPE_SIDE_TYPE.CURVE_O:
        sPath = this._curveSide(iSideNum, true, iSize, iRadius, iCoord0x, iCoord0y);
        break;
      case this._OSHAPE_SIDE_TYPE.ONE_EDGE_I:
        sPath = this._oneEdgeSide(iSideNum, false, iSize, iCoord0x, iCoord0y, iMargin);
        break;
      case this._OSHAPE_SIDE_TYPE.ONE_EDGE_O:
        sPath = this._oneEdgeSide(iSideNum, true, iSize, iCoord0x, iCoord0y, iMargin);
        break;
      case this._OSHAPE_SIDE_TYPE.TWO_EDGE_I:
        sPath = this._twoEdgeSide(iSideNum, false, iSize, iCoord0x, iCoord0y, iMargin);
        break;
      case this._OSHAPE_SIDE_TYPE.TWO_EDGE_O:
        sPath = this._twoEdgeSide(iSideNum, true, iSize, iCoord0x, iCoord0y, iMargin);
        break;
      default:
        throw new RangeError("Error DomainDrawing.createPoints() - shapeNum should be between 0 and 6. numShape=" + iShapeNum);
    }
    return sPath;
  }

  createsPath(iShapeRL, iShapeT, iShapeB, iSize) {
    var sPointsR = this._createPoints(this._OSHAPE_SIDE_ID.RIGHT, iShapeRL, iSize);
    var sPointsT = this._createPoints(this._OSHAPE_SIDE_ID.TOP, iShapeT, iSize);
    var sPointsL = this._createPoints(this._OSHAPE_SIDE_ID.LEFT, iShapeRL, iSize);
    var sPointsB = this._createPoints(this._OSHAPE_SIDE_ID.BOTTOM, iShapeB, iSize);
    var middleLine = this._getMiddleLine(iSize / 2);
    return sPointsL.concat(sPointsT, sPointsR, sPointsB, middleLine);
  }

  _proteomicsdbShapes({
    rlShape,
    tShape,
    bShape,
    scalingFactor = 1.2
  }) {
    return this.createsPath(
      rlShape,
      tShape,
      bShape,
      this._ftHeight * scalingFactor
    );
  }
}
