import { FormEvent, useContext, useState } from 'react';
import styles from '../styles/Home.module.css';
import { AuthContext } from './contexts/AuthContext';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signIn } = useContext(AuthContext);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const data = {
      email,
      password,
    };

    signIn(data);
  }
  
  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <label htmlFor="email">Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label htmlFor="password">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type='submit'>Entrar</button>
    </form>
  )
}
