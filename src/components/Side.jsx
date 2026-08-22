import "../style/Side.css";
function Side() {
  return (
    <>
      <aside className="sidebar">
        <div className="logo">
          <h2>
            My<span className="highlight">Study</span>
          </h2>
        </div>
        <nav className="menu">
          <a href="#task-page">Tarefas</a>
          <a href="#clock">Relógio</a>
          <a href="#sleep">Painel Anti-sono</a>
          <a href="#projetos">Projetos</a>
        </nav>
      </aside>
    </>
  );
}

export default Side;