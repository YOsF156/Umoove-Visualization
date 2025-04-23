import { useContext, useState } from "react";
import Papa from "papaparse";
import { read, utils } from "xlsx";
import Sandbox from "../SandBox/SandBox";
import { dataContext } from "../../context/manageContext";
import { draw } from "../../utils/draw";
import { convertTime } from "../../utils/dateUtils";
import "./Pfx.css";

const Pfx = () => {
  const [csvData, setCsvData] = useState(null);
  const [statedata, setStateData] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [start, setStart] = useState(false);
  const [isDragging, setIsDragging] = useState({ umoove: false, state: false, results: false });
  const [error, setError] = useState(null);
  const data = useContext(dataContext);
  const canvasWidth = 210;
  const canvasHeight = 210;

  const processResultsData = (rawData) => {
    if (!rawData || rawData.length === 0) {
      throw new Error("Empty or invalid results file");
    }
    const feedbackId = rawData[0]["PatientFeedbackId"];
    if (!feedbackId || !rawData.every((row) => row["PatientFeedbackId"] === feedbackId)) {
      throw new Error("File must contain one test result with a single PatientFeedbackId");
    }
    return rawData.map((row, index) => ({
      id: index + 1,
      PatientFeedbackId: row["PatientFeedbackId"] || row["PetientFeedbackId"],
      eye: row["eye"],
      CreatedDate: row["CreatedDate"],
      trackingQuality: parseInt(row["trackingQuality"]) || 0,
      pauses: parseInt(row["pauses"]) || 0,
      duration: row["duration"],
      stops: parseInt(row["stops"]) || 0,
      x: parseInt(row["x"]) || 0,
      y: parseInt(row["y"]) || 0,
      minIntensity: parseInt(row["minIntensity"]) || 0,
      responseTime: parseInt(row["responseTime"]) || 0,
      inRange: parseInt(row["inRange"]) || 0,
      inTest: parseInt(row["inTest"]) || 0,
    }));
  };

  const handleFile = (file, type) => {
    if (!file) return;
    setError(null);

    const processCsvData = (csvText) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        transformHeader: (header) => header.trim().replace(/^"|"$/g, ""),
        transform: (value) => value.trim().replace(/^"|"$/g, ""),
        complete: (results) => {
          try {
            if (type === "umoove") {
              results.data.shift();
              setCsvData(results.data);
              data.setData(results.data);
            } else if (type === "state") {
              setStateData(results.data);
              let notNeccestyTitles = results.data.shift();
              let neccestyTitles = results.data.shift();
              data.setPfxStateLog(results.data);
              data.setPfxStateLogTitles(neccestyTitles);
            } else if (type === "results") {
              const cleanedData = processResultsData(results.data);
              const avgTotal =
                cleanedData
                  .filter((r) => Math.abs(r.x) <= 9 && Math.abs(r.y) <= 15)
                  .reduce((sum, r) => sum + r.minIntensity, 0) /
                cleanedData.filter((r) => Math.abs(r.x) <= 9 && Math.abs(r.y) <= 15).length;
              const processedData = {
                id: cleanedData[0].PatientFeedbackId,
                eye: cleanedData[0].eye,
                CreatedDate: cleanedData[0].CreatedDate,
                trackingQuality: cleanedData[0].trackingQuality,
                pauses: cleanedData[0].pauses,
                duration: cleanedData[0].duration,
                stops: cleanedData[0].stops,
                PatientTestResult: cleanedData,
                avgTotal,
              };
              setResultsData(processedData);
              data.setResultsData(processedData);
            }
          } catch (err) {
            setError(err.message);
          }
        },
        error: () => {
          setError(`Failed to parse ${type} file`);
        },
      });
    };

    if (file.name.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (event) => processCsvData(event.target.result);
      reader.readAsText(file);
    } else if (file.name.match(/\.(xlsx|xls)$/)) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const workbook = read(event.target.result, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          if (!sheetName) {
            throw new Error("Excel file has no sheets");
          }
          const csvText = utils.sheet_to_csv(workbook.Sheets[sheetName]);
          processCsvData(csvText);
        } catch (err) {
          setError(`Failed to process ${type} Excel file: ${err.message}`);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      setError("Please upload a .csv, .xlsx, or .xls file");
    }
  };

  const handleFileSelect = (e, type) => {
    handleFile(e.target.files[0], type);
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setIsDragging({ ...isDragging, [type]: false });
    handleFile(e.dataTransfer.files[0], type);
  };

  const handleDragOver = (e, type) => {
    e.preventDefault();
    setIsDragging({ ...isDragging, [type]: true });
  };

  const handleDragLeave = (type) => {
    setIsDragging({ ...isDragging, [type]: false });
  };

  return (
    <div className="pfx-container">
      {!start && (
        <div className="file-inputs-grid">
          {/* <div className="file-input">
            <h1>Umoove Log</h1>
            <div
              className={`dropzone ${isDragging.umoove ? "dragging" : ""}`}
              onDrop={(e) => handleDrop(e, "umoove")}
              onDragOver={(e) => handleDragOver(e, "umoove")}
              onDragLeave={() => handleDragLeave("umoove")}
            >
              <svg
                className="upload-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p>Drag and drop Umoove CSV or Excel file here or click to upload</p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => handleFileSelect(e, "umoove")}
                className="file-input-hidden"
              />
            </div>
          </div>
          <div className="file-input">
            <h1>Feedback (State) Log</h1>
            <div
              className={`dropzone ${isDragging.state ? "dragging" : ""}`}
              onDrop={(e) => handleDrop(e, "state")}
              onDragOver={(e) => handleDragOver(e, "state")}
              onDragLeave={() => handleDragLeave("state")}
            >
              <svg
                className="upload-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p>Drag and drop State CSV or Excel file here or click to upload</p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => handleFileSelect(e, "state")}
                className="file-input-hidden"
              />
            </div>
          </div> */}
          <div className="file-input">
            <h1>Results Log</h1>
            <div
              className={`dropzone ${isDragging.results ? "dragging" : ""}`}
              onDrop={(e) => handleDrop(e, "results")}
              onDragOver={(e) => handleDragOver(e, "results")}
              onDragLeave={() => handleDragLeave("results")}
            >
              <svg
                className="upload-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p>Drag and drop Results CSV or Excel file here or click to upload</p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => handleFileSelect(e, "results")}
                className="file-input-hidden"
              />
            </div>
          </div>
        </div>
      )}
      {!start && csvData && (
        <button className="start-button" onClick={() => setStart(true)}>
          Start
        </button>
      )}
      {csvData && start && <Sandbox type={"pfx"} />}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Try Again</button>
        </div>
      )}
      {resultsData && (
        <div className="results-section">
          <h2>{resultsData.eye.charAt(0).toUpperCase() + resultsData.eye.slice(1)} Eye Results</h2>
          <div className="flex-container">
            <img
              src={draw({
                canvasWidth,
                canvasHeight,
                resultsArray: resultsData.PatientTestResult,
                avgTotal: resultsData.avgTotal,
                extendedInput: true,
                methodInput: false,
                eye: resultsData.eye,
              })}
              alt="Test Result Canvas"
              className="results-canvas"
            />
            <div className="info-table">
              <h3>Test Details</h3>
              <div className="table-row">
                <span className="label">Test Time:</span>
                <span>{convertTime(resultsData.CreatedDate)}</span>
              </div>
              <div className="table-row">
                <span className="label">Tracking Quality:</span>
                <span>{resultsData.trackingQuality}</span>
              </div>
              <div className="table-row">
                <span className="label">Fixation Losses:</span>
                <span>{resultsData.pauses}</span>
              </div>
              <div className="table-row">
                <span className="label">Duration:</span>
                <span>{resultsData.duration}</span>
              </div>
              <div className="table-row">
                <span className="label">Test Restarts:</span>
                <span>{resultsData.stops}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pfx;