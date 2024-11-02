# w3champions-twitch

## Project setup
```
yarn
```

### Compiles and hot-reloads for development
```
yarn dev
```

This will run the app on https://localhost:8080 (with HTTPS), make sure to
add the certificate to your browser's trust store. Twitch requires HTTPS
for local testing because it embeds the extension in an iframe.

The extension serves two pages, `/config` and `/video_overlay`. The former
is used to configure the extension through the extension dashboard (lets the
streamer enter their Battle Tag), the latter is the video overlay that appears
on the stream.



### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
