import { IUser } from './user.types'

declare global {
  namespace Express {
    interface Request {
      user?: Pick<IUser, '_id' | 'role' | 'email' | 'name'>
    }
  }
}
