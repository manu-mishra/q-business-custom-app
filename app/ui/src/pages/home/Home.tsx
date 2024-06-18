import "./Home.css";
import { API } from '../../api/ApiClient';
import React from "react";

export const Home = () => {
  // create a state variable to capture state response from APIs as string
  const [response, setResponse] = React.useState<string>('');
  const fetchApi = async () => {
    const response = await API.get('/');
    setResponse(JSON.stringify(response.data));
  };
  const fetchMeetings = async () => {
    const response = await API.get('/api/meetings');
    setResponse(JSON.stringify(response.data));
  };
  const fetchChats = async () => {
    const response = await API.get('/api/conversations');
    setResponse(JSON.stringify(response.data));
  };
  return (
    <div className="home-container"> 
    {process.env.REACT_APP_API_BASE_URL}
      <button onClick={fetchApi}>get health</button>
    </div>
  );
}

