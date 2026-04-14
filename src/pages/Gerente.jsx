export default function Gerente({ user, onLogout }) {
  return (
    <main className="dashboard">
      <header>
        <h1>Gerente General</h1>
        <button onClick={onLogout}>Cerrar sesión</button>
      </header>

      <p>Bienvenida: {user.email}</p>

      <div className="grid">
        <div className="card-box">Sedes</div>
        <div className="card-box">Ventas</div>
        <div className="card-box">Managers</div>
      </div>
    </main>
  );
}