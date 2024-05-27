import React from "react";

const Vision = () => {
  return (
    <>
      <section className="grid max-container padding-container lg:grid-cols-2 mt-[96px]">
        <div className="order-1 leading-loose text-center lg:text-left xl:mt-20">
          <span className="inline-block px-5 py-1 mb-2 text-green-600 bg-greeny-green rounded-full text-[12px] font-bold">
            Planet Pioneers
          </span>
          <h1 className="mb-3 text-[30px] md:text-[40px] leading-tight font-extrabold text-cold-blue xl:w-[70%]">
            Eco Emporium
          </h1>
          <div className="text-base text-cold-blue lg:w-[80%]">
            <p className="mb-4 text-cold-blue">
              GreenGray Market has a vision centered around sustainability and
              ethical practices.
            </p>
            <ul className="leading-relaxed text-green-700">
              <li>
                &#8618; Sustainable Practices: The marketplace aims to offer
                products that are produced and delivered in a way that minimizes
                harm to the environment.
              </li>
              <li>
                &#8618; Ethical Standards: The marketplace is committed to
                supporting businesses that prioritize ethical practices, fair
                labor standards, and social responsibility.
              </li>
              <li>
                &#8618; Support for Small Businesses and Artisans: By offering a
                platform for independent sellers, artisans, and small
                businesses, the marketplace helps to support local economies and
                craftspeople.
              </li>
            </ul>
          </div>
        </div>
        <div className="md:w-[75%] mx-auto hidden md:block">
          <img src="/img_vision.svg" alt="hero.jpg" />
        </div>
      </section>
    </>
  );
};

export default Vision;
