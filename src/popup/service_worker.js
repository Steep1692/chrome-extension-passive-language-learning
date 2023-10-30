try {
  importScripts(
    "/shared-resources/core/content-script-api.js",

    "/popup/background.js"
  );
} catch (e) {
  console.log(e);
}