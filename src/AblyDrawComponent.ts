import Ably from "ably";
import { DrawableCanvasElement } from "@snakemode/snake-canvas";

export class AblyDraw extends HTMLElement {

    private ably: Ably.Realtime;
    private channel: Ably.Types.RealtimeChannelCallbacks;
    private canvas: DrawableCanvasElement;

    static get observedAttributes() {
        return ['api-key', 'get-token-url', 'channel'];
    }

    public get apiKey() { return this.getAttribute("api-key"); }
    public get getTokenUrl() { return this.getAttribute("get-token-url"); }

    constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'open' });


        const canvasElement = document.createElement('canvas');
        const palette = document.createElement('div');

        const paletteStyle: Partial<CSSStyleDeclaration> = {
            display: "flex",
            justifyContent: "center"
        }

        palette.appendChild(this.createPaletteItem("black"));
        palette.appendChild(this.createPaletteItem("green"));
        palette.appendChild(this.createPaletteItem("blue"));
        palette.appendChild(this.createPaletteItem("red"));
        palette.appendChild(this.createPaletteItem("white", 15));

        shadow.appendChild(canvasElement);
        shadow.appendChild(palette);
        Object.assign(palette.style, paletteStyle);
        canvasElement.style.backgroundColor = "white";
        canvasElement.style.border = "1px solid black";

        this.canvas = new DrawableCanvasElement(canvasElement);
        this.canvas.registerPaletteElements(palette);
        this.canvas.setSize(window.innerWidth - 40, window.innerHeight - 120);
    }

    private createPaletteItem(color: string, thickness: number = null) {
        const paint = document.createElement('span');
        const paintStyle: Partial<CSSStyleDeclaration> = {
            display: "block",
            width: "50px",
            height: "50px",
            margin: "0 10px",
            borderRadius: "50%",
            border: "1px solid black",
            color: "transparent",
            backgroundColor: color
        }

        paint.innerText = color;
        paint.setAttribute("data-color", color);
        paint.setAttribute("class", "palette-item");
        Object.assign(paint.style, paintStyle)

        if (thickness) {
            paint.setAttribute("data-thickness", thickness.toString());
        }

        return paint;
    }

    public async connectedCallback() {
        const clientId = generateUniqueId();

        let ablyConfig: Ably.Types.ClientOptions;
        if (this.apiKey) {
            ablyConfig = { key: this.apiKey, clientId };
        } else if (this.getTokenUrl) {
            ablyConfig = { authUrl: this.getTokenUrl, clientId };
        } else {
            ablyConfig = null;
        }

        if (!ablyConfig) {
            return;
        }

        this.ably = new Ably.Realtime(ablyConfig);
        const channelName = await this.getAttribute("channel");

        this.channel = this.ably.channels.get(channelName);

        this.channel.subscribe((message) => {
            if (this.ably.connection.id != message.connectionId) {
                this.canvas.addMarks(message.data);
            }
        });

        this.canvas.onNotification((evt) => {
            this.channel.publish(channelName, evt);
        });

        console.log("Subscribed to channel", channelName);
    }

    public async disconnectedCallback() {
        if (!this.channel) {
            return;
        }

        this.channel.unsubscribe();
        this.channel.detach();
    }

    public async attributeChangedCallback(name, oldValue, newValue) {
        this.disconnectedCallback();
        this.connectedCallback();
    }
}

const generateUniqueId = () => {
    return Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
}

customElements.define('ably-draw', AblyDraw);
