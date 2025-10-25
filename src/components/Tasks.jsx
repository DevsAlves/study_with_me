import { useState } from "react";
import "../style/Tasks.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCheck } from "@fortawesome/free-solid-svg-icons";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  // Adiciona uma nova tarefa
  const handleAddTask = () => {
    if (newTask.trim() === "") return; // não adiciona tarefa vazia
    setTasks([...tasks, { id: Date.now(), text: newTask, done: false }]);
    setNewTask("");
  };

  // Conclui/alternar tarefa
  const toggleTask = (id) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  // Deleta tarefa
  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <section className="task-page">
      <h1 className="title">
        Minhas <span className="highlight">Tarefas</span>
      </h1>

      {/* Input e botão para adicionar tarefa */}
      <div className="add-task">
        <input
          type="text"
          placeholder="Nova tarefa..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddTask();
          }}
        />
        <button onClick={handleAddTask}>Adicionar</button>
      </div>

      {/* Lista de tarefas */}
      <ul className="task-list">
        {tasks.length === 0 && <li className="empty">Nenhuma tarefa ainda</li>} {/* Esta mensagem aparece se não houver tarefas */} 

        {tasks.map((task) => (
          <li key={task.id} className={task.done ? "done" : ""}>
            <span>{task.text}</span>

            <div className="button-group">
              {/* Botão concluir */}
              <button
                className="complete-btn"
                onClick={() => toggleTask(task.id)}
              >
                <FontAwesomeIcon icon={faCheck} />
              </button>

              {/* Botão deletar */}
              <button
                className="delete-btn"
                onClick={() => deleteTask(task.id)}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Tasks;
