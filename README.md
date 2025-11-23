# W3Champions Twitch Extension

Can be installed to your channel here: https://dashboard.twitch.tv/extensions/lmsm5eua10j7zpmej0u799flvb0dgi

Allows the streamer to configure their Battle Tag. Displays the streamer's
current match and opponent, and recent games played today.

## Project setup
```
npm install
```

### Development
```
npm run dev
```

This will run the app on `https://localhost:8080` (with HTTPS), make sure to
add the certificate to your browser's trust store. Twitch requires HTTPS
for local testing because it embeds the extension in an iframe.

The extension serves two pages, `/config.html` and `/video_overlay.html`.
The former is used to configure the extension through the extension dashboard
(lets the streamer enter their Battle Tag), the latter is the video overlay
that appears on the stream, that viewers will see.

For testing, the easiest way I've found:
- Set up a new version of the extension (if not already done) and set it to "Local Test" mode
- Run `npm run dev` locally to serve the extension on `https://localhost:8080`
- Open the extension in the dashboard at `https://dashboard.twitch.tv/u/{your-username}/extensions/manage` and click the Configure ⚙️ button which opens the `/config` page
- Edit `config.html` to switch it to run `/src/overlay/index.ts` to test the overlay. (Obviously, don't commit this change.)

You can create a `.env.local` file to override the Battle Tag during local development
(when loaded in your browser and not through Twitch). The file should look like this:

```env
VITE_BATTLE_TAG='YourUsername#1234'
```

### Build & Ship
```
npm run packDist
```

This produces the minified build with Vite to `dist/`, then packages it into a zip file
named `dist.zip` that can be uploaded to Twitch.

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
