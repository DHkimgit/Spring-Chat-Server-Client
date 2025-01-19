import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import ChatLogin from './pages/ChatLogin';
import ChatRoom from './pages/ChatRoom';
import ChatRoomList from "./pages/ChatRoomList";

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
  },
});

function App() {
  return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<ChatLogin />} />
            <Route path="/chat" element={<ChatRoom />} />
              <Route path="/chat-list" element={<ChatRoomList />} />
          </Routes>
        </Router>
      </ThemeProvider>
  );
}

export default App;