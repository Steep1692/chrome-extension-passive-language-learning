try {
  importScripts(
    "/shared-resources/core/content-script-api.js",

    "/popup/context-menu.js",
  );
} catch (e) {
  console.log(e);
}