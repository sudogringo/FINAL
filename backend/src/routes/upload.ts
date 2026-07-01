import express, { Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { requireAuth } from '../middleware/auth'

const uploadDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|jpg|png|webp|gif)$/.test(file.mimetype)) cb(null, true)
    else cb(new Error('Solo se permiten imágenes (jpg, png, webp)'))
  },
})

export const uploadRouter = express.Router()

uploadRouter.post('/', requireAuth, upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) { res.status(400).json({ error: 'No se recibió archivo' }); return }
  const host = `${req.protocol}://${req.get('host')}`
  res.json({ url: `${host}/uploads/${req.file.filename}` })
})
