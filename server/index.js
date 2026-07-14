import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const boardsDir = path.join(rootDir, 'data', 'boards')
const port = Number(process.env.API_PORT || 5172)

const app = express()

app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (_request, response) => {
  response.json({ ok: true })
})

app.get('/api/boards', async (_request, response, next) => {
  try {
    await ensureBoardsDir()
    const boards = await listBoards()
    response.json({
      boards,
      defaultBoardId: boards.some((board) => board.id === 'default') ? 'default' : boards[0]?.id || null,
    })
  } catch (error) {
    next(error)
  }
})

app.post('/api/boards', async (request, response, next) => {
  try {
    const id = normalizeBoardId(request.body?.id || request.body?.name || 'board')
    const board = request.body?.board

    if (!isValidStoryMap(board)) {
      response.status(400).json({ error: 'Invalid story map payload.' })
      return
    }

    await writeBoard(id, board, { failIfExists: true })
    response.status(201).json({ id, board })
  } catch (error) {
    if (error.code === 'EEXIST') {
      response.status(409).json({ error: 'Board already exists.' })
      return
    }

    next(error)
  }
})

app.get('/api/boards/:id', async (request, response, next) => {
  try {
    const id = normalizeBoardId(request.params.id)
    const board = await readBoard(id)
    response.json({ id, board })
  } catch (error) {
    if (error.code === 'ENOENT') {
      response.status(404).json({ error: 'Board not found.' })
      return
    }

    next(error)
  }
})

app.put('/api/boards/:id', async (request, response, next) => {
  try {
    const id = normalizeBoardId(request.params.id)
    const board = request.body?.board || request.body

    if (!isValidStoryMap(board)) {
      response.status(400).json({ error: 'Invalid story map payload.' })
      return
    }

    await writeBoard(id, board)
    response.json({ id, board, savedAt: new Date().toISOString() })
  } catch (error) {
    next(error)
  }
})

app.delete('/api/boards/:id', async (request, response, next) => {
  try {
    const id = normalizeBoardId(request.params.id)
    if (id === 'default') {
      response.status(400).json({ error: 'The default board cannot be deleted.' })
      return
    }

    await fs.unlink(boardPath(id))
    response.status(204).end()
  } catch (error) {
    if (error.code === 'ENOENT') {
      response.status(404).json({ error: 'Board not found.' })
      return
    }

    next(error)
  }
})

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({ error: 'Unexpected server error.' })
})

app.listen(port, () => {
  console.log(`Story mapping API listening on http://127.0.0.1:${port}`)
})

async function ensureBoardsDir() {
  await fs.mkdir(boardsDir, { recursive: true })
}

async function listBoards() {
  const entries = await fs.readdir(boardsDir, { withFileTypes: true })
  const boards = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .map(async (entry) => {
        const id = path.basename(entry.name, '.json')
        const stats = await fs.stat(boardPath(id))
        return { id, name: boardNameFromId(id), updatedAt: stats.mtime.toISOString() }
      }),
  )

  return boards.sort((left, right) => {
    if (left.id === 'default') return -1
    if (right.id === 'default') return 1
    return left.id.localeCompare(right.id)
  })
}

async function readBoard(id) {
  const raw = await fs.readFile(boardPath(id), 'utf8')
  const board = JSON.parse(raw)

  if (!isValidStoryMap(board)) {
    const error = new Error('Invalid board file.')
    error.code = 'EINVAL'
    throw error
  }

  return board
}

async function writeBoard(id, board, options = {}) {
  await ensureBoardsDir()
  const flag = options.failIfExists ? 'wx' : 'w'
  await fs.writeFile(boardPath(id), JSON.stringify(board, null, 2) + '\n', { flag })
}

function boardPath(id) {
  return path.join(boardsDir, normalizeBoardId(id) + '.json')
}

function normalizeBoardId(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'board'
}

function boardNameFromId(id) {
  return id
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function isValidStoryMap(value) {
  return Boolean(value && Array.isArray(value.goals) && Array.isArray(value.releases))
}
