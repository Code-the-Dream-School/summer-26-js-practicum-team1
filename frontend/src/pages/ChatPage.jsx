import Chat from '../components/chat/Chat';
import { useParams } from 'react-router-dom';

const ChatPage = () => {
  const { requestId } = useParams();
  return <Chat requestId={requestId} />;
};
export default ChatPage;
