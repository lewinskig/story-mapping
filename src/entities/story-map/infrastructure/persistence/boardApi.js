export async function listBoards() {
  const payload = await request('/api/boards')
  return payload
}

export async function loadBoard(id) {
  const payload = await request('/api/boards/' + encodeURIComponent(id))
  return payload
}

export async function saveBoard(id, board) {
  const payload = await request('/api/boards/' + encodeURIComponent(id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ board }),
  })
  return payload
}

export async function createBoard(id, board) {
  const payload = await request('/api/boards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, board }),
  })
  return payload
}

async function request(url, options) {
  const response = await fetch(url, options)

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error || 'Request failed.')
  }

  return response.json()
}
