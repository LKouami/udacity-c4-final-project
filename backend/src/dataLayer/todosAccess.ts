import * as AWS from 'aws-sdk'
var AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
// import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

// const logger = createLogger('TodosAccess')

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosUserIndex = process.env.TODOS_USER_INDEX
  ) {}

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    console.log('Getting all todos')

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.todosUserIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async getTodoItem(todoId: string, userId: string): Promise<TodoItem> {
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.todosUserIndex,
        KeyConditionExpression: 'userId = :userId and todoId = :todoId',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':todoId': todoId
        }
      })
      .promise()

    const item = result.Items[0]
    return item as TodoItem
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise()

    return todo
  }

  async updateTodoItem(
      todoId: string,
      userId: string,
    todoUpdate: TodoUpdate
  ): Promise<TodoUpdate> {
    
    await this.docClient
        .update({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeValues: {
                ':name': todoUpdate.name,
                ':dueDate': todoUpdate.dueDate,
                ':done': todoUpdate.done
            },
            ExpressionAttributeNames: {
                '#name': 'name'
            },
            ReturnValues: 'ALL_NEW'
        
        })
        .promise()
        const todoItemUpdated = todoUpdate as TodoUpdate
        return todoItemUpdated as TodoUpdate

  }

  async deleteTodoItem(todoId: string, userId: string): Promise<string> {
    var params = {
      TableName: this.todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      },
    }

    await this.docClient.delete(params).promise()

    return todoId as string
  }

  async setItemUrl(
    todoId: string,
    createdAt: string,
    itemUrl: string
  ): Promise<void> {
    var params = {
      TableName: this.todosTable,
      Key: {
        todoId,
        createdAt
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': itemUrl
      },
      ReturnValues: 'UPDATED_NEW'
    }

    await this.docClient.update(params).promise()
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8005'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
