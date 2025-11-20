import { useParams } from 'react-router-dom';

export default function AgentChat() {
  const { agentType } = useParams<{ agentType: string }>();
  
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Chat with {agentType} Agent</h2>
      <p>Agent chat interface - implementation pending</p>
    </div>
  );
}

