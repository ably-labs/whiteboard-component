# Ably Drawing Component

## Run the demo

Create file `./sample-app/.env` with the following content:

```env
VITE_ABLY_API_KEY=your_key
```

Then on the command line run:

```bash
npm run start
```

This starts up the development / test app for this component. Packaging this repository will result in a usable NPM package.

## Usage

First import the component as a module:

```js
import * as AblyDraw from "../src/index"; // replace with package name if published
```

Then create an instance of the component:

```html
<ably-draw 
    api-key="you-can-put-your-key-here-but-please-dont" 
    get-token-url="https://ppwcfol4k7.execute-api.us-east-2.amazonaws.com/default/createTokenRequest"
    channel="drawing"
></ably-draw>
```

Choose one of `api-key` or `get-token-url` for authentication credentials.

**Use get-token-url in real world scenarios** - `api-key` exists only for testing and should **never** reach a real world web application.

[![Ably logo](https://static.ably.dev/badge-black.svg?whiteboard-component)](https://ably.com)
