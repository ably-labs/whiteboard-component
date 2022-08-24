import { AblyCursor, AblyDraw, generateName } from "../src/index";

AblyDraw; // Force to load and register component.

console.log("Oh hai! 🖤");

const drawElement = <AblyDraw>document.getElementsByTagName("ably-draw")[0];    
const cursorElement = <AblyCursor>document.getElementsByTagName("ably-cursor")[0];
const friendlyName = generateName(2, "-");

cursorElement.setAttribute("client-name", friendlyName);

if (import.meta.env.DEV) {    
    console.log("Demo running in dev, Setting Ably API Key from ./src/.env"); 

    drawElement.setAttribute("api-key", import.meta.env.VITE_ABLY_API_KEY);
    cursorElement.setAttribute("api-key", import.meta.env.VITE_ABLY_API_KEY);
} else {
    console.log("Demo running on production host");

    drawElement.setAttribute("get-token-url", `/api/ably-token-request?clientId=${friendlyName}`);
    cursorElement.setAttribute("get-token-url", `/api/ably-token-request?clientId=${friendlyName}`);
    cursorElement.setAttribute("client-name", friendlyName);
}


export { };
