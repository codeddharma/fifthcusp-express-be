import { Document, model, Schema } from 'mongoose'

export interface IJobOpening extends Document {
  title: string
  description: string
  department: string
  location: string
  employmentType: 'full-time' | 'part-time' | 'contract' | 'freelance'
  experienceLevel: 'junior' | 'mid' | 'senior'
  experienceYears: number
  skills: string[]
  qualifications: string[]
  responsibilities: string[]
  salaryMin?: number
  salaryMax?: number
  applicationDeadline?: Date
  isActive: boolean
  isClosed: boolean
  closedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const JobOpeningSchema = new Schema<IJobOpening>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    employmentType: { type: String, enum: ['full-time', 'part-time', 'contract', 'freelance'], required: true },
    experienceLevel: { type: String, enum: ['junior', 'mid', 'senior'], required: true },
    experienceYears: { type: Number, required: true, min: 0 },
    skills: { type: [String], required: true },
    qualifications: { type: [String], required: true },
    responsibilities: { type: [String], required: true },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    applicationDeadline: { type: Date },
    isActive: { type: Boolean, default: true },
    isClosed: { type: Boolean, default: false },
    closedAt: { type: Date },
  },
  { timestamps: true },
)

export const JobOpening = model<IJobOpening>('JobOpening', JobOpeningSchema)
