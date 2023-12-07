try {
  importScripts(
    "/shared-resources/core/content-script-api.js",

    "/extension/context-menu.js",
  );
} catch (e) {
  console.log(e);
}