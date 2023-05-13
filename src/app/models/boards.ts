// interface for logged in Person
export interface Person {
  name: string,
  email: string,
  pwd: string
}

//interfaces for Datastruckture
export interface Board {
  id: number,
  name: string,
  tasks: Task[]
}

export interface Task {
  id: number,
  //position: number,
  name: string,
  states: State[]
}

export interface State {
  id: number,

  position: number,
  state: string,
  subtasks: Subtask[]
}

export interface Subtask {
  id: number,
  position: number,
  name: string,
  description: string,
  worker: string,
  priority: number,
  color: string
}
