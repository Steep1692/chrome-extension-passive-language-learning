try {
  importScripts(
    "./popup/js-lib/content-script-api.js",

    "./background.js"
  );
} catch (e) {
  console.log(e);
}