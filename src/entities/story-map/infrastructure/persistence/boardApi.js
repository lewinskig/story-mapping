export async function listBoards() {
  return request('/api/boards')
}

export async function loadBoard(id) {
  return request('/api/boards/' + encodeURIComponent(id))
}

export async function loadTemplateBoard() {
  return loadBoard('default')
}

export async function saveBoard(id, board) {
  return request('/api/boards/' + encodeURIComponent(id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ board }),
  })
}

export async function createBoard(id, board) {
  return request('/api/boards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, board }),
  })
}

async function request(url, options) {
  const response = await fetch(url, options)

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error || 'Request failed.')
  }

  return response.json()
}
