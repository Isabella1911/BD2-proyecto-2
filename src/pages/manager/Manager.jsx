import ManagerLayout from "./manager/ManagerLayout";

export default function Manager({ user, onLogout }) {
  return <ManagerLayout user={user} onLogout={onLogout} />;
}