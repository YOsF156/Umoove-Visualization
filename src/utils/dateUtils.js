export const convertTime = (timeStamp) => {
    const date = new Date(timeStamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};