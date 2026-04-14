import { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Completa todos los campos");
      return;
    }

    onLogin(email, password);
  };

  return (
    <main className="page">
      <section className="card">
        <h1>SUPER MART</h1>
        <div className="red-line"></div>

        <form className="login-box" onSubmit={submit}>
          <h2>Log in</h2>

          <input
            type="email"
            placeholder="gmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Ingresar</button>
        </form>
      </section>
    </main>
  );
}