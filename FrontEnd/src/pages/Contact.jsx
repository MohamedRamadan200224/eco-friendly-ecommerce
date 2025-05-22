import React from "react";
import Header from "../components/Header";
import Testimonials from "../components/Testimonials";

const Contact = () => {
  return (
    <>
      <Header title="Get Connected" subtitle="Contact" />

      <section className="max-container padding-container mb-[200px] mt-[30px]">
        <div className="grid lg:grid-cols-2">
          <div className="w-[70%] mx-auto">
            <img src="/img_contact.svg" alt="contact" />
          </div>
          <div className="flex flex-col mt-8 md:mt-0">
            <form>
              <p className="mb-[50px] text-2xl font-semibold text-cold-blue">
                Leave a comment
              </p>
              <div className="flex flex-col gap-4 xl:flex-row">
                <input
                  type="text"
                  className="h-[50px] rounded-md border border-cold-blue px-[20px] py-[12px]"
                  placeholder="Name*"
                  required
                />
                <input
                  type="email"
                  className="h-[50px] rounded-md border border-cold-blue px-[20px] py-[12px]"
                  placeholder="Email*"
                  required
                />
              </div>

              <div className="flex flex-col gap-4 mt-4 xl:flex-row">
                <input
                  type="tel"
                  className="h-[50px] rounded-md border border-cold-blue px-[20px] py-[12px]"
                  placeholder="Phone*"
                  required
                />
                <input
                  type="text"
                  className="h-[50px] rounded-md border border-cold-blue px-[20px] py-[12px]"
                  placeholder="Subject*"
                  required
                />
              </div>

              <div className="flex flex-col gap-4 mt-4">
                <textarea
                  type="text"
                  className="h-[281px] rounded-[16px] border border-cold-blue px-[20px] py-[12px] xl:w-[540px]"
                  placeholder="Write here"
                  required
                  maxLength="5000"
                />
              </div>

              <div className="mt-4">
                <input
                  type="submit"
                  className="rounded-md bg-cold-blue px-[20px] py-[7px] font-bold text-white"
                  value="Submit"
                />
              </div>
            </form>
          </div>
        </div>
      </section>

      <Testimonials />
    </>
  );
};

export default Contact;
