import 'bootstrap/dist/css/bootstrap.min.css';

//import './App.css';
import Nav from './Nav/Nav';
import DashboardContent from   './Contents/DashboardContent';
import LinkContent from './Contents/LinkContent';
import { BrowserRouter, Route,Routes  } from 'react-router-dom';

////////////////
function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path='/' exact Component={DashboardContent}></Route>
        <Route path='/link' exact Component={LinkContent}></Route>
      </Routes>
    </BrowserRouter>
      
   
  );
}

export default App;
