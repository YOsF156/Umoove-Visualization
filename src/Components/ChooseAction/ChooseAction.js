import { useContext, useEffect, useRef, useState } from "react";
import { dataContext } from "../../context/manageContext";
import LoadData from "../LoadData/LoadData";
import Sandbox from "../SandBox/SandBox";
import AnalyzeSppHeatMap from "../SppHeatMap/AnalyzeSppHeatMap";
import SppHeatMap from "../SppHeatMap/SppHeatMap";
import "./ChooseAction.css";
const ChooseAction = () => {
  return (
    <>
      <div>
        <div>Visualization</div>
        <div>Analyze</div>
      </div>
    </>
  );
};
export const Visualization = (type = '') => {
  const data = useContext(dataContext);
  return (
    <>
      {!data.userLoaded && <LoadData />}
      {data.userLoaded && <Sandbox />}
    </>
  );
};
let Styles = { td: "textAlign:center,color:red" };
export const Analyze = () => {
  const data = useContext(dataContext);
  let canvasRef = useRef();
  const [students, setStudents] = useState(false);
  const [startAnalyze, setStartAnalyze] = useState(false);
  const [mainResults, setMainResults] = useState([]);
  const [doneWithAll, setDoneWithAll] = useState(false);
  const [enableButton, setEnableButton] = useState(false);
  const [excludedUsers, setExcludedUsers] = useState([]);
  useEffect(() => {
    if (mainResults.length >= students.length) {
      setTimeout(() => {
        setEnableButton(true);
      }, 3000);
    }
  }, [mainResults]);
  let loadStudents = async () => {
    let req = await fetch("http://localhost:5000/students/pilot", {
      method: "POST",
    });
    let res = await req.json();
    console.log("all", res);
    setStudents(res);
  };
  useEffect(() => {
    if (data.selectedMethod !== 'pfx')
      loadStudents();
  }, []);

  let onStudentClicked = (user) => {
    setExcludedUsers([...excludedUsers, user]);
    setStudents((prev) => {
      prev.filter((st) => {
        return st._id !== user;
      });
    });
  };
  let startAnalyzeAction = () => {
    for (let index = 0; index < students.length; index++) {
      const student = students[index];
      // let res  = AnalyzeSppHeatMap(student._id)
    }
  };
  let CSVoutput = "School,Student Id,q5,q6\n";
  let loadCsv = (data) => {
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      CSVoutput += `${element.school},${element.studentId},${element.results[0].desicion
          ? "V"
          : element.results[0].traveling
            ? "T"
            : "X"
        },${element.results[1].desicion
          ? "V"
          : element.results[1].traveling
            ? "T"
            : "X"
        }\n`;
    }
    console.log(CSVoutput);
    saveCsvOutput()
    //Called when new data available
  };
  let saveCsvOutput = () => {
    const a = document.createElement("a");
    const blob = new Blob([CSVoutput], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    a.href = url;
    a.download = "myFile.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    // This will download the data file named "my_data.csv".
  };
  return (
    <>
      {students && (
        <div
          style={{
            border: "1px solid",
            borderRadius: "10px",
            margin: "auto",
            maxHeight: "80vh",
            overflowX: "auto",
            width: "fit-content",
            padding: "15px",
          }}
        >
          {students.map((stu) => {
            return (
              <div
                onClick={() => {
                  console.log("stu", stu);
                  // onStudentClicked(stu._id);
                }}
                className="studentDetails"
                style={{
                  // border: "1px solid red",
                  // height: "250px",
                  width: "300px",
                  margin: "4px",
                  borderRadius: "10px",
                  padding: "10px",
                }}
              >
                <div>
                  School: <span>{stu.school}</span>
                </div>
                <div>
                  StudentId: <span>{stu.studentId}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {startAnalyze && (
        <>
          <div style={{ border: "1px solid blue" }}>
            {students.map((student, index) => {
              return (
                <AnalyzeSppHeatMap
                  studentId={student._id}
                  setMainResults={(newData) => {
                    setMainResults((prev) => [...prev, newData]);
                  }}
                />
              );
            })}
          </div>
        </>
      )}
      {doneWithAll && (
        <div style={{ margin: "auto", width: "fit-content" }}>
          <table>
            <h1>Results</h1>
            {mainResults.map((res) => {
              return (
                <div
                  style={{
                    border: "1px solid",
                    margin: "auto",
                    margin: "10px",
                  }}
                >
                  <th style={{ color: "red" }}>Student: {res.studentId}</th>

                  {res.results.map((ques) => {
                    return (
                      <tr>
                        <tr>
                          {/* <td>Student Id </td> */}
                          <th>Question</th>
                          <th>Spp</th>
                          <th>Traveling</th>
                        </tr>

                        <tr style={{ border: "1px solid" }}>
                          {/* <td>{res.studentId}</td> */}
                          <td>{ques.question + 1}</td>
                          <td>{ques.desicion ? "V" : "X"}</td>
                          <td>{ques.traveling ? "V" : "X"}</td>
                        </tr>
                      </tr>
                    );
                  })}
                </div>
              );
            })}
          </table>
        </div>
      )}
      {enableButton && (
        <button
          onClick={() => {
            setMainResults((prev) =>
              prev
                .filter(
                  (v, i, a) => a.findIndex((v2) => v2._id === v._id) === i
                )
                .sort((a, b) => a.studentId === b.studentId)
            );

            console.log("main res", mainResults.length);
            loadCsv(mainResults);
            // setDoneWithAll(true);
          }}
        >
          Analyze is ready,click here to see{" "}
        </button>
      )}
      <button
        onClick={() => {
          setStartAnalyze(true);
        }}
      >
        Analyze it!
      </button>
    </>
  );
};

export default ChooseAction;
