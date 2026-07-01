import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../db'

export const authRouter = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

authRouter.post('/login', async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: 'Email y contraseña requeridos' })
    return
  }

  const { email, password } = result.data
  const admin = await prisma.admin.findUnique({ where: { email } })

  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    res.status(401).json({ error: 'Credenciales incorrectas' })
    return
  }

  const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET!, { expiresIn: '8h' })
  res.json({ token, email: admin.email })
})
