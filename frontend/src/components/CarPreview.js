import React from 'react'
import '../resources/car.css'
import { useNavigate } from 'react-router-dom'
function CarPreview ({car}) {
  const navigate = useNavigate();
  const handleViewMore = () => {
    navigate('/cardetails', { state: { car } }); 
  };
  function removeYearFromModel(model) {
  return model?.replace(/\b(19|20)\d{2}\b/, '').trim();
}
  function extractYearFromModel(model) {
  const match = model?.match(/\b(19|20)\d{2}\b/); 
  return match ? parseInt(match[0]) : null;
}
  return (
    <div className='car-prev-container'>
      <div className='car-prev-image'>
        <img src={car?.mainPhoto} alt='car'/>
      </div>

      <div className='car-prev-info'>
        <p>Car Name: {car?.make} {removeYearFromModel(car?.model)} </p>
        <p>Year:{ extractYearFromModel(car?.model)}</p>
        <p>Seats: {car?.seats}</p>
        <span onClick={handleViewMore}>More details&gt;</span>
      </div>
    </div>
  )
}

export default CarPreview
