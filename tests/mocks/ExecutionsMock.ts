import { Execution, ExecutionTasks } from "@src/@types/Execution";
import { ProgressUpdate, Task } from "@src/@types/Task";

export const EXECUTION_MOCK: Execution = {
  id: "execution-id",
  number: 1,
  status: "COMPLETED",
  created_at: "2023-11-26T12:00:00Z",
  updated_at: "2023-11-26T12:00:00Z",
  type: "replica_execution",
};

export const PROGRESS_UPDATE_MOCK: ProgressUpdate = {
  index: 1,
  message: "message progress 66%",
  created_at: "2023-11-26T12:00:00Z",
  total_steps: 1,
  current_step: 1,
};

export const TASK_MOCK: Task = {
  id: "task-id",
  status: "COMPLETED",
  created_at: "2023-11-26T12:00:00Z",
  updated_at: "2023-11-26T12:00:00Z",
  progress_updates: [PROGRESS_UPDATE_MOCK],
  task_type: "replica_execution",
  instance: "instance-id",
  depends_on: [],
  exception_details: "exception-details",
};

export const EXECUTION_TASKS_MOCK: ExecutionTasks = {
  ...EXECUTION_MOCK,
  tasks: [TASK_MOCK],
};
