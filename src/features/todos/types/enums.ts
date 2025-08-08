import z from "zod"

export const StatusList = ['open', 'in_progress', 'completed', 'cancelled', 'archived'] as const
export type Status = typeof StatusList[number]
export const StatusSchema = z.enum(StatusList)

export const PriorityList = ['low', 'medium', 'high'] as const
export type Priority = typeof PriorityList[number]
export const PrioritySchema = z.enum(PriorityList)