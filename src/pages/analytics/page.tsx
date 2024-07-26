
//import ApexParent from '@/components/sections/apexParent'
//import Transactions from '@/components/forms/Transactions'
//import ToOrderCards from '@/components/sections/toOrder';
import Menu from '../../components/buttons/menu'

import DataAndAnalytics from '../../components/sections/dataAndAnalytics'
const Home = () => {
  return (
  <div>
    <Menu />
          <div className="flex justify-center items-center w-full py-4">
        <div>
            <img src="/logo.png" alt="Logo" className="h-20 w-20 mx-auto"></img>
            
        </div>
    </div>

      
     <DataAndAnalytics /> 
     </div>
  )
}

export default Home
