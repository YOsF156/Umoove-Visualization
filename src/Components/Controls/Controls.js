import { useContext, useEffect, useRef, useState } from "react";
import SppHeatMap from "../SppHeatMap/SppHeatMap";
import "./Controls.css";
import Graph from "../Graph/Graph";
import { Line } from "react-chartjs-2";
import { CategoryScale, Chart } from "chart.js";
import { dataContext } from "../../context/manageContext";
Chart.register(CategoryScale);

const Controls = ({
  playState,
  playIndex,
  play,
  stop,
  dataArray,
  changeQuestionNum,
  questionNum,
  changePlayIndex,
  timeGap,
  setTopLimit,
  topLimit,
  bottomLimit,
  intervalSpeed,
  setIntervalSpeed,
}) => {
  let data = useContext(dataContext);
  let plusRef = useRef();
  let minusRef = useRef();
  const [showData, setShowData] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [diamArrayFull, setDiamArrayFull] = useState([]);
  const [currentPoint, setCurrentPoint] = useState({ x: 0, y: 0 });
  let handleMouseDown = (type = undefined) => {
    changePlayIndex(1, "forward");
  };

  useEffect(() => {
    if (dataArray[playIndex]) {
      setCurrentPoint({
        x: dataArray[playIndex].eye_Data[3],
        y: dataArray[playIndex].eye_Data[4],
      });
    }
  }, []);
  let handleKeyPress = (e) => {
    // switch (e.code) {
    //   case "KeyP":
    //     if (!playState) {
    //       play();
    //     }
    //     break;
    //   case "KeyO":
    //     if (playState) {
    //       stop();
    //     }
    //     break;
    //   case "ArrowLeft":
    //     if (playIndex > 1) {
    //       changePlayIndex(1, "backward");
    //     }
    //     break;
    //   case "ArrowRight":
    //     changePlayIndex(1, "forward");
    //     break;
    //   default:
    //     break;
    // }
  };
  let leftX = [];
  let rightX = [];
  let leftY = [];
  let rightY = [];
  // let diamArr = [];
  let lab = [];
  const [arrLoaded, setArr] = useState(false);
  useEffect(() => {
    console.log("data", dataArray);
    // window.document.addEventListener("keydown", (e) => handleKeyPress(e));
    // dataArray=dataArray.slice(0,playIndex+3);
    console.log("dr", dataArray);
    dataArray.map((el) => {
      let element = el.eye_Data;
      if(element){
        if (element[8]||0 > -99 && element[10]||0 > -99) {
          leftX.push(element[8]||0);
          leftY.push(element[9]||0);
          rightX.push(element[10]||0);
          rightY.push(element[11]||0);
          lab.push("");
        }
      }
    });

    // setDiamArrayFull(diamArr);
    console.log("reloaded");
    if (!arrLoaded && leftX.length > 0) {
      setArr(true);
    }
  }, [dataArray]);
  //console.log("diamArrayFull", diamArrayFull);
  return (
    <>
      <div
        className="controlsDiv"
        style={{
          border: "6px solid grey",
          padding: "4px",
          borderRadius: "10px",
          display: "flex",
        }}
      >
        <div className="info">
          <div style={{ display: "flex" }}>
            <label for="int">Question Number: {questionNum} </label>
            <button onClick={() => changeQuestionNum("next")}>+ </button>
            <button onClick={() => changeQuestionNum("prev")}>- </button>
          </div>
          <form>
            <div className="index">
              <label for="int">Current/Total: </label>
              {playIndex}/{dataArray.length}
            </div>
            <div className="index">
              <label for="range">Frame Range: </label>
              <input
                id="range"
                max={dataArray.length}
                type="number"
                min={0}
                value={bottomLimit}
                style={{ width: "40px" }}
                disabled={playState}
                onInput={(e) => {
                  changePlayIndex(
                    e.target.value > dataArray.length
                      ? dataArray.length
                      : e.target.value,
                    "free"
                  );
                }}
              ></input>
              -
              <input
                type="number"
                value={topLimit}
                style={{ width: "40px" }}
                disabled={playState}
                onInput={(e) => {
                  setTopLimit(
                    e.target.value > dataArray.length
                      ? dataArray.length
                      : e.target.value
                  );
                }}
              ></input>
              <br />
              <label for="int">Interval speed: </label>
              <input
                type="number"
                disabled={playState}
                style={{ width: "40px" }}
                defaultValue={33}
                value={intervalSpeed}
                onInput={(e) => {
                  setIntervalSpeed(e.target.value);
                }}
                min={10}
                max={10000}
                id="int"
                name="Interval speed"
              ></input>
            </div>

            <div className="index">Timer: {timeGap / 1000}s</div>
          </form>
        </div>

        <div className="buttons">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <button
              disabled={playState || dataArray.length < 1}
              onClick={() => {
                play();
              }}
            >
              play
            </button>
            {/* <button
          disabled={playState}
          onClick={() => {
            changePlayIndex();
          }}
        >
          extra
        </button> */}
            <button
              disabled={!playState}
              onClick={() => {
                stop();
              }}
            >
              pause
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <button
              disabled={playState}
              onClick={() => {
                changePlayIndex(0, "reset");
              }}
            >
              Reset
            </button>
            <button
              disabled={playState || playIndex < 12}
              onClick={() => {
                changePlayIndex(10, "backward");
              }}
            >
              10 backward
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <button
              ref={plusRef}
              disabled={playIndex < 0 || playState}
              onClick={() => handleMouseDown()}
            >
              +
            </button>
            <button
              ref={minusRef}
              disabled={playState || playIndex < 2}
              onClick={() => {
                changePlayIndex(1, "backward");
              }}
            >
              -
            </button>
          </div>
          <br />
          {/* <div style={{ display: "flex", flexDirection: "column" }}>
            <button>Faster</button>

            <button>Slower</button>
          </div> */}
        </div>
      </div>
    </>
  );
};
export default Controls;
