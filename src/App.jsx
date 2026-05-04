import { useState } from "react";
import Login from "./pages/Login";
import Manager from "./pages/manager/ManagerLayout";
import Gerente from "./pages/gerente/GerenteLayout";
import { loginUser } from "./services/api";

export default function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);

  const handleLogin = async (email, password) => {
    try {
      const data = await loginUser(email, password);
      const usuario = data.usuario;
      setUser(usuario);

      if (usuario.rol === "Manager") setPage("manager");
      else setPage("gerente");
    } catch (err) {
      alert("Credenciales incorrectas: " + err.message);
    }
  };

  const logout = () => {
    setUser(null);
    setPage("login");
  };

  return (
    <>
      {page === "login" && <Login onLogin={handleLogin} />}
      {page === "manager" && <Manager user={user} onLogout={logout} />}
      {page === "gerente" && <Gerente user={user} onLogout={logout} />}
    </>
  );
}