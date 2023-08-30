(() => {
  const handleContextMenuClicked = (info) => {
    if (info.menuItemId === "addWord") {
      ContentScriptApi.addWord(info.selectionText)
    }
  }

  chrome.contextMenus.onClicked.addListener(handleContextMenuClicked);

  chrome.contextMenus.create({
    id: "addWord",
    title: "Add word to dictionary",
    contexts: ["selection"], // You can specify other contexts like "page", "link", etc.
  });
})()