import { Document, model, Schema } from 'mongoose'

export type ServiceType = 'basic' | 'advanced' | 'practice' | 'numerology' | 'consultation' | 'reports_basic' | 'reports_advanced'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'password'
  | 'phonenumber'
  | 'dropdown'
  | 'multiSelect'
  | 'radio'
  | 'date'
  | 'number'
  | 'checkbox'

export interface IFormInputValidation {
  minLength?: number
  maxLength?: number
  pattern?: string
  minDate?: string
  maxDate?: string
  min?: number
  max?: number
}

export interface IFormInput {
  fieldKey: string
  label: string
  type: FieldType
  isRequired: boolean
  placeholder?: string
  tooltip?: string
  options?: string[]
  validation?: IFormInputValidation
  order: number
}

export interface IFileUploadField {
  fieldKey: string
  label: string
  tooltip?: string
  acceptedTypes: string[]
  maxFiles: number
  maxFileSizeMB: number
  isRequired: boolean
  order: number
}

export interface IServiceAddOn {
  key: string
  label: string
  description?: string
  price: number
  formInputs: IFormInput[]
  fileUploads: IFileUploadField[]
}

export interface IRepeatableGroup {
  enabled: boolean
  label: string
  maxRepeats: number
}

export interface IService extends Document {
  sku: string
  title: string
  subtitle: string
  description: string
  price: number
  type: ServiceType
  pages: string[]
  formInputs: IFormInput[]
  fileUploads: IFileUploadField[]
  addOns: IServiceAddOn[]
  repeatableGroup?: IRepeatableGroup
  isInSale: boolean
  saleTitle?: string
  hasSaleBanner: boolean
  discountPercentage: number
  isActiveService: boolean
  soldCount: number
  lastSoldDate?: Date
  // Delivery & notification config
  deliveryDays: number
  requiresConsultation: boolean
  requiresOutputFile: boolean
  feedbackEmailEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

const FormInputValidationSchema = new Schema<IFormInputValidation>(
  {
    minLength: { type: Number, min: 0 },
    maxLength: { type: Number, min: 1 },
    pattern: { type: String },
    minDate: { type: String },
    maxDate: { type: String },
    min: { type: Number },
    max: { type: Number },
  },
  { _id: false },
)

const FormInputSchema = new Schema<IFormInput>(
  {
    fieldKey: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['text', 'textarea', 'email', 'password', 'phonenumber', 'dropdown', 'multiSelect', 'radio', 'date', 'number', 'checkbox'],
    },
    isRequired: { type: Boolean, required: true },
    placeholder: { type: String, trim: true },
    tooltip: { type: String, trim: true },
    options: { type: [String] },
    validation: { type: FormInputValidationSchema },
    order: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const FileUploadFieldSchema = new Schema<IFileUploadField>(
  {
    fieldKey: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    tooltip: { type: String, trim: true },
    acceptedTypes: { type: [String], required: true },
    maxFiles: { type: Number, required: true, default: 1, min: 1 },
    maxFileSizeMB: { type: Number, required: true, default: 5, min: 0.1, max: 100 },
    isRequired: { type: Boolean, required: true },
    order: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const ServiceAddOnSchema = new Schema<IServiceAddOn>(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    formInputs: { type: [FormInputSchema], default: [] },
    fileUploads: { type: [FileUploadFieldSchema], default: [] },
  },
  { _id: false },
)

const RepeatableGroupSchema = new Schema<IRepeatableGroup>(
  {
    enabled: { type: Boolean, required: true },
    label: { type: String, required: true, trim: true },
    maxRepeats: { type: Number, required: true, min: 1, max: 20, default: 1 },
  },
  { _id: false },
)

const ServiceSchema = new Schema<IService>(
  {
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['basic', 'advanced', 'practice', 'numerology', 'consultation', 'reports_basic', 'reports_advanced'], required: true },
    pages: { type: [String], required: true },
    formInputs: { type: [FormInputSchema], default: [] },
    fileUploads: { type: [FileUploadFieldSchema], default: [] },
    addOns: { type: [ServiceAddOnSchema], default: [] },
    repeatableGroup: { type: RepeatableGroupSchema },
    isInSale: { type: Boolean, default: false },
    saleTitle: { type: String, trim: true },
    hasSaleBanner: { type: Boolean, default: false },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    isActiveService: { type: Boolean, default: true },
    soldCount: { type: Number, default: 0, min: 0 },
    lastSoldDate: { type: Date },
    deliveryDays: { type: Number, default: 7, min: 1 },
    requiresConsultation: { type: Boolean, default: false },
    requiresOutputFile: { type: Boolean, default: false },
    feedbackEmailEnabled: { type: Boolean, default: false },
  },
  { timestamps: true },
)

ServiceSchema.index({ soldCount: -1 })
ServiceSchema.index({ lastSoldDate: -1 })

export const Service = model<IService>('Service', ServiceSchema)
