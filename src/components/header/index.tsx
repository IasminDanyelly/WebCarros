import {useContext} from 'react'
import {AuthContext} from '../../contexts/AuthContext'
import logoImg from "../../assets/logo.svg";
import { Link } from 'react-router-dom';
import { FaRegCircleUser } from "react-icons/fa6";
import { IoMdExit } from "react-icons/io";
import '../../index.css';

export  function Header() {
  const {signed, loadingAuth} = useContext(AuthContext)

return (

    <div className='w-full flex  items-center justify-center h-[80px] bg-white drop-shadow mb-4'>
      <header className='flex w-full max-w-7xl items-center justify-between px-4 mx-auto'>
        <Link to='/' className='w-[260px] h-auto'>    
          <img 
            src={logoImg}
            alt='Logo do site'
          />   
        </Link> 

       {!loadingAuth && signed && (
         <Link to='/dashboard'>
          <div className='group'>
            <FaRegCircleUser size={28} className='text-[#E11138] group-hover:text-[#a81717] transition-all duration-200'  />
            </div>
         </Link>
       )}

       {!loadingAuth && !signed && (
        <Link to='/login'>
          <div className='group'> 
            <IoMdExit size={28} className='text-[#E11138] group-hover:text-[#a81717] transition-all duration-200' />
          </div>
        </Link>
       )}

    
      </header>
    </div>
 );
}