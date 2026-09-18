import {
  API_BASE, BATCH_SIZE, CATEGORIES, LIMITS, MAX_BOOKMARKS, SAMPLE_BOOKMARKS,
  answerFor, buildRequest, hostOf, parseBookmarks,
} from './bookmarks.mjs'

const form = document.querySelector('#bookmark-file')
const sampleButton = document.querySelector('#use-sample')
const runButton = document.querySelector('#run')
const shuffleButton = document.querySelector('#shuffle')
const selectedEl = document.querySelector('#selected')
const resultsEl = document.querySelector('#results')
const statusEl = document.querySelector('#status')
const modelEl = document.querySelector('#model')

let library = SAMPLE_BOOKMARKS
let selected = SAMPLE_BOOKMARKS.slice(0, MAX_BOOKMARKS)

function titleFor(category) {
  return category.split('_').map((word) => word === 'ai' ? 'AI' : word[0].toUpperCase() + word.slice(1)).join(' & ')
}

function setStatus(message, kind = '') {
  statusEl.textContent = message
  statusEl.className = `status ${kind}`
}

function renderSelected() {
  selectedEl.replaceChildren(...selected.map((bookmark) => {
    const item = document.createElement('li')
    item.innerHTML = `<strong>${escapeHtml(bookmark.title)}</strong><span>${escapeHtml(hostOf(bookmark.url))}</span>`
    return item
  }))
  runButton.disabled = !selected.length || !modelEl.value
  shuffleButton.disabled = library.length <= MAX_BOOKMARKS
}

function escapeHtml(value) {
  const node = document.createElement('span')
  node.textContent = value
  return node.innerHTML
}

function chooseSample(items) {
  if (items.length <= MAX_BOOKMARKS) return [...items]
  return [...items].sort(() => Math.random() - 0.5).slice(0, MAX_BOOKMARKS)
}

async function loadModels() {
  try {
    const response = await fetch(`${API_BASE}/models`, { credentials: 'omit', signal: AbortSignal.timeout(15000) })
    const data = await response.json()
    const models = [...new Set((data.data || []).map((item) => item.id).filter(Boolean))]
    if (!models.length) throw Error('No models available')
    modelEl.replaceChildren(...models.map((model) => new Option(model, model, /gemma/i.test(model), /gemma/i.test(model))))
    modelEl.disabled = false
    setStatus('Ready to classify the selected bookmark sample.', 'ready')
    renderSelected()
  } catch (error) {
    setStatus(`Couldn’t load the demo models: ${error.message}`, 'error')
  }
}

async function classifyBatch(bookmarks) {
  const response = await fetch(`${API_BASE}/classifier`, {
    method: 'POST',
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildRequest(modelEl.value, bookmarks)),
    signal: AbortSignal.timeout(45000),
  })
  const data = await response.json()
  if (!response.ok) throw Error(data?.error?.message || `Classifier HTTP ${response.status}`)
  return bookmarks.map((bookmark, index) => ({ bookmark, answer: answerFor(data, `bookmark_${index + 1}`) }))
}

function renderResults(rows) {
  const groups = new Map()
  for (const row of rows) (groups.get(row.answer.choice) || groups.set(row.answer.choice, []).get(row.answer.choice)).push(row)
  const ordered = [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  resultsEl.replaceChildren(...ordered.map(([category, items]) => {
    const section = document.createElement('section')
    section.className = 'result-group'
    section.innerHTML = `<h2>${titleFor(category)} <span>${items.length}</span></h2>`
    const list = document.createElement('ul')
    for (const { bookmark, answer } of items) {
      const probability = Math.round(answer.confidence * 100)
      const item = document.createElement('li')
      item.innerHTML = `<a href="${escapeHtml(bookmark.url)}" target="_blank" rel="noreferrer">${escapeHtml(bookmark.title)}</a><div><span>${escapeHtml(hostOf(bookmark.url))}</span><b>${probability}%</b></div><meter min="0" max="1" value="${answer.confidence}">${probability}%</meter>`
      list.append(item)
    }
    section.append(list)
    return section
  }))
}

form.addEventListener('change', async () => {
  const file = form.files?.[0]
  if (!file) return
  try {
    if (file.size > LIMITS.FILE_BYTES) {
      throw Error(`That export is too large. Choose a file smaller than ${LIMITS.FILE_BYTES / 1024 / 1024} MB.`)
    }
    library = parseBookmarks(await file.text())
    if (!library.length) throw Error('No web bookmarks found in that file.')
    selected = chooseSample(library)
    resultsEl.replaceChildren()
    setStatus(`${library.length.toLocaleString()} bookmarks found. We’ll classify this ${selected.length}-bookmark sample in one request.`, 'ready')
    renderSelected()
  } catch (error) {
    setStatus(error.message || 'Couldn’t read that bookmark export.', 'error')
  }
})

sampleButton.addEventListener('click', () => {
  library = SAMPLE_BOOKMARKS
  selected = [...SAMPLE_BOOKMARKS]
  resultsEl.replaceChildren()
  setStatus('Using the built-in mixed bookmark sample.', 'ready')
  renderSelected()
})

shuffleButton.addEventListener('click', () => {
  selected = chooseSample(library)
  resultsEl.replaceChildren()
  setStatus(`New ${selected.length}-bookmark sample ready.`, 'ready')
  renderSelected()
})

runButton.addEventListener('click', async () => {
  runButton.disabled = true
  resultsEl.replaceChildren()
  try {
    const batches = Array.from({ length: Math.ceil(selected.length / BATCH_SIZE) }, (_, index) => selected.slice(index * BATCH_SIZE, (index + 1) * BATCH_SIZE))
    const rows = []
    for (const [index, batch] of batches.entries()) {
      setStatus(`Classifying ${batch.length} bookmarks in one shared-context request…`)
      rows.push(...await classifyBatch(batch))
    }
    renderResults(rows)
    setStatus(`Done. ${rows.length} structured decisions from one classifier call—without a chat completion.`, 'success')
  } catch (error) {
    setStatus(`The classifier couldn’t finish: ${error.message}`, 'error')
  } finally {
    runButton.disabled = !selected.length || !modelEl.value
  }
})

modelEl.addEventListener('change', renderSelected)
renderSelected()
loadModels()
