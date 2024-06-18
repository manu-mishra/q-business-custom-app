import './Layout.css'
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
export const Layout = () => {
  return (
    <>
    <div className='layout'>
        <div className="container">
          <Header></Header>
          <main className="content"><Outlet /></main>
        </div>
    </div>
    </>
  )
}
