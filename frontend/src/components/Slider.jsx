import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "../resources/slider.css";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
const Slider = ({ items, title, itemRef ,onItemClick}) => {
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const handleSlideChange = () => {
    if (itemRef.current) {
      setIsBeginning(itemRef.current.swiper.isBeginning);
      setIsEnd(itemRef.current.swiper.isEnd);
    }
  };
  return (
    <div className="slider-container">
      <div className="slider-header">
        <h2>{title}</h2>
        <div className="arrows">
          <FiChevronLeft
            className={`arrow prev ${isBeginning ? "disabled" : ""}`}
            onClick={() => !isBeginning && itemRef.current.swiper.slidePrev()}
          />
          <FiChevronRight
            className={`arrow next ${isEnd ? "disabled" : ""}`}
            onClick={() => !isEnd && itemRef.current.swiper.slideNext()}
          />
        </div>
      </div>
      <div
        className={`slider-content ${
          title === "Car Brands" ? "extra-height" : ""
        }`}
      >
        <Swiper
          ref={itemRef}
          modules={[Navigation]}
          slidesPerView={3} // Show 3 slides at a time
          spaceBetween={30}
          centeredSlides={false} // Ensures proper alignment
          navigation={false} // Disables built-in navigation UI
          touchRatio={1} // Ensures smooth swiping
          resistance={true} // Prevents fast skipping
          resistanceRatio={0.85} // Adjusts resistance
          onSlideChange={handleSlideChange}
          breakpoints={{
            950: {
              slidesPerView: 3, // 3 slides when width is 850px and above
            },
            650: {
              slidesPerView: 2, // 2 slides when width is between 650px and 849px
            },
            0: {
              slidesPerView: 1, // 1 slide when width is below 650px
            },
          }}
        >
          {items.map((item, index) => (
            <SwiperSlide key={index} className="swiper-slide"onClick={() => onItemClick(item.name)}>
              <div className="slide">
                <img src={item.img} alt={item.name} className={`slider-image `} />

                <div className="slider-name-container">
                  <p>{item.name}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Slider;
