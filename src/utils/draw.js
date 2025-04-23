export const draw = (drawDetails, drawCPoints = true) => {
    const {
        resultsArray,
        methodInput,
        extendedInput,
        avgTotal,
        canvasWidth,
        canvasHeight,
        eye,
    } = drawDetails;
    const maxLumVal = 255;
    const minLumVal = 79;
    const largestPoint = 30;
    const pointRadius = 2.5;
    const canvasRatio = canvasWidth / (largestPoint * 2);
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");

    const intToHex = (rgb) => {
        let hex = Number(rgb).toString(16);
        return hex.length < 2 ? "0" + hex : hex;
    };

    const greyToHex = (c) => {
        let grey = intToHex(Math.round(c));
        return "#" + grey + grey + grey;
    };

    const greyToColorHex = (c) => {
        const greyToColorRatio = 149.0 / 255;
        const rgbAdd = { r: 1, g: 16, b: 106 };
        const val = c * greyToColorRatio;
        const r = intToHex(Math.floor(val + rgbAdd.r));
        const g = intToHex(Math.floor(val + rgbAdd.g));
        const b = intToHex(Math.floor(val + rgbAdd.b));
        return "#" + r + g + b;
    };

    const drawLines = () => {
        ctx.beginPath();
        ctx.strokeStyle = greyToHex(160);
        ctx.moveTo(canvasWidth / 2 - largestPoint * canvasRatio, canvasHeight / 2);
        ctx.lineTo(canvasWidth / 2 + largestPoint * canvasRatio, canvasHeight / 2);
        ctx.moveTo(canvasWidth / 2, canvasHeight / 2 - largestPoint * canvasRatio);
        ctx.lineTo(canvasWidth / 2, canvasHeight / 2 + largestPoint * canvasRatio);
        ctx.stroke();
    };

    const drawPoints = () => {
        let minVal = 1000;
        let maxVal = 0;
        let avgT = 0;
        let avgTcount = 0;
        resultsArray.forEach((result) => {
            minVal = Math.min(result.minIntensity, minVal);
            maxVal = Math.max(result.minIntensity, maxVal);
            if (Math.abs(result.x) <= 9 && Math.abs(result.y) <= 15) {
                avgT += result.minIntensity;
                avgTcount++;
            }
        });
        avgT /= avgTcount;

        resultsArray.forEach((result, i) => {
            if (result.inTest) {
                const x_loc = (result.x + largestPoint) * canvasRatio;
                const y_loc = (result.y + largestPoint) * canvasRatio;
                const hideBlindSpot = false;
                if (eye === "left" && hideBlindSpot && (i === 30 || i === 40)) {
                    ctx.beginPath();
                    ctx.strokeStyle = greyToHex(100);
                    ctx.arc(x_loc, y_loc, 2, 0, 2 * Math.PI);
                    ctx.stroke();
                } else if (eye === "right" && hideBlindSpot && (i === 35 || i === 45)) {
                    ctx.beginPath();
                    ctx.strokeStyle = greyToHex(100);
                    ctx.arc(x_loc, y_loc, 2, 0, 2 * Math.PI);
                    ctx.stroke();
                } else if (result.inRange) {
                    ctx.beginPath();
                    const norm = (result.minIntensity - minVal) / (maxLumVal - minVal);
                    let pointIntensity = (1 - norm) * maxLumVal;
                    let text_pointIntensity = (1 - norm) * 300;

                    if (methodInput) {
                        const normAvgTotal = (avgT - minVal) / (maxLumVal - minVal);
                        text_pointIntensity = (1 - norm - (1 - normAvgTotal)) * 300;
                        pointIntensity = (1 - norm) * 235;
                    }

                    ctx.fillStyle = methodInput ? greyToHex(pointIntensity) : greyToColorHex(pointIntensity);
                    ctx.arc(x_loc, y_loc, pointRadius * canvasRatio, 0, 2 * Math.PI);
                    ctx.fill();

                    if (extendedInput) {
                        ctx.font = `${pointRadius * canvasRatio}px Arial`;
                        ctx.fillStyle = greyToHex(pointIntensity > 150 ? 0 : 255);
                        ctx.textAlign = "center";
                        ctx.fillText(
                            Math.round(text_pointIntensity / 10.0),
                            x_loc,
                            y_loc + (pointRadius * canvasRatio) / 3
                        );
                    }
                } else {
                    ctx.beginPath();
                    ctx.strokeStyle = greyToHex(100);
                    ctx.arc(x_loc, y_loc, 2, 0, 2 * Math.PI);
                    ctx.stroke();
                }
            }
        });
    };

    drawLines();
    drawPoints();
    const image = canvas.toDataURL("image/png");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return image;
};