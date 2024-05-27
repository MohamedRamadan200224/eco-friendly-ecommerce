import React from "react";
import Header from "../components/Header";
import Vision from "../components/Vision";
import Team from "../components/Team";
import Testimonials from "../components/Testimonials";

const About = () => {
  return (
    <>
      {/* FIRST SECTION */}
      <Header title="Our Vision" subtitle="About us" />

      {/* SECOND SECTION */}
      <Vision />

      {/* THIRD SECTION */}
      <section className="max-container padding-container m-[150px] mb-48">
        <div className="flex flex-col md:flex-row xl:gap-32">
          <div className="">
            <span className="mb-3 inline-block rounded-full bg-cold-blue/15 px-5 py-1 text-[10px] font-bold text-cold-blue md:text-[12px] lg:text-[14px]">
              Our Eco heroes
            </span>
            <h1 className="text-[28px] font-bold text-cold-blue xs:w-[70%] sm:text-[32px] md:w-[100%] lg:text-[36px]">
              Meet our<span className="text-green-600"> Dedicated </span>
              Team
            </h1>
          </div>
          <div className="place-content-center">
            <p className="mt-3 border-l border-cold-blue pl-2 text-[16px] text-cold-blue xl:w-[70%]">
              The marketplace is always looking for new ways to improve its
              sustainability and ethical standards.
            </p>
          </div>
        </div>
        <Team />
      </section>

      {/* FOURTH SECTION */}
      <Testimonials />
    </>
  );
};

export default About;
