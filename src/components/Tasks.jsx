import useLocalStorage from "../hooks/useLocalStorage";
import "../style/Tasks.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCheck, faPen } from "@fortawesome/free-solid-svg-icons";

const CATEGORIES = ["Projeto", "Estudo", "Pessoal", "Outro"];

function getCategoryColor(category) {
  switch (category) {
    case "Projeto":
      return "#ff0055";
    case "Estudo":
      return "#3b9bff";
    case "Pessoal":
      return "#2ecc71";
    default:
      return "#b0b0b0";
  }
}

function Tasks() {
  const [tasks, setTasks] = useLocalStorage("tasks", []);;

  function handleAddTask() {
    const newTask = {
      id: Date.now(),
      text: "",
      done: false,
      category: "Projeto",
      linkedTo: "",
      isEditing: true,
    };
    setTasks([newTask, ...tasks]);
  }

  function toggleTask(id) {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  function deleteTask(id) {
    setTasks(tasks.filter((t) => t.id !== id));
  }

  function toggleEdit(id) {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, isEditing: !t.isEditing } : t))
    );
  }

  function updateField(id, field, value) {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  }

  function handleSave(id) {
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              text: t.text.trim() === "" ? "Tarefa sem título" : t.text,
              isEditing: false,
            }
          : t
      )
    );
  }

  return (
    <section id="task-page" className="task-page">
      <div className="tasks-header">
        <h1 className="title">
          Minhas <span className="highlight">Tarefas</span>
        </h1>
        <button className="add-btn" onClick={handleAddTask}>
          + Adicionar
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="tasks-empty">Nenhuma tarefa ainda</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`task-card ${task.done ? "done" : ""}`}
            >
              {task.isEditing ? (
                <div className="task-edit-form">
                  <input
                    type="text"
                    className="task-name-input"
                    placeholder="Nova tarefa..."
                    value={task.text}
                    autoFocus
                    onChange={(e) => updateField(task.id, "text", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSave(task.id)}
                  />

                  <div className="task-edit-row">
                    <select
                      className="category-select"
                      value={task.category}
                      onChange={(e) =>
                        updateField(task.id, "category", e.target.value)
                      }
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      className="link-input"
                      placeholder={`Nome do ${task.category.toLowerCase()}...`}
                      value={task.linkedTo}
                      onChange={(e) =>
                        updateField(task.id, "linkedTo", e.target.value)
                      }
                    />
                  </div>

                  <div className="card-actions">
                    <button className="save-btn" onClick={() => handleSave(task.id)}>
                      Salvar
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => deleteTask(task.id)}
                      aria-label="Excluir tarefa"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="task-main">
                    <button
                      className="complete-btn"
                      onClick={() => toggleTask(task.id)}
                      aria-label="Concluir tarefa"
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>

                    <div className="task-info">
                      <span className="task-text">{task.text}</span>
                      {task.linkedTo && (
                        <span
                          className="link-tag"
                          style={{
                            color: getCategoryColor(task.category),
                            backgroundColor: `${getCategoryColor(task.category)}22`,
                          }}
                        >
                          {task.category}: {task.linkedTo}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="button-group">
                    <button
                      className="edit-btn"
                      onClick={() => toggleEdit(task.id)}
                      aria-label="Editar tarefa"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => deleteTask(task.id)}
                      aria-label="Excluir tarefa"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Tasks;