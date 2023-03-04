import * as uuid from 'uuid'
import { AttachmentUtils } from '../helpers/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'
import { TodoUpdate } from '../models/TodoUpdate'
// import { TodoUpdate } from '../models/TodoUpdate'
// import { createLogger } from '../utils/logger'


const todosAccess = new TodosAccess()
// const logger = createLogger('todosAccess')
const attachmentUtils = new AttachmentUtils()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    return todosAccess.getAllTodos(userId)
}

export async function getAllTodos(jwtToken: string): Promise<TodoItem[]> {
    const userId = parseUserId(jwtToken)
    return todosAccess.getAllTodos(userId)
}

export async function createTodo(
    newTodo: CreateTodoRequest,
    userId: string
    ): Promise<TodoItem> {
    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()
    const s3AttachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
    const newItem = {
        userId,
        todoId,
        createdAt,
        name: newTodo.name,
        dueDate : newTodo.dueDate,
        done: false,
        attachmentUrl: s3AttachmentUrl,
        ...newTodo
    }
    return await todosAccess.createTodo(newItem)
}

export async function getTodoItem(todoId: string, jwtToken: string): Promise<TodoItem> {
  const userId = parseUserId(jwtToken)
  return await todosAccess.getTodoItem(todoId, userId)
}

export async function setItemUrl(todoId: string, itemUrl: string, jwtToken: string): Promise<void> {
  console.log("Setting Item URL")
  console.log(itemUrl)
  console.log(todoId)
  const userId = parseUserId(jwtToken)
  const todoItem = await todosAccess.getTodoItem(todoId, userId)

  todosAccess.setItemUrl(todoItem.todoId, todoItem.createdAt, itemUrl);
}

export async function updateTodo(
    todoId: string,
    todoUpdate: UpdateTodoRequest,
    userId: string, 
  ): Promise<TodoUpdate> {
    
    return todosAccess.updateTodoItem(userId,todoId,  todoUpdate)
}

export async function deleteTodo(
  todoId: string,
    userId: string,
): Promise<string> {
    return todosAccess.deleteTodoItem(todoId, userId)
}

export async function createAttachmentPresignedUrl(
    todoId: string,
    userId: string
): Promise<string> {
  console.log("Creating Attachment Presigned URL for ", userId)
    return attachmentUtils.getUploadUrl(todoId)
}