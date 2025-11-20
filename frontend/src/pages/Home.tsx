import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        padding: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          maxWidth: '600px',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '1rem',
            color: '#333',
            fontWeight: 'bold'
          }}>
            Welcome{user?.firstName ? `, ${user.firstName}` : ''}!
          </h1>
          <p style={{ 
            color: '#666', 
            marginBottom: '2rem',
            fontSize: '1.1rem'
          }}>
            You're successfully logged in to the Army Recruitment Platform.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/dashboard"
              style={{
                padding: '0.875rem 2rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                display: 'inline-block'
              }}
            >
              Go to Dashboard
            </Link>
            <Link
              to="/career"
              style={{
                padding: '0.875rem 2rem',
                background: '#f0f0f0',
                color: '#333',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                display: 'inline-block'
              }}
            >
              Explore Careers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '1rem',
          color: '#333',
          fontWeight: 'bold'
        }}>
          Army Recruitment Platform
        </h1>
        <p style={{ 
          color: '#666', 
          marginBottom: '2rem',
          fontSize: '1.1rem'
        }}>
          Discover your path to service. Get personalized career guidance, training support, and join a community of recruits.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/register"
            style={{
              padding: '0.875rem 2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              display: 'inline-block'
            }}
          >
            Get Started
          </Link>
          <Link
            to="/login"
            style={{
              padding: '0.875rem 2rem',
              background: '#f0f0f0',
              color: '#333',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              display: 'inline-block'
            }}
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
