//import './App.css';
import Nav from './Nav/Nav';
import DashboardContent from   './Contents/DashboardContent';
import LinkContent from './Contents/LinkContent';
import { BrowserRouter, Route,Routes  } from 'react-router-dom';
import { Container, Box } from '@mui/material';

////////////////
function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Box sx={{ minHeight: 'calc(100vh - 64px)' }}>
        <Routes>
          <Route path='/' exact Component={DashboardContent}></Route>
          <Route path='/link' exact Component={LinkContent}></Route>
        </Routes>
      </Box>
    </BrowserRouter>
      
   
  );
}

export default App;
