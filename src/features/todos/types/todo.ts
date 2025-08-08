import z from "zod";
import { PrioritySchema, StatusSchema } from "./enums";


export const TodoSchema = z.object({
    id: z.string(),
    title: z.string().min(1, "Title is required"),
    status: StatusSchema.default('open'),
    createdAt: z.number().int().nonnegative().default(() => Date.now()),
    description: z.string().trim().max(300).optional(),
    dueDate: z.number().int().positive().optional(),
    completedAt: z.number().int().positive().optional(),
    priority: PrioritySchema.default('medium'),
    tags: z.array(z.string().trim().min(1)).default([])
})
.superRefine((obj, ctx)=>{
    if(obj.dueDate && obj.dueDate < obj.createdAt){
        ctx.addIssue({code: 'custom', path: ['dueDate'], message: 'dueDate cannot be earlier than createdAt'})
    }
    if(obj.status === 'completed') {
        if (!obj.completedAt) {
            ctx.addIssue({ code: 'custom', path: ['completedAt'], message: 'completedAt is required when status=completed' })
        } else if (obj.completedAt < obj.createdAt) {
            ctx.addIssue({ code: 'custom', path: ['completedAt'], message: 'completedAt cannot be earlier than createdAt' })
        }
    }
    if((obj.status === 'cancelled' || obj.status === 'archived') && obj.completedAt) {
        ctx.addIssue({ code: 'custom', path: ['completedAt'], message: 'completedAt must be empty unless status=completed' })
    }
})

export type Todo = z.infer<typeof TodoSchema>;

export const TodoCreateSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().max(300).optional(),
  dueDate: z.number().int().positive().optional(),
  priority: PrioritySchema.default('medium').optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
})
export type TodoCreate = z.infer<typeof TodoCreateSchema>

export const TodoUpdateSchema = z.object({
  title: z.string().trim().min(1).optional(),
  status: StatusSchema.optional(),
  description: z.string().trim().max(300).optional(),
  dueDate: z.number().int().positive().nullable().optional(),
  completedAt: z.number().int().positive().nullable().optional(),
  priority: PrioritySchema.optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
})
export type TodoUpdate = z.infer<typeof TodoUpdateSchema>

export const isOverdue = (t: Todo, now = Date.now()) =>
  t.status !== 'completed' &&
  t.status !== 'cancelled' &&
  !!t.dueDate &&
  t.dueDate < now
