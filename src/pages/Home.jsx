import React, { useEffect, useState } from "react";
import { PRODUCTS } from "../../constants";
import Testimonials from "../components/Testimonials";
import { useNavigate } from "react-router";
import Vision from "../components/Vision";
import { FaHandHoldingHeart } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, FreeMode, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const goToAbout = () => {
    navigate("/about");
  };
  const goToContact = () => {
    navigate("/contact-us");
  };
  const [products, setProducts] = useState({
    results: [],
    loading: true,
    status: "",
    reload: 0,
  });
  useEffect(() => {
    const getProducts = async () => {
      let resp;

      // TODO document why this block is empty

      resp = await axios.get(
        `http://localhost:8080/api/v1/products?onSale=true`
      );

      console.log(resp.data.data.data);
      setProducts({
        ...products,
        results: resp.data.data.data,
        status: resp.data.status,
        loading: false,
      });
    };

    getProducts();
  }, []);

  return (
    <>
      {/* FIRST SECTION */}
      <section className="grid max-container padding-container lg:grid-cols-3">
        <div className="leading-loose text-center lg:col-span-2 lg:text-left xl:mt-20">
          <span className="inline-block px-5 py-1 mb-2 text-green-600 bg-greeny-green rounded-full text-[10px] font-bold">
            WELCOME TO OUR SITE
          </span>
          <h1 className="mb-3 text-[30px] md:text-[40px] leading-tight font-extrabold text-cold-blue xl:w-[70%]">
            Shop Green,
            <span className="block lg:ml-20 text-[48px] text-greeny">
              Live Green
            </span>
          </h1>
          <p className="mb-9 text-base text-cold-blue lg:w-[80%]">
            Welcome to GreenGray Market, where conscious choices meet
            convenience. Discover a curated selection of sustainable products
            that make a difference. Shop with purpose and join us in shaping a
            greener future, one purchase at a time.
          </p>
          <button
            className="w-40 p-1 mb-2 mr-2 text-white transition duration-300 border rounded-md border-cold-blue bg-cold-blue hover:bg-white hover:text-cold-blue hover:border-cold-blue"
            onClick={goToAbout}
          >
            How we work
          </button>
          <button
            className="w-40 p-1 mr-2 transition duration-300 bg-white border rounded-md border-cold-blue text-cold-blue hover:bg-cold-blue hover:text-white"
            onClick={goToContact}
          >
            Contact us
          </button>
        </div>
        <div className="md:w-[75%] lg:w-full mx-auto hidden md:block">
          <img src="/img_hero.svg" alt="hero.jpg" />
        </div>
      </section>

      {/* SECOND SECTION */}
      <section className="max-container padding-container mt-[96px]">
        <div className="mb-10 text-center">
          <span className="inline-block px-5 py-1 mb-2 text-green-600 bg-greeny-green rounded-full text-[13px] font-bold">
            Featured Products
          </span>
          <h1 className="mb-3 text-[30px] md:text-[40px] leading-tight font-extrabold text-cold-blue xl:w-[70%] mx-auto">
            Browse our Products
          </h1>
        </div>
        {/* <div className="grid grid-cols-2 gap-10 lg:grid-cols-4 lg:mx-auto lg:w-[70%] text-[18px] px-4 py-1 font-medium rounded-md bg-cold-blue text-mint">
          <button className="browse">Cars</button>
          <button className="browse">Food</button>
          <button className="browse">Cloth</button>
          <button className="browse">Electronics</button>
        </div> */}
        <div className="grid gap-4 mt-10 cursor-pointer sm:grid-cols-2 md:grid-cols-4">
          {PRODUCTS.slice(0, 8).map((duct) => (
            <div
              key={duct.key}
              className="flex flex-col border-2 rounded-md border-cold-blue"
            >
              <img src={duct.img} alt="featured products" />
              <h2 className="mt-[25px] text-[24px] font-bold text-cold-blue pl-2">
                {duct.label}
              </h2>
              <p className="pl-2 mb-4 text-sm leading-3 text-green-600">
                {duct.category}
              </p>
              <p className="mb-2 text-[18px] font-light leading-[1.67rem] text-cold-blue xl:w-[70%] pl-2">
                {duct.price}
              </p>
            </div>
          ))}
        </div>
      </section>

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
            {products.results.length > 0 &&
              products.results.slice(0, 15).map((duct) => {
                return (
                  <SwiperSlide key={duct.key}>
                    <div className="flex flex-col border-2 rounded-md border-cold-blue">
                      <img src={duct.img} alt="featured products" />
                      <h2 className="mt-[25px] text-[24px] font-bold text-cold-blue pl-2">
                        {duct.label}
                      </h2>
                      <p className="pl-2 mb-4 text-sm leading-3 text-green-600">
                        {duct.category}
                      </p>
                      <p className="mb-2 text-[18px] font-light leading-[1.67rem] text-cold-blue xl:w-[70%] pl-2">
                        {duct.price}
                      </p>
                    </div>
                  </SwiperSlide>
                );
              })}
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

      {/* THIRD SECTION */}
      <Vision />

      {/* FOURTH SECTION */}
      <Testimonials />
    </>
  );
};

export default Home;
