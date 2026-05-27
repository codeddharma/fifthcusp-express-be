import { Request, Response } from 'express'
import { z } from 'zod'
import * as CustomerService from '../services/customer.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/ApiResponse'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'

const updateCustomerSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(7).max(20).optional(),
  notes: z.string().optional(),
})

export const listCustomers = asyncHandler(async (req: Request, res: Response) => {
  const search = typeof req.query.search === 'string' ? req.query.search : undefined
  const page = req.query.page ? Number(req.query.page) : undefined
  const limit = req.query.limit ? Number(req.query.limit) : undefined
  const result = await CustomerService.listCustomers({ search, page, limit })
  sendSuccess(res, HttpMessage.OK, result.data, HttpStatus.OK, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  })
})

export const getCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await CustomerService.getCustomerById(req.params.id)
  sendSuccess(res, HttpMessage.OK, customer, HttpStatus.OK)
})

export const updateCustomer = asyncHandler(async (req: Request, res: Response) => {
  const input = updateCustomerSchema.parse(req.body)
  const customer = await CustomerService.updateCustomer(req.params.id, input)
  sendSuccess(res, HttpMessage.UPDATED, customer, HttpStatus.OK)
})
