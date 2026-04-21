import { useState } from "react";
import Login from "./pages/Login";
import Manager from "./pages/manager/ManagerLayout";
import Gerente from "./pages/gerente/Gerente";

export default function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);

  const handleLogin = async (email, password) => {
    // 🔴 AQUÍ VA EL BACKEND DESPUÉS
    // const data = await loginUser(email, password)

    // 🔴 SIMULACIÓN POR AHORA
    let role = email.includes("manager") ? "manager" : "gerente";

    setUser({ email, role });

    if (role === "manager") setPage("manager");
    else setPage("gerente");
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