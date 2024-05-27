import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, FreeMode, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Person1 from "../../public/person_1.jpg.webp";
import Person2 from "../../public/person_2.jpg.webp";
import Person3 from "../../public/person_3.jpg.webp";
import Cards from "./Cards";
import { FaHandHoldingHeart } from "react-icons/fa";

const Testimonials = () => {
  return (
    <>
      <section className="max-container padding-container mt-[100px]">
        <div className="text-center">
          <span className="inline-block px-5 py-1 mb-2 text-green-600 bg-greeny-green rounded-full text-[13px] font-bold">
            Testimonials
          </span>
          <h1 className="mb-3 text-[30px] md:text-[40px] leading-tight font-extrabold text-cold-blue xl:w-[70%] mx-auto">
            Testimonials
          </h1>
          <p className="mb-9 text-base text-cold-blue  lg:w-[50%]  mx-auto">
            Feedback From Our Eco-Conscious Community
          </p>
        </div>
        <Swiper
          modules={[Navigation, Pagination, FreeMode, Autoplay]}
          freeMode={true}
          navigation
          pagination={{ dynamicBullets: true }}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          breakpoints={{
            0: {
              slidesPerView: 1,
              spaceBetween: 10,
            },
            700: {
              slidesPerView: 2,
              spaceBetween: 10,
            },
            1000: {
              slidesPerView: 3,
              spaceBetween: 10,
            },
          }}
        >
          <SwiperSlide>
            <Cards imgSrc={Person1} />
          </SwiperSlide>
          <SwiperSlide>
            <Cards imgSrc={Person2} />
          </SwiperSlide>
          <SwiperSlide>
            <Cards imgSrc={Person3} />
          </SwiperSlide>
          <SwiperSlide>
            <Cards imgSrc={Person1} />
          </SwiperSlide>
          <SwiperSlide>
            <Cards imgSrc={Person2} />
          </SwiperSlide>
        </Swiper>
      </section>
      <section className="max-container padding-container m-[96px] rounded-2xl bg-greeny-green py-3 lg:relative lg:grid  lg:grid-cols-2 xl:w-[80%] 3xl:w-[60%]">
        <div className="mb-6">
          <p className="mb-[10px] text-[28px] font-bold text-cold-blue xs:text-[32px] lg:w-[70%] lg:text-[36px]">
            Speak, Your Experiences&nbsp;
            <span className="text-green-500 underline">Shared</span>
            &nbsp; now!
          </p>
        </div>
        <div className="flex flex-col place-content-center gap-7">
          <form action="" className="relative inline-block">
            <input
              type="text"
              className="relative h-[100%] w-full rounded-[500px] border border-light-orange px-[15px] py-[23px]"
              placeholder="Review our site &#9829;"
            />
            <button className="absolute right-2 top-[7.5px] hidden rounded-[200px] bg-cold-blue px-[25px] py-[15px] font-bold text-off-white shadow-md hover:-translate-x-1 hover:shadow-cold-blue xs:block">
              <FaHandHoldingHeart color="#92e3a9" />
            </button>
          </form>

          <button className="flex justify-center rounded-[200px] bg-cold-blue px-[10px] py-[15px] font-bold text-off-white shadow-md hover:-translate-y-1 hover:shadow-cold-blue xs:hidden">
            <FaHandHoldingHeart color="#92e3a9" />
          </button>
        </div>
      </section>
    </>
  );
};

export default Testimonials;
