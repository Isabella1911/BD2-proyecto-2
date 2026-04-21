import GerenteLayout from "./GerenteLayout";

export default function Gerente({ user, onLogout }) {
  return <GerenteLayout user={user} onLogout={onLogout} />;
}