import { AblyCursor, AblyDraw, generateName } from "../src/index";

AblyDraw; // Force to load and register component.

console.log("Oh hai! 🖤");

// This exists to support debug mode in this example
// You should use the get-token-url attribute in real apps 
// The error here is wrong, this is a vite feature to support .env files
const apiKey = import.meta.env.VITE_ABLY_API_KEY;

if (apiKey) {    
    console.log("Setting Ably API Key...", apiKey);
    
    const drawElement = <AblyDraw>document.getElementsByTagName("ably-draw")[0];    
    const cursorElement = <AblyCursor>document.getElementsByTagName("ably-cursor")[0];  
    
    const friendlyName = generateName(2, "-");
    drawElement.setAttribute("api-key", apiKey);
    cursorElement.setAttribute("api-key", apiKey);
    cursorElement.setAttribute("client-name", friendlyName);
}


export { };
