import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div style={{ padding: 20, background: "black", color: "white" }}>
      <h2>Rent Management</h2>
      <div style={{ float: "right" }}>
        {user && (
          <>
            {user.name} | <button onClick={logout}>Logout</button>
          </>
        )}
      </div>
    </div>
  );
}
