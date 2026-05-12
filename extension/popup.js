const PRICETRAC_URL = 'https://pricetrac.vercel.app'

const loginSection = document.getElementById('loginSection')
const mainSection = document.getElementById('mainSection')
const supportedContent = document.getElementById('supportedContent')
const notSupported = document.getElementById('notSupported')
const platformBadge = document.getElementById('platformBadge')
const productName = document.getElementById('productName')
const trackBtn = document.getElementById('trackBtn')
const logoutBtn = document.getElementById('logoutBtn')
const loginBtn = document.getElementById('loginBtn')
const loginError = document.getElementById('loginError')
const statusDot = document.getElementById('statusDot')
const emailInput = document.getElementById('emailInput')
const passwordInput = document.getElementById('passwordInput')

function detectPlatform(url) {
  if (url.includes('amazon.in') || url.includes('amazon.com')) return 'amazon'
  if (url.includes('flipkart.com')) return 'flipkart'
  if (url.includes('myntra.com')) return 'myntra'
  return null
}

async function getStoredData() {
  return new Promise(resolve => {
    chrome.storage.local.get(['token', 'email'], resolve)
  })
}

async function init() {
  const { token } = await getStoredData()

  if (!token) {
    loginSection.style.display = 'block'
    statusDot.classList.add('offline')
    return
  }

  mainSection.style.display = 'block'

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  const url = tab.url || ''
  const platform = detectPlatform(url)

  if (!platform) {
    notSupported.style.display = 'block'
    return
  }

  supportedContent.style.display = 'block'
  platformBadge.textContent = platform.charAt(0).toUpperCase() + platform.slice(1)

  chrome.tabs.sendMessage(tab.id, { type: 'GET_PRODUCT_NAME' }, response => {
    productName.textContent = response?.name || tab.title || 'Product detected'
  })

  trackBtn.addEventListener('click', async () => {
    trackBtn.disabled = true
    trackBtn.textContent = 'Adding... (20-30s)'

    try {
      const response = await fetch(`${PRICETRAC_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (response.ok) {
        trackBtn.textContent = '✓ Tracking!'
        trackBtn.classList.add('success')
      } else {
        trackBtn.textContent = data.error || 'Error — try again'
        trackBtn.classList.add('error')
        setTimeout(() => {
          trackBtn.textContent = 'Track This Product'
          trackBtn.classList.remove('error')
          trackBtn.disabled = false
        }, 3000)
      }
    } catch (err) {
      trackBtn.textContent = 'Failed — check connection'
      trackBtn.classList.add('error')
      setTimeout(() => {
        trackBtn.textContent = 'Track This Product'
        trackBtn.classList.remove('error')
        trackBtn.disabled = false
      }, 3000)
    }
  })
}

loginBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim()
  const password = passwordInput.value.trim()

  if (!email || !password) {
    loginError.textContent = 'Please enter email and password'
    return
  }

  loginBtn.textContent = 'Logging in...'
  loginBtn.disabled = true
  loginError.textContent = ''

  try {
    const response = await fetch(`${PRICETRAC_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (response.ok && data.token) {
      await chrome.storage.local.set({ token: data.token, email })
      loginSection.style.display = 'none'
      mainSection.style.display = 'block'
      init()
    } else {
      loginError.textContent = data.error || 'Login failed'
    }
  } catch (err) {
    loginError.textContent = 'Connection failed — check internet'
  } finally {
    loginBtn.textContent = 'Log in'
    loginBtn.disabled = false
  }
})

logoutBtn.addEventListener('click', async () => {
  await chrome.storage.local.clear()
  mainSection.style.display = 'none'
  loginSection.style.display = 'block'
  statusDot.classList.add('offline')
})

init()