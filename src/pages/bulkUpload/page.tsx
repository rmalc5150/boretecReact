
import CsvUpload from '../../components/buttons/CsvUpload'
import Menu from '../../components/buttons/menu'

const Sales = () => {
  return (

      <div className="w-full h-screen">
        <Menu />
          <div className="flex justify-center items-center py-4">
        <div>
            <img src="/logo.png" alt="Logo" className="h-20 w-20 mx-auto"></img>
            
        </div>
        
    </div>
    <CsvUpload />
    </div>

  )
}

export default Sales