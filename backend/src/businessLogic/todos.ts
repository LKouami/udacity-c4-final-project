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
    // const s3AttachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
    const newItem = {
        userId,
        todoId,
        createdAt,
        name: newTodo.name,
        dueDate : newTodo.dueDate,
        done: false,
        // attachmentUrl: s3AttachmentUrl,
        ...newTodo
    }
    return await todosAccess.createTodo(newItem)
}

export async function getTodoItem(todoId: string, jwtToken: string): Promise<TodoItem> {
  const userId = parseUserId(jwtToken)
  return await todosAccess.getTodoItem(todoId, userId)
}

export async function setItemUrl(todoId: string, itemUrl: string, userId: string): Promise<void> {
 
  const todoItem = await todosAccess.getTodoItem(todoId, userId)

  todosAccess.setItemUrl(todoItem.todoId, todoItem.createdAt, itemUrl);
}

export async function updateTodo(
    todoId: string,
    todoUpdate: UpdateTodoRequest,
    userId: string, 
  ): Promise<TodoUpdate> {
   
    const s3AttachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
    todoUpdate.attachmentUrl = s3AttachmentUrl

    return todosAccess.updateTodoItem(userId,todoId,  todoUpdate)
}
export async function setAttachmentUrl(
    todoId: string,
    todoUpdate: UpdateTodoRequest,
    url:string,
    userId: string, 
  ): Promise<TodoUpdate> {
    todoUpdate.attachmentUrl = url
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
  // const userTodo = await getTodoItem(todoId, userId)
    // setAttachmentUrl(todoId, userTodo, userId)
  const bucketName = process.env.ATTACHMENT_S3_BUCKET
  await todosAccess.saveImgUrl(userId, todoId, bucketName);
  return attachmentUtils.getUploadUrl(todoId)
}