chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_PRODUCT_NAME') {
    let name = null

    if (window.location.hostname.includes('amazon')) {
      name = document.getElementById('productTitle')?.textContent?.trim() ||
        document.getElementById('title')?.textContent?.trim()
    }

    if (window.location.hostname.includes('flipkart')) {
      name = document.querySelector('span.VU-ZEz')?.textContent?.trim() ||
        document.querySelector('span.B_NuCI')?.textContent?.trim() ||
        document.querySelector('h1')?.textContent?.trim()
    }

    if (window.location.hostname.includes('myntra')) {
      const brand = document.querySelector('.pdp-title')?.textContent?.trim() || ''
      const product = document.querySelector('.pdp-name')?.textContent?.trim() || ''
      name = `${brand} ${product}`.trim() || null
    }

    sendResponse({ name })
  }

  return true
})