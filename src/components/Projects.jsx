import useLocalStorage from "../hooks/useLocalStorage";
import "../style/Projects.css";

function getProgressColor(progress) {
  if (progress < 34) return "#ff3b3b"; // vermelho - início
  if (progress < 67) return "#ffb020"; // amarelo/laranja - em andamento
  if (progress < 100) return "#3b9bff"; // azul - quase lá
  return "#2ecc71"; // verde - concluído
}

function getStatusFromProgress(progress) {
  if (progress === 0) return "Não iniciado";
  if (progress === 100) return "Concluído";
  return "Em andamento";
}

function Projects() {
  const [projects, setProjects] = useLocalStorage("projects", []);

  function handleAddProject() {
    const newProject = {
      id: Date.now(),
      name: "",
      progress: 0,
      status: "Não iniciado",
      isEditing: true, // já nasce em modo edição
    };
    setProjects([newProject, ...projects]);
  }

  function handleDelete(id) {
    setProjects(projects.filter((project) => project.id !== id));
  }

  function handleProgressChange(id, value) {
    setProjects(
      projects.map((project) =>
        project.id === id
          ? { ...project, progress: value, status: getStatusFromProgress(value) }
          : project
      )
    );
  }

  function handleNameChange(id, value) {
    setProjects(
      projects.map((project) =>
        project.id === id ? { ...project, name: value } : project
      )
    );
  }

  function toggleEdit(id) {
    setProjects(
      projects.map((project) =>
        project.id === id ? { ...project, isEditing: !project.isEditing } : project
      )
    );
  }

  function handleSave(id) {
    setProjects(
      projects.map((project) =>
        project.id === id
          ? {
              ...project,
              name: project.name.trim() === "" ? "Projeto sem nome" : project.name,
              isEditing: false,
            }
          : project
      )
    );
  }

  return (
    <section id="projetos" className="projects">
      <div className="projects-header">
        <h1 className="projects-title">
          Meus <span className="highlight">Projetos</span>
        </h1>
        <button className="add-btn" onClick={handleAddProject}>
          + Adicionar
        </button>
      </div>

      {projects.length === 0 ? (
        <p className="projects-empty">Nenhum projeto ainda</p>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              {project.isEditing ? (
                <>
                  <input
                    type="text"
                    className="project-name-input"
                    placeholder="Nome do projeto..."
                    value={project.name}
                    autoFocus
                    onChange={(e) => handleNameChange(project.id, e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSave(project.id)}
                  />

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${project.progress}%`,
                        backgroundColor: getProgressColor(project.progress),
                        boxShadow: `0 0 8px ${getProgressColor(project.progress)}`,
                      }}
                    ></div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={project.progress}
                    onChange={(e) =>
                      handleProgressChange(project.id, Number(e.target.value))
                    }
                  />
                  <span
                    className="progress-label"
                    style={{ color: getProgressColor(project.progress) }}
                  >
                    {project.progress}%
                  </span>

                  <div className="card-actions">
                    <button className="save-btn" onClick={() => handleSave(project.id)}>
                      Salvar
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(project.id)}
                      aria-label="Excluir projeto"
                    >
                      ×
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="project-card-header">
                    <h3>{project.name}</h3>
                    <div className="card-icons">
                      <button
                        className="edit-btn"
                        onClick={() => toggleEdit(project.id)}
                        aria-label="Editar projeto"
                      >
                        ✎
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(project.id)}
                        aria-label="Excluir projeto"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <span
                    className="status-tag"
                    style={{
                      color: getProgressColor(project.progress),
                      backgroundColor: `${getProgressColor(project.progress)}22`,
                    }}
                  >
                    {project.status}
                  </span>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${project.progress}%`,
                        backgroundColor: getProgressColor(project.progress),
                        boxShadow: `0 0 8px ${getProgressColor(project.progress)}`,
                      }}
                    ></div>
                  </div>
                  <span
                    className="progress-label"
                    style={{ color: getProgressColor(project.progress) }}
                  >
                    {project.progress}%
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Projects;