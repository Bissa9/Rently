import React from 'react'
import CarPreview from '../components/CarPreview'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { Button, Layout } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import BackButton from '../components/BackButton'

function Results () {
  const navigate = useNavigate()
  const location = useLocation()
  const title = location.state?.title
  const addCar = location.state?.bool
  const cars = location.state?.car || [];

  return (
    <div>
      <Layout className='profile-layout'>
        
        <div className='results-display'>
          <BackButton/>
          <div className='results-title'><h2>{title}</h2></div>
          
  {cars.length > 0 ? (
    cars.map((car) => (
      <CarPreview key={car._id} car={car}  />
    ))
  ) : (
    <p>No cars available.</p>
  )}


          <div className='add-car'>
            {addCar ? (
              <>
                <Button onClick={() => navigate('/carlisting')}>
                  <PlusOutlined />
                </Button>
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
      </Layout>
    </div>
  )
}

export default Results
