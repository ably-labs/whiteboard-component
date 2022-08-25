import Ably from "ably";

export class AblyCursor extends HTMLElement {

    private ably: Ably.Realtime;
    private channel: Ably.Types.RealtimeChannelCallbacks;
    private cursors: HTMLDivElement;

    private location: { x: number, y: number } = null;

    static get observedAttributes() {
        return ['api-key', 'get-token-url', 'channel', 'client-name'];
    }

    public get apiKey() { return this.getAttribute("api-key"); }
    public get getTokenUrl() { return this.getAttribute("get-token-url"); }

    constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'open' });

        this.cursors = document.createElement('div');
        this.cursors.id = "cursors";
        this.cursors.style.position = "absolute";
        this.cursors.style.top = "0";
        this.cursors.style.left = "0";
        this.cursors.style.width = "100%";
        this.cursors.style.height = "100%";
        this.cursors.style.zIndex = "1000";
        this.cursors.style.pointerEvents = "none";

        shadow.appendChild(this.cursors);

        document.body.onmousemove = (e) => {
            this.sendCursorLocation(e.clientX, e.clientY)
        }

        document.body.addEventListener("touchstart", (e) => {
            const touch = e.targetTouches[0];
            const x = touch.clientX - 10;
            const y = touch.clientY - 10;
            this.sendCursorLocation(x, y);
        }, false);

        document.body.addEventListener("touchmove", (e) => {
            const touch = e.targetTouches[0];
            const x = touch.clientX - 10;
            const y = touch.clientY - 10;
            this.sendCursorLocation(x, y);
        }, false);
    }

    public async connectedCallback() {
        const clientId = this.getAttribute("client-name") || generateUniqueId();

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
        const channelName = this.getAttribute("channel");

        this.channel = this.ably.channels.get(channelName);
        this.subscribeToCursorLocations();
    }

    public async disconnectedCallback() {
        if (!this.channel) {
            return;
        }

        this.channel.presence.leave();
        this.channel.detach();
    }

    public async attributeChangedCallback(name, oldValue, newValue) {
        this.disconnectedCallback();
        this.connectedCallback();
    }

    private subscribeToCursorLocations() {
        this.channel.presence.subscribe("enter", (message) => {
            const { existed, cursor } = this.getOrCreateCursor(message.clientId, message.data);
            if (!existed) {
                this.cursors.appendChild(cursor);
            }
        });

        this.channel.presence.subscribe("update", (message) => {
            const { existed, cursor } = this.getOrCreateCursor(message.clientId, message.data);
            if (!existed) {
                this.cursors.appendChild(cursor);
            }
            cursor.style.top = message.data.y + "px";
            cursor.style.left = message.data.x + "px";
        });

        this.channel.presence.subscribe("leave", (message) => {
            const { existed, cursor } = this.getOrCreateCursor(message.clientId, message.data);
            if (existed) {
                this.cursors.removeChild(cursor);
            }
        });

        this.channel.presence.enter({ x: 0, y: 0 });

        setInterval(() => {
            if (this.location) {
                this.channel.presence.update(this.location);
                this.location = null;
            }
        }, 33);
    }

    public sendCursorLocation(x: number, y: number) {
        this.location = { x, y };
    }

    private getOrCreateCursor(clientId: string, coords: { x: number, y: number }) {
        const existing = [...this.cursors.children].filter(x => x.id === `cursor-${clientId}`)[0];

        if (existing) {
            return { existed: true, cursor: existing as HTMLDivElement };
        }

        const hue = Math.random() * 256 | 0;

        const arrowStyle: Partial<CSSStyleDeclaration> = {
            position: "absolute",
            top: "0",
            left: "0",
            width: "15px",
            height: "15px",
            display: "inline-block",
            borderTop: "7px solid",
            borderRight: "7px solid",
            borderColor: `hsl(${hue}deg, 100%, 40%)`,
            transform: "rotate(-90deg) skew(-10deg, -10deg)"
        }

        const cursorStyle: Partial<CSSStyleDeclaration> = {
            position: "absolute",
            top: `${coords.y}px`,
            left: `${coords.x}px`,
        }

        const nameStyle: Partial<CSSStyleDeclaration> = {
            position: "absolute",
            top: "12px",
            left: "24px",
            whiteSpace: "nowrap",
            fontWeight: "bold",
            textShadow: "-1px 1px 0 #ffffff, 1px 1px 0 #ffffff, 1px -1px 0 #ffffff, -1px -1px 0 #ffffff, 0 0 10px #ffffff",
            color: `hsl(${hue}deg, 100%, 40%)`
        }

        const arrow = document.createElement("div");
        const name = document.createElement("div");
        name.innerText = clientId;

        const element = document.createElement("div");
        element.id = `cursor-${clientId}`;
        element.appendChild(arrow)
        element.appendChild(name)

        Object.assign(name.style, nameStyle)
        Object.assign(arrow.style, arrowStyle)
        Object.assign(element.style, cursorStyle);

        return { existed: false, cursor: element };
    }
}

const generateUniqueId = () => {
    return Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
}

customElements.define('ably-cursor', AblyCursor);
