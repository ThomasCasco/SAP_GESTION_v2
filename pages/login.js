import Layout from '../components/Layout';
import LoginForm from '../components/LoginForm';

/**
 * Página de login
 */
export default function Login() {
  return (
    <Layout requireAuth={false}>
      <LoginForm />
    </Layout>
  );
} 