chrome.runtime.onInstalled.addListener(() => {
  console.log('PriceTrac extension installed')
})

chrome.action.onClicked.addListener((tab) => {
  console.log('Extension clicked on tab:', tab.url)
})