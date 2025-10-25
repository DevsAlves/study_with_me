import "../style/Side.css";
function Side() {
  return (
    <>
      <aside class="sidebar">
        <div class="logo">
          <h2>
            My<span class="highlight">Study</span>
          </h2>
        </div>
        <nav class="menu">
          <a href="#" class="active">
           Tela inicial
          </a>
          <a href="#">Tarefas</a>
          <a href="#">Projetos</a>
          <a href="#">Anexos</a>
        </nav>
      </aside>
    </>
  );
}

export default Side;
