import {Board, State, Subtask, Task } from "./boards"

//add interfaces for communication
export interface MessageLoadBoards {
  kind_of_object: string,
  type_of_edit: string,
}


export interface MessageAddBoard {
  kind_of_object: string,
  type_of_edit: string,
  teamboard: Board,
}

export interface MessageAddTask {
  kind_of_object: string,
  type_of_edit: string,
  teamboard_id: number,
  task: Task
}

export interface MessageAddState {
  kind_of_object: string,
  type_of_edit: string,
  teamboard_id: number,
  task_id: number,
  state: State
}

export interface MessageAddSubtask {
  kind_of_object: string,
  type_of_edit: string,
  teamboard_id: number,
  task_id: number,
  state_id: number,
  subtask: Subtask
}

//delete interfaces for communication
export interface MessageDeleteBoard {
  kind_of_object: string,
  type_of_edit: string,
  teamboard: Board,
}

export interface MessageDeleteTask {
  kind_of_object: string,
  type_of_edit: string,
  teamboard_id: number,
  task: Task
}

export interface MessageDeleteState {
  kind_of_object: string,
  type_of_edit: string,
  teamboard_id: number,
  task_id: number,
  state: State
}

export interface MessageDeleteSubtask {
  kind_of_object: string,
  type_of_edit: string,
  teamboard_id: number,
  task_id: number,
  state_id: number,
  subtask: Subtask
}

//move interfaces for communication
export interface MessageMoveState {
  kind_of_object: string,
  type_of_edit: string,
  teamboard_id: number,
  task_id: number,
  oldPosition: number,
  newPosition: number,
  state: State
}

export interface MessageMoveSubtask {
  kind_of_object: string,
  type_of_edit: string,
  teamboard_id: number,
  task_id: number,
  state_id: number,
  oldPosition: number,
  newPosition: number,
  subtask: Subtask
}


export interface Token {
  token: string
}