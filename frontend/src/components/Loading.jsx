import Lottie from 'lottie-react';
import loadingAnimation from '../animations/loadingAnimation.json'; 
import '../resources/loading.css';
const Loading = () => {
  return (
    <div className="loading-container">
      <Lottie animationData={loadingAnimation} loop={true}  style={{ width: '200px', height: '200px' }} />
    </div>
  );
};

export default Loading;
