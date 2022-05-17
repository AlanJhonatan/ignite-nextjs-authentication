import { useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";

export default function Dashboard () {
  const { user } = useContext(AuthContext);
  
  return (
    <h3>Email: {user.email}</h3>
  )
}
