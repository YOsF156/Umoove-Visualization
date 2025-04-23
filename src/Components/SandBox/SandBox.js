import { useContext, useEffect, useRef, useState } from "react";
import "./SandBox.css";
import plusIcon from "../../assets/images/plus.png";
import plusRedIcon from "../../assets/images/plus red.png";
import { clear } from "@testing-library/user-event/dist/clear";
import Controls from "../Controls/Controls";
import { mainDataArray } from "../../files/try";
import SppHeatMap from "../SppHeatMap/SppHeatMap";
import { dataContext } from "../../context/manageContext";
const Sandbox = ({ type = "" }) => {
  let pfxMethod = type == "pfx";
  let showCombined = true;
  const data = useContext(dataContext);
  const sandBoxRef = useRef();
  const leftEyeCenterRef = useRef();
  const rightEyeCenterRef = useRef();
  const combinedEyeCenterRef = useRef();
  const combinedWrapRef = useRef();
  const wrapLeftRef = useRef();
  const wrapRightRef = useRef();
  const [pxToCm, setPxToCm] = useState(1);
  const [eyesLoc, setEyeLoc] = useState(null);
  const [sandBoxWidth, setSandboxWidth] = useState();
  const [sandBoxHeight, setSandboxHeight] = useState();
  const [dataArray, setDataArray] = useState([]);
  const [timeGap, setTimeGap] = useState(0);
  const [playState, setPlayState] = useState(false);
  const [playIndex, setPlayIndex] = useState(0);
  let indexRef = useRef();
  indexRef.current = playIndex;
  const [eyeWidth, setEyeWidth] = useState(30);
  const [wrapWidth, setWrapWidth] = useState(30);
  const [leftEyeX, setLeftEyeX] = useState(55);
  const [leftEyeY, setLeftEyeY] = useState(72);
  const [rightEyeX, setRightEyeX] = useState(55);
  const [rightEyeY, setRightEyeY] = useState(72);
  const [combinedEyeNotVisible, setCombinedEyeNotVisible] = useState(false);
  const [combinedEyeX, setCombinedEyeX] = useState(72);
  const [combinedEyeY, setCombinedEyeY] = useState(72);
  const [trackFace, setTrackFace] = useState(false);
  const [faceX, setfaceEyeX] = useState(55);
  const [faceY, setFaceY] = useState(72);
  const [leftEyeNotVisible, setLeftEyeNotVisible] = useState(false);
  const [rightEyeNotVisible, setRightEyeNotVisible] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [initialGap, setInitialGap] = useState(data.cmMode ? 0 : -100);
  const [eyesReliability, setEyesReliability] = useState({ left: 0, right: 0 });
  const [questionNum, setQuestionNum] = useState(1);
  const [topLimit, setTopLimit] = useState(false);
  const [bottomLimit, setBottomLimit] = useState(0);
  const [intervalSpeed, setIntervalSpeed] = useState(10);
  let faceState;
  let UM_leftEyeX;
  let UM_leftEyeY;
  let UM_rightEyeX;
  let UM_rightEyeY;
  let UM_combinedEyeX;
  let UM_combinedEyeY;
  let UM_faceX;
  let UM_faceY;
  let gap;
  let positions = {
    pfx: {
      LogId: 0,
      UM_combinedEyeX: 23,
      UM_combinedEyeY: 24,
      faceState: 2,
      UM_leftEyeX: 3,
      UM_leftEyeY: 4,
      UM_rightEyeX: 5,
      UM_rightEyeY: 6,
      UM_faceX: 9,
      UM_faceY: 10,
    },
  };

  useEffect(() => {
    // console.log("data", data.data);
  }, []);
  let changeQuestionNum = (type) => {
    stopInterval();
    if (type === "next") {
      if (questionNum < data.data?.questions?.length) {
        setQuestionNum((prev) => prev + 1);
        setPlayIndex(0);
        setDataArray(data.data.questions[questionNum].eye_data);
        setTopLimit(data.data.questions[questionNum].eye_data.length);
      }
    } else if (type === "prev") {
      if (questionNum > 1) {
        setQuestionNum((prev) => prev - 1);
        setPlayIndex(0);
        setDataArray(data.data.questions[questionNum].eye_data);
        setTopLimit(data.data.questions[questionNum].eye_data.length);
      }
    }
  };
  let index = 0;
  let playTheData = (type = undefined) => {
    // if (!mainmainDataArray) {
    //   setmainmainDataArray(mainDataArray.eye_data);
    // }
    if (!index) {
      index = playIndex;
    }
    if (type && type !== "once" && type !== "reset") {
      setPlayState(true);
    }
    if (type && type === "reset") {
      index = 0;
    }
    if (topLimit) {
      if (index >= topLimit - 1) {
        stopInterval();
        // index = 0;
      }
    } else if (index >= dataArray.length - 1) {
      stopInterval();
      // index = 0;
    }
    //Use umoove data by Matt's data
    if (data.selectedMethod !== "pfx") {
      gap = dataArray[index].timestamp - dataArray[0].timestamp;
      setTimeGap(gap);
      faceState = dataArray[index].eye_Data[0] === 2;
      UM_leftEyeX = dataArray[index].eye_Data[data.cmMode ? 8 : 14];
      UM_leftEyeY = dataArray[index].eye_Data[data.cmMode ? 9 : 15];
      UM_rightEyeX = dataArray[index].eye_Data[data.cmMode ? 10 : 16];
      UM_rightEyeY = dataArray[index].eye_Data[data.cmMode ? 11 : 17];
      UM_combinedEyeX = dataArray[index].eye_Data[3];
      UM_combinedEyeY = dataArray[index].eye_Data[4];
      UM_faceX = dataArray[index].eye_Data[1];
      UM_faceY = dataArray[index].eye_Data[2];
      //reliability
      setEyesReliability({
        left: dataArray[index].eye_Data[12],
        right: dataArray[index].eye_Data[13],
      });

      //Diam
      if (!data.cmMode) {
        setEyeWidth(dataArray[index]?.eye_Data[6]);
      }
    } else {
      faceState = dataArray[index][2] === 2;
      UM_leftEyeX = dataArray[index][data.cmMode ? 15 : 3];
      UM_leftEyeY = dataArray[index][data.cmMode ? 16 : 4];
      UM_rightEyeX = dataArray[index][data.cmMode ? 17 : 5];
      UM_rightEyeY = dataArray[index][data.cmMode ? 18 : 6];
      UM_combinedEyeX = dataArray[index][23];
      UM_combinedEyeY = dataArray[index][24];
      UM_faceX = dataArray[index][9];
      UM_faceY = dataArray[index][10];
      if (!data.cmMode) {
        setEyeWidth(parseFloat(dataArray[index][14]));
      }
    }
    if (!type) {
      index++;
    }

    setPlayIndex(index);

    //usage

    if (!data.cmMode) {
      let factW = (sandBoxRef.current.clientWidth / 960) * 1;
      let factH = (sandBoxRef.current.clientHeight / 720) * 1;
      //px mode
      //left eye
      if (UM_leftEyeX === -99 || UM_leftEyeY === -99) {
        setLeftEyeNotVisible(true);
      } else {
        setLeftEyeX(UM_leftEyeX * factW);
        setLeftEyeY(UM_leftEyeY * factH);
        setLeftEyeNotVisible(false);
      }
      //right eye
      if (UM_rightEyeX === -99 || UM_rightEyeY === -99) {
        setRightEyeNotVisible(true);
      } else {
        setRightEyeX(UM_rightEyeX * factW);
        setRightEyeY(UM_rightEyeY * factH);
        setRightEyeNotVisible(false);
      }
      //Face
      if (UM_faceX === -99 || UM_faceY === -99) {
        setTrackFace(true);
      } else {
        setfaceEyeX(UM_faceX * factW);
        setFaceY(UM_faceY * factH);
        setTrackFace(false);
      }
    } else {
      //cm mode
      //left eye
      if (UM_leftEyeX === -99 || UM_leftEyeY === -99) {
        setLeftEyeNotVisible(true);
      } else {
        let newX = eyesLoc?.left?.x + UM_leftEyeX * pxToCm;
        setLeftEyeX(newX);
        let newY = eyesLoc?.left?.y + UM_leftEyeY * pxToCm;
        setLeftEyeY(newY);
        setLeftEyeNotVisible(false);
      }
      //right eye
      if (UM_rightEyeX === -99 || UM_rightEyeY === -99) {
        setRightEyeNotVisible(true);
      } else {
        let newX = eyesLoc?.right?.x + UM_rightEyeX * pxToCm;
        setRightEyeX(newX);
        let newY = eyesLoc?.right?.y + UM_rightEyeY * pxToCm;
        setRightEyeY(newY);
        setRightEyeNotVisible(false);
      }
      //combined eye
      if (UM_combinedEyeX === -99 || UM_combinedEyeY === -99) {
        setCombinedEyeNotVisible(true);
      } else {
        let newX = UM_combinedEyeX;
        setCombinedEyeX(newX);
        let newY = UM_combinedEyeY;
        setCombinedEyeY(newY);
        setCombinedEyeNotVisible(false);
      }
    }
    //
  };
  let interId;
  let startInterval = () => {
    setPlayState(true);
    if (!index) {
      index = 0;
    }
    if (!interId) {
      interId = setInterval(() => {
        playTheData();
      }, intervalSpeed);
      setIntervalId(interId);
    } else {
      debugger;
    }
  };
  const stopInterval = () => {
    console.log("interval id cleated", intervalId);
    clearInterval(interId);
    clearInterval(intervalId);
    setPlayState(false);
    // setIntervalId(false);
  };
  function updateFactor() {
    setEyeLoc({
      left: {
        x:
          leftEyeCenterRef.current.offsetLeft +
          leftEyeCenterRef.current.clientWidth / 2,
        y:
          leftEyeCenterRef.current.offsetTop +
          leftEyeCenterRef.current.clientHeight / 2,
      },
      right: {
        x:
          rightEyeCenterRef.current.offsetLeft +
          rightEyeCenterRef.current.clientWidth / 2,
        y:
          rightEyeCenterRef.current.offsetTop +
          rightEyeCenterRef.current.clientHeight / 2,
      },
      combined: {
        x:
          combinedEyeCenterRef.current.offsetLeft +
          combinedEyeCenterRef.current.clientWidth / 2,
        y:
          combinedEyeCenterRef.current.offsetTop +
          combinedEyeCenterRef.current.clientHeight / 2,
      },
    });
    let fact =
      Math.abs(
        leftEyeCenterRef.current.offsetLeft -
        rightEyeCenterRef.current.offsetLeft
      ) / 6.5;
    if (data.cmMode) {
      // setFace;
    }
    setEyeWidth(fact * 1.18);
    setWrapWidth(fact * 2);
    setPxToCm(fact);
  }
  useEffect(() => {
    if (data.cmMode) {
      updateFactor();
    }

    let dataInfo;
    if (type !== "pfx") {
      dataInfo = data.data?.questions[0].eye_Data;
    } else {
      dataInfo = data.data;
    }
    setDataArray(dataInfo);
    setTopLimit(dataInfo.length);
    setSandboxHeight(sandBoxRef.current.clientHeight);
    setSandboxWidth(sandBoxRef.current.clientWidth);
    setInitialGap(-(sandBoxRef.current.clientWidth / 2));
    console.log("titles", data.pfxStateLog);
  }, []);
  useEffect(() => {
    //check Location
    if (eyesLoc) {
      if (
        eyesLoc.left.x !==
        leftEyeCenterRef.current.offsetLeft +
        leftEyeCenterRef.current.clientWidth / 2
      ) {
        updateFactor();
      }
    }
  });
  console.log(dataArray)
  return (
    <>
      <div
        className="top"
        style={{ display: "flex", justifyContent: "space-around" }}
      >
        <div style={{ width: "20%" }}>
          {pfxMethod && dataArray[playIndex] && (
            <div>
              <div
                style={{
                  border: "1px solid black",
                  padding: "10px",
                  minWidth: "120px",
                }}
              >
                <h3>Eye data:</h3>
                <br />
                <div>
                  Log id: {dataArray[playIndex][positions.pfx.LogId] || -1}
                </div>
                <div>
                  Face state:{" "}
                  {dataArray[playIndex][positions.pfx.faceState] || -1}
                </div>
                <div>
                  eye:{" "}
                  {dataArray[playIndex][positions.pfx.UM_combinedEyeX]
                    ?.toString()
                    .slice(0, 5) || -1}
                  ,
                  {dataArray[playIndex][positions.pfx.UM_combinedEyeY]
                    ?.toString()
                    .slice(0, 5) || -1}
                </div>
                <div>
                  face:{" "}
                  {dataArray[playIndex][positions.pfx.UM_faceX]
                    ?.toString()
                    .slice(0, 5) || -1}
                  ,
                  {dataArray[playIndex][positions.pfx.UM_faceY]
                    ?.toString()
                    .slice(0, 5) || -1}
                </div>
              </div>
              <br />

            </div>
          )}
        </div>

        {/* {!pfxMethod && ( */}
        <div className="canvases-container" style={{ border: "3px solid white" }}>
          {dataArray.length > 0 && (
            <SppHeatMap
              type={type}
              eyesReliability={eyesReliability}
              eye={1}
              dataArray={dataArray}
              playIndex={playIndex}
              bottomLimit={bottomLimit}
              style={{ margin: "auto" }}
            />
          )}
        </div>

        <div className="visualizationDiv" ref={sandBoxRef}>
          <div
            className="eye"
            id="leftEye"
            style={{
              left: leftEyeX - eyeWidth / 2 + "px",
              top: leftEyeY - eyeWidth / 2 + "px",
              height: eyeWidth,
              width: eyeWidth,
              border: "1px solid",
              borderColor:
                leftEyeNotVisible && data.cmMode
                  ? "white"
                  : !data.cmMode && leftEyeNotVisible
                    ? "red"
                    : "white",
              visibility:
                leftEyeNotVisible && data.cmMode ? "hidden" : "visible",
            }}
          ></div>
          <div
            id="leftEyeWrap"
            ref={wrapLeftRef}
            style={{
              left:
                eyesLoc?.left?.x - wrapLeftRef.current?.clientWidth / 2 + "px",
              top: eyesLoc?.left?.y - wrapWidth / 3 + "px",
              height: wrapWidth / 2,
              width: wrapWidth,
              border: "1px solid",
              borderColor: leftEyeNotVisible ? "red" : "white",
            }}
          ></div>
          <div
            className="eye"
            id="rightEye"
            style={{
              left: rightEyeX - eyeWidth / 2 + "px",
              top: rightEyeY - eyeWidth / 2 + "px",
              height: eyeWidth,
              width: eyeWidth,
              border: "1px solid",
              borderColor:
                rightEyeNotVisible && data.cmMode
                  ? "white"
                  : !data.cmMode && rightEyeNotVisible
                    ? "red"
                    : "white",
              visibility:
                rightEyeNotVisible && data.cmMode ? "hidden" : "visible",
            }}
          ></div>
          <div
            id="rightEyeWrap"
            ref={wrapRightRef}
            style={{
              left:
                eyesLoc?.right?.x -
                wrapRightRef.current?.clientWidth / 2 +
                "px",
              top: eyesLoc?.right?.y - wrapWidth / 3 + "px",
              width: wrapWidth,
              height: wrapWidth / 2,
              border: "1px solid",
              borderColor: rightEyeNotVisible ? "red" : "white",
            }}
          ></div>

          {data.cmMode && (
            <div
              className="eyeCenter "
              id="leftEyeCenter"
              ref={leftEyeCenterRef}
            >
              x
            </div>
          )}

          {data.cmMode && (
            <div
              className="eyeCenter "
              id="rightEyeCenter"
              ref={rightEyeCenterRef}
            >
              x
            </div>
          )}
          {data.cmMode && showCombined && (
            <div
              id="combinedWrap"
              ref={combinedWrapRef}
              style={{
                left:
                  eyesLoc?.combined?.x -
                  combinedWrapRef.current?.clientWidth / 2 +
                  "px",
                top: eyesLoc?.combined?.y - wrapWidth / 3 + "px",
                width: wrapWidth,
                height: wrapWidth / 2,
                border: "1px solid",
                borderColor: combinedEyeNotVisible ? "red" : "white",
              }}
            ></div>
          )}
          {data.cmMode && showCombined && (
            <div
              className="eye"
              id="combinedEye"
              style={{
                zIndex: 100,
                left: (combinedEyeX - eyeWidth / 2).toFixed(0) + "px",
                top: (combinedEyeY - eyeWidth / 2).toFixed(0) + "px",
                height: eyeWidth,
                width: eyeWidth,
                border: "4px solid",
                borderColor:
                  combinedEyeNotVisible && data.cmMode
                    ? "blue"
                    : !data.cmMode && combinedEyeNotVisible
                      ? "red"
                      : "blue",
                visibility:
                  combinedEyeNotVisible && data.cmMode ? "hidden" : "visible",
              }}
            ></div>
          )}
          {data.cmMode && showCombined && (
            <div
              className="eyeCenter "
              id="combinedEyeCenter"
              ref={combinedEyeCenterRef}
            >
              c
            </div>
          )}
          {!data.cmMode && (
            <div
              className="faceCenter"
              style={{
                left: faceX - eyeWidth / 2 + "px",
                top: faceY - eyeWidth / 2 + "px",
                height: eyeWidth,
                width: eyeWidth,
                border: '10px solid white'
              }}
            >
              <img
                src={trackFace ? plusIcon : plusRedIcon}
                style={{ height: "100%", width: "100%" }}
              />
            </div>
          )}
          <ul style={{ color: "white", position: "absolute", bottom: "10px" }}>
            <li>
              eyeData:
              {/* {dataArray[playIndex]?.eye_Data[8].toString().slice(0, 5)},
              {dataArray[playIndex]?.eye_Data[9].toString().slice(0, 5)}, right:
              {dataArray[playIndex]?.eye_Data[10].toString().slice(0, 5)},
              {dataArray[playIndex]?.eye_Data[11].toString().slice(0, 5)},<br /> */}
            </li>
          </ul>
        </div>
        {!pfxMethod && (
          <div style={{ border: "3px solid white" }}>
            <SppHeatMap
              eye={2}
              eyesReliability={eyesReliability}
              dataArray={dataArray}
              playIndex={playIndex}
              bottomLimit={bottomLimit}
              style={{ margin: "auto" }}
            />
          </div>
        )}

        <div style={{ width: "20%", border: '1px solid ', maxHeight: '75vh', overflowY: 'auto' }}>
          {data.pfxStateLog && (
            <div style={{ width: "98%" }}>
              <div style={{ width: "100%", }}>
                State log data:
                <table>
                  {dataArray[playIndex] && data.pfxStateLogTitles.map((t, ind) => {
                    return (
                      <tr>
                        {t} :
                        {
                          data.pfxStateLog[
                          Math.max(0, dataArray[playIndex][positions.pfx.LogId] - 1)
                          ][ind]
                        }
                        {t == "Time" && console.log(data.pfxStateLog[
                          Math.max(0, dataArray[playIndex][positions.pfx.LogId] - 1)
                        ][ind])}
                      </tr>
                    );
                  })}
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ display: "flex" }}>
        <Controls
          setTopLimit={(e) => {
            if (e < dataArray.length && e > 0 ? e : dataArray.length)
              setTopLimit(e);
          }}
          intervalSpeed={intervalSpeed}
          setIntervalSpeed={(speed) => {
            clearInterval(intervalId);
            setIntervalSpeed(speed);
            playTheData();
          }}
          bottomLimit={bottomLimit}
          topLimit={topLimit}
          changeQuestionNum={
            type !== "pfx"
              ? (type = "next") => changeQuestionNum(type)
              : () => {
                console.log("no ques data");
              }
          }
          questionNum={questionNum}
          dataArray={dataArray}
          play={startInterval}
          stop={stopInterval}
          timeGap={timeGap}
          changePlayIndex={(e, type = undefined) => {
            // console.log("change");
            if (type) {
              if (type === "backward") {
                if (e > 9) {
                  if (playIndex - e > 0) {
                    index = playIndex - e;
                    playTheData("once");
                  }
                } else {
                  if (playIndex - e > 0) {
                    index = playIndex - e;
                    playTheData("once");
                  }
                }
              } else if (type === "forward") {
                index = playIndex + e;
                playTheData("once");
              } else if (type === "reset") {
                setPlayIndex(0);
                playTheData("reset");
                setTopLimit(dataArray.length);
                setBottomLimit(0);
              } else if (type === "free") {
                // console.log("e", e);
                index = e > 0 ? e - 1 : 0;
                setBottomLimit(e);
                playTheData();
              }
            } else {
              index = 0;
              playTheData();
              // setPlayIndex(e);
            }
          }}
          playIndex={playIndex}
          playState={playState}
        />
      </div>
    </>
  );
};
export default Sandbox;
