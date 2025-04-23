import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { dataContext } from "../../context/manageContext";

const SppHeatMap = ({
  dataArray,
  playIndex,
  eye,
  type,
  bottomLimit,
  eyesReliability,
  mode,
  onProccessDone,
}) => {
  let pfxMethod = type == 'pfx';
  const canvasRef = useRef();
  const canvasRef1 = useRef();
  const [cellsX, setCellsX] = useState(100);
  const [cellsY, setCellsY] = useState(60);
  const [cellsXs, setCellsXs] = useState(100);
  const [cellsYs, setCellsYs] = useState(60);
  const data = useContext(dataContext);
  let canvasWidth = 195;
  let canvasHeight = (cellsY / cellsX) * canvasWidth;
  var heatMapD = [];
  var heatMapS = [];
  let localArray = [];
  useEffect(() => {
    for (let i = 0; i < dataArray.length; i++) {
      let element = dataArray[i];
      element = pfxMethod ? element : element.eye_data
      localArray.push({
        x: element[23],
        y: element[24],
        // x: element.eye_Data[eye === 1 ? 8 : 10],
        // y: element.eye_Data[eye === 1 ? 9 : 11],
      });
    }
    localArray = localArray.slice(bottomLimit || 0, playIndex);
    heatMapD = peekHeatMapCreator();
    drawTheHeatmap(heatMapD);
    if (mode !== "analyze") {
      heatMapS = standardHeatMapCreator();
      drawTheStandardHeatmap(heatMapS);
    }
  }, [playIndex]);
  var xMin = -0.8;
  var xMax = 0.8;
  var yMin = -0.6;
  var yMax = 0.3;
  let areasResults = {};
  function peekHeatMapCreator() {
    let centerAvgCounterX = 0;
    let centerAvgX = 0;
    let centerAvgCounterY = 0;
    let centerAvgY = 0;
    let heatMapCounter = [];
    for (let a = 0; a < cellsY * cellsX; a++) {
      heatMapD.push(0);
      heatMapCounter.push(0);
    }
    var lastLocX = -10;
    var lastLocY = -10;

    let boxSize = 4;
    let useLastKnownData = false;
    let lastKnownX;
    let lastKnownY;

    for (let w = 0; w < localArray.length; w++) {
      if (useLastKnownData) {
        //Handle data with -99
        if (localArray[w].x === -99) {
          if (lastKnownX) {
            localArray[w].x = lastKnownX;
            localArray[w].y = lastKnownY;
          }
        } else {
          lastKnownX = localArray[w].x;
          lastKnownY = localArray[w].y;
        }
      }
      //
      if (Math.abs(localArray[w].x) < 0.25) {
        centerAvgCounterX++;
        centerAvgX += localArray[w].x;
        console.log("avg", centerAvgX);

        centerAvgCounterY++;
        centerAvgY += localArray[w].y;
      }
    }
    centerAvgX /= centerAvgCounterX;
    centerAvgY /= centerAvgCounterY;
    let centerAvgs = { x: 0, y: 0 };
    centerAvgs.x = Math.round(
      ((centerAvgX - xMin) / (xMax - xMin)) * (cellsX - 1)
    );
    centerAvgs.y = Math.round(
      ((centerAvgY - yMin) / (yMax - yMin)) * (cellsY - 1)
    );
    //calc center
    let centerPosX =
      centerAvgs.x < 0 ? 0 : centerAvgs.x >= cellsX ? cellsX - 1 : centerAvgs.x;
    let centerPosY =
      centerAvgs.y < 0 ? 0 : centerAvgs.y >= cellsY ? cellsY - 1 : centerAvgs.y;
    // let centerPos = centerPosY * cellsX + centerPosX;
    //
    // console.log("eyeDataArray", localArray);
    for (let w = 0; w < localArray.length; w++) {
      let currentEye = { x: 0, y: 0 };
      if (
        localArray[w].x > -99 &&
        Math.abs(localArray[w].x - centerAvgX) > 0.15
      ) {
        currentEye.x = Math.round(
          ((localArray[w].x - xMin) / (xMax - xMin)) * (cellsX - 1)
        );
        currentEye.y = Math.round(
          ((localArray[w].y - yMin) / (yMax - yMin)) * (cellsY - 1)
        );
        let locX =
          currentEye.x < 0
            ? 0
            : currentEye.x >= cellsX
              ? cellsX - 1
              : currentEye.x;
        let locY =
          currentEye.y < 0
            ? 0
            : currentEye.y >= cellsY
              ? cellsY - 1
              : currentEye.y;

        let pos = locY * cellsX + locX;

        // if (locX == lastLocX && locY == lastLocY) {
        //   //1D array
        //   heatMapD[pos] -= 20;
        //   heatMapD[pos] = heatMapD[pos] < 0 ? 0 : heatMapD[pos];
        // } else if (w < localArray.length - 5) {
        //1D array
        // heatMapD[pos] += 1;

        for (let j = -boxSize; j <= boxSize; j++) {
          for (let i = -boxSize; i <= boxSize; i++) {
            const p = getOneDPos(locX + i, locY + j, cellsX);
            if (p >= 0 && p < cellsX * cellsY) {
              if (Math.abs(i) < 3 && Math.abs(j) < 3) {
                heatMapD[p] += boxSize + 1;
                heatMapD[p] = Math.min(heatMapD[p], (boxSize + 1) * 15);
              }
              // heatMapCounter[p] += (((boxSize+1) - Math.abs(i)) +((boxSize+1) - Math.abs(j)))/2;
              heatMapCounter[p] += boxSize + 1;
            }
          }
        }
        // }
        lastLocX = locX;
        lastLocY = locY;
      }
    }
    console.log("avg", centerAvgX);
    //
    let sppMin = 5 * (boxSize + 1);
    let sppMax = 10 * (boxSize + 1);
    let sppGone = 20 * (boxSize + 1);
    let stepUp = 255 / sppMin;
    let stepDown = 255 / (sppGone - sppMax);

    for (let index = 0; index < heatMapCounter.length; index++) {
      const element = heatMapD[index];
      heatMapD[index] =
        element > sppMax ? element - (element - sppMax) * stepDown : element;
      heatMapD[index] = Math.max(
        0,
        heatMapD[index] - heatMapCounter[index] * 0.3
      );
      //heatMapD[index] =  element <= sppMax ?  Math.min(255, element * stepUp) : Math.max(0, 255 - (element - sppMax)*stepDown);
      heatMapD[index] *= 5;
    }
    let leftTop = 0;
    let leftBottom = 0;
    let rightTop = 0;
    let rightBottom = 0;
    let logItOut = true;

    for (let index = 0; index < heatMapCounter.length; index++) {
      let value = heatMapCounter[index];
      if (value > 0) {
        let x = 101;
      }
      let lX = index % cellsX;
      let lY = Math.floor(index / cellsX);
      let xDiff = lX - centerPosX;
      let yDiff = lY - centerPosY;
      if (index > 100) {
        ///
        let y = 1;
      }
      let higherNum = 0;
      let lowerNum = 0;
      if (xDiff >= higherNum && yDiff >= higherNum) {
        //right Bottom
        rightBottom += value;
      } else if (xDiff >= higherNum && yDiff < lowerNum) {
        //right top
        rightTop += value;
      } else if (xDiff < lowerNum && yDiff < lowerNum) {
        //left top
        leftTop += value;
      } else if (xDiff < lowerNum && yDiff >= higherNum) {
        //left bottom
        leftBottom += value;
      }
    }
    areasResults = {
      ...areasResults,
      rightBottom,
      rightTop,
      leftBottom,
      leftTop,
    };
    if (logItOut) {
      console.log(
        "LT",
        leftTop,
        "LB",
        leftBottom,
        "RT",
        rightTop,
        "RB",
        rightBottom
      );
    }
    return heatMapD;
  }

  function getOneDPos(x, y, w) {
    return y * w + x;
  }
  function standardHeatMapCreator() {
    for (let a = 0; a < cellsYs * cellsXs; a++) heatMapS.push(0);

    //console.log("eyeDataArray", localArray);
    for (let w = 0; w < localArray.length; w++) {
      let currentEye = { x: 0, y: 0 };
      if (localArray[w].x > -99) {
        currentEye.x = Math.round(
          ((localArray[w].x - xMin) / (xMax - xMin)) * (cellsXs - 1)
        );
        currentEye.y = Math.round(
          ((localArray[w].y - yMin) / (yMax - yMin)) * (cellsYs - 1)
        );

        let locX =
          currentEye.x < 0
            ? 0
            : currentEye.x >= cellsXs
              ? cellsXs - 1
              : currentEye.x;
        let locY =
          currentEye.y < 0
            ? 0
            : currentEye.y >= cellsYs
              ? cellsYs - 1
              : currentEye.y;

        let pos = locY * cellsXs + locX;

        //1D array
        heatMapS[pos] += 200;
      }
    }
    return heatMapS;
  }
  function drawTheHeatmap(mHeatmap) {
    let cellWidth = Math.round(canvasWidth / cellsX);
    let cellHeight = Math.round(canvasHeight / cellsY);

    var ctx = canvasRef.current.getContext("2d");
    let colr = 255;
    let posX = 0;
    let posY = 0;
    // Fill with gradient
    for (let i = 0; i < cellsX * cellsY; i++) {
      colr = /*255 -*/ Math.min(255, mHeatmap[i]);
      ctx.fillStyle = "rgb(" + colr + "," + colr + "," + colr + ")";
      ctx.fillRect(posX * cellWidth, posY * cellHeight, cellWidth, cellHeight);
      posX++;
      if (posX == cellsX) {
        posX = 0;
        posY++;
      }
    }
  }
  function convertCanvasToImage(canvas) {
    let image = new Image();
    image.src = canvas.toDataURL();
    return image;
  }
  function drawTheStandardHeatmap(mHeatmap) {
    let cellWidth = Math.round(canvasWidth / cellsXs);
    let cellHeight = Math.round(canvasHeight / cellsYs);

    var ctx = canvasRef1.current.getContext("2d");
    let colr = 255;
    let posX = 0;
    let posY = 0;
    // Fill with gradient
    for (let i = 0; i < cellsXs * cellsYs; i++) {
      colr = /*255 -*/ Math.min(255, mHeatmap[i]);
      ctx.fillStyle = "rgb(" + colr + "," + colr + "," + colr + ")";
      ctx.fillRect(posX * cellWidth, posY * cellHeight, cellWidth, cellHeight);
      posX++;
      if (posX == cellsXs) {
        posX = 0;
        posY++;
      }
      if (i === 100) {
        // console.log(convertCanvasToImage(ctx));
      }
    }
  }
  // For cellsX use 10 for cellsY use 6 and eyeDataArray you send either the preEyeData or the postEyeData
  let dataInfo;
  if (!pfxMethod) {
    dataInfo = dataArray[playIndex].eye_Data;
  } else {
    dataInfo = dataArray[playIndex];
  }
  let UMFace = dataInfo[pfxMethod ? 2 : 0];
  let UM_faceX = dataInfo[pfxMethod ? 9 : 1];
  let UM_faceY = dataInfo[pfxMethod ? 10 : 2];
  let UM_Diam = dataInfo[pfxMethod ? 14 : 6];
  let UMReliability = dataInfo[pfxMethod ? 7 : 0];
  console.log("🚀 ~ file: SppHeatMap.js:336 ~ dataInfo:", dataInfo)
  let UMirisPixFiltered = eye === 1 ? { x: dataInfo[pfxMethod ? 17 : 15], y: dataInfo[pfxMethod ? 18 : 16] } : { x: dataInfo[pfxMethod ? 15 : 9], y: dataInfo[pfxMethod ? 16 : 10] }
  return (
    <div
      style={{
        border: "3px solid black",
        borderRadius: "10px",
        padding: "4px",
      }}
    >
      <h4 style={{ margin: "auto", width: "fit-content" }}>
        {eye === 1 ? "left" : "right"}:
      </h4>
      <ul>
        <li>Face state: {UMFace}</li>
        <li>
          Reliability:{" "}
          {UMReliability}
          {/* {eye === 1 ? eyesReliability.left : eyesReliability.right} */}
        </li>
        {/* <li>
          Eye:
          {`{

            ${dataInfo[eye === 1 ? 8 : 10]
              .toString()
              .slice(0, 5)}
          ,
          ${dataInfo[eye === 1 ? 9 : 11]
            .toString()
            .slice(0, 5)}
          }`}
        </li> */}

        <li>
          Face:
          {`{

${Number(UM_faceX).toFixed(1)}
,
${Number(UM_faceY).toFixed(1)}
}`}
        </li>
        <li>
          eye:
          {`{

 ${Number(UMirisPixFiltered.x).toFixed(1)}
,
 ${Number(UMirisPixFiltered.y).toFixed(1)}
}`}
        </li>
        <li>Diam: {UM_Diam}</li>
      </ul>
      <div style={{ margin: "auto" }}>
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
        ></canvas>
        <br />
        <canvas
          ref={canvasRef1}
          width={canvasWidth}
          height={canvasHeight}
        ></canvas>
      </div>
    </div>
  );
};
export default SppHeatMap;
