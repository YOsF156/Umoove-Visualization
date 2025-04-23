import { useEffect, useRef, useState } from "react";

const AnalyzeSppHeatMap = ({ studentId, setMainResults }) => {
  const canvasRef = useRef();
  const canvasRef1 = useRef();
  const [results, setResults] = useState([]);
  const [cellsX, setCellsX] = useState(100);
  const [cellsY, setCellsY] = useState(60);
  const [cellsXs, setCellsXs] = useState(100);
  const [cellsYs, setCellsYs] = useState(60);
  const [done, setDone] = useState(false);
  let canvasWidth = 195;
  let canvasHeight = (cellsY / cellsX) * canvasWidth;
  var heatMapD = [];
  var heatMapS = [];
  let localArray = [];
  let totalRes = [];

  //   const [totalRes, sTotalRes] = useState([]);
  let loadTheData = async () => {
    let req = await fetch(`http://localhost:5000/students/${studentId}`, {
      method: "POST",
    });
    let res = await req.json();
    let newStud = res[0];
    let tempRes = [];
    let decisionThreshold = 2500;
    let rightSaccade = false;
    let leftSaccade = false;
    let traveling = false;
    let finalDesicion = false;
    if (newStud?.questions && newStud?.questions[0]?.eye_data?.length > 0) {
      //if there is any data
      let userRes = {
        1: {},
        2: {},
        3: {},
        4: {},
        5: {},
        6: {},
      };
      newStud?.questions.map((ques, quesIndex) => {
        areasResults = {};
        localArray = [];
        if (quesIndex + 1 > 4) {
          console.log("working");
          for (let i = 0; i < ques.eye_data.length; i++) {
            const element = ques.eye_data[i];
            localArray.push({
              x: element.eye_Data[3],
              y: element.eye_Data[4],
            });
          }
          //
          if (newStud.studentId === "Pilot-Y5WC03" && quesIndex + 1 === 3) {
            console.log("x");
          }
          heatMapD = peekHeatMapCreator(quesIndex);
          // let image = drawTheHeatmap(heatMapD);
          //Judge the areas
          if (
            areasResults.rightTop + areasResults.rightBottom >
            decisionThreshold
          ) {
            rightSaccade = true;
          }

          if (
            areasResults.leftTop + areasResults.leftBottom >
            decisionThreshold
          ) {
            leftSaccade = true;
          }
          if (leftSaccade && rightSaccade) {
            traveling = true;
            finalDesicion = false;
          } else if (leftSaccade || rightSaccade) {
            finalDesicion = true;
          }
          tempRes = [
            ...tempRes,
            {
              // img: image,
              areasResults,
              question: quesIndex,
              desicion: finalDesicion,
              traveling,
            },
          ];
          rightSaccade = false;
          leftSaccade = false;
          traveling = false;
          finalDesicion = false;
        }

        var ctx = canvasRef?.current?.getContext("2d");
        ctx.clearRect(0, 0, ctx.width, ctx.height); //clear canvas
        setDone(true);
        areasResults = {}; //reset
        rightBottom = 0;
        rightTop = 0;
        leftTop = 0;
        leftBottom = 0;
      });
      let userResults = {
        _id: newStud._id,
        studentId: newStud.studentId,
        school: newStud.school,
        results: tempRes,
      };
      setMainResults(userResults);
      tempRes = []; //reset
      localArray = [];
    }
  };

  useEffect(() => {
    loadTheData();
  }, [studentId]);
  var xMin = -0.8;
  var xMax = 0.8;
  var yMin = -0.6;
  var yMax = 0.3;
  let areasResults = {};
  let leftTop = 0;
  let leftBottom = 0;
  let rightTop = 0;
  let rightBottom = 0;
  function peekHeatMapCreator(quesIndex) {
    let centerAvgCounterX = 0;
    let centerAvgX = 0;
    let centerAvgCounterY = 0;
    let centerAvgY = 0;
    let heatMapCounter = [];
    var heatMapD = [];
    let ques5minRange = 95;
    let ques5maxRange = 260;
    let ques6minRange = 130;
    let ques6maxRange = 283;
    let minRange = quesIndex + 1 === 5 ? 95 : quesIndex + 1 === 6 ? 130 : 180;
    let maxRange = quesIndex + 1 === 5 ? 260 : localArray.length;
    // let maxRange = quesIndex === 5 ? localArray.length : localArray.length;
    for (let a = 0; a < cellsY * cellsX; a++) {
      heatMapD.push(0);
      heatMapCounter.push(0);
    }
    var lastLocX = -10;
    var lastLocY = -10;
    let boxSize = 4;
    let lastKnownX;
    let lastKnownY;
    for (let w = 0; w < localArray.length; w++) {
      if (localArray[w].x === -99) {
        if (lastKnownX) {
          localArray[w].x = lastKnownX;
          localArray[w].y = lastKnownY;
        }
      } else {
        lastKnownX = localArray[w].x;
        lastKnownY = localArray[w].y;
      }
      if (Math.abs(localArray[w].x) < 0.25) {
        centerAvgCounterX++;
        centerAvgX += localArray[w].x;
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
      if (w > minRange && w < maxRange) {
        let currentEye = { x: 0, y: 0 };
        if (
          localArray[w].x > -99 &&
          Math.abs(localArray[w].x - centerAvgX) > 0.2
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
    }
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

    let logItOut = false;
    for (let index = 0; index < heatMapCounter.length; index++) {
      let value = heatMapCounter[index];
      if (value > 0) {
        let x = 101;
      }
      let lX = index % cellsX;
      let lY = Math.floor(index / cellsX);
      let xDiff = lX - centerPosX;
      let yDiff = lY - centerPosY;
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
      rightBottom,
      rightTop,
      leftBottom,
      leftTop,
    };
    if (logItOut) {
      // console.log(leftTop, leftBottom, rightTop, rightBottom);
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
    var ctx = canvasRef?.current?.getContext("2d");
    ctx.clearRect(0, 0, ctx.width, ctx.height); //clear canvas
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
    let image = convertCanvasToImage();
    return image;
  }
  function convertCanvasToImage() {
    let image = new Image();
    image.src = canvasRef.current.toDataURL("image/jpeg", 1.0);
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
    }
  }
  const [draw, sDraw] = useState(false);
  return (
    <>
      <div style={{ height: "0px", width: "0px", visibility: "hidden" }}>
        {/* <h4>Heatmap</h4> */}
        {/* 
      <div>
      <p>Rt:{areasResults.rightTop}</p>
      <p>Rb:{areasResults.rightBottom}</p>
      <p>Lt:{areasResults.leftTop}</p>
      <p>Lb:{areasResults.leftBottom}</p>
    </div> */}

        <div style={{ margin: "auto", visibility: "hidden" }}>
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
          ></canvas>
        </div>
      </div>
    </>
  );
};
export default AnalyzeSppHeatMap;
