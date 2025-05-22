import React from "react";

const Header = ({ title, subtitle }) => {
  return (
    <section className="relative py-[120px]  text-center">
      <div className="max-container padding-container">
        <span className="mb-3 inline-block rounded-full bg-greeny-green px-5 py-1 text-[10px] font-bold text-green-600 md:text-[12px] lg:text-[14px]">
          {subtitle}
        </span>
        <h1 className="text-[42px] font-extrabold text-cold-blue md:text-[48px] lg:text-[52px] xl:text-[60px]">
          {title}
        </h1>
        <p className="mx-auto text-base text-cold-blue xs:w-[70%] xl:w-[50%]">
          Shop with purpose and join us in shaping a greener future, one
          purchase at a time.
        </p>
      </div>
    </section>
  );
};

export default Header;
