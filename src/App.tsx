import { Navigate, Route, Routes } from 'react-router-dom';
import Client from './view/client';
import './App.css';
import Admin from './view/admin';

function App() {
  return (
    <Routes>
      <Route path='/'>
        <Route index element={<Client />} />
        <Route path='iamadmin' element={<Admin />} />
        <Route path='*' element={<Navigate to='' />} />
      </Route>
    </Routes>
  );
}

export default App;
