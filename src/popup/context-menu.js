(() => {
  chrome.runtime.onInstalled.addListener(() => {
    const MENU_ITEM = {
      ADD_WORD: "pll-addWord"
    }

    const handleContextMenuClicked = (info) => {
      if (info.menuItemId === MENU_ITEM.ADD_WORD) {
        ContentScriptApi.addWord(info.selectionText)
      }
    }

    chrome.contextMenus.onClicked.addListener(handleContextMenuClicked);

    chrome.contextMenus.create({
      id: MENU_ITEM.ADD_WORD,
      title: "Додати слово до словника",
      contexts: ["selection"], // You can specify other contexts like "page", "link", etc.
    });
  });
})()