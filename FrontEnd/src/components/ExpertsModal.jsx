// Migrated to the shared api client (clean-code pass, 2026-11-19):
// no raw axios, no hardcoded localhost URL, no Authorization header
// (cookie auth — the httpOnly cookie is sent automatically), and
// request errors are toasted once by the client's interceptor.
import api from "../api/client";
import { useEffect, useState } from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";

const ExpertsModal = ({ appId, onClose }) => {

  const [application, setApplication] = useState({
    result: "",
    reload: 0,
    loading: true,
  });

  useEffect(() => {
    api
      .get(
        `/api/v1/expertApply/${appId}`
      )
      .then((resp) => {
        setApplication((a) => ({
          ...a,
          result: resp.data.data,
          status: resp.data.status,
          loading: false,
          reload: a.reload + 1,
        }));
      })
      .catch(() => {
        // Error already toasted once by the api client interceptor.
        setApplication((a) => ({
          ...a,
          loading: false,
          reload: a.reload + 1,
        }));
      });
  }, [appId]);

  return (
    <div className="fixed inset-0 z-20 flex items-start justify-center p-10 overflow-y-auto bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="flex flex-col w-full h-full gap-5 text-cold-blue">
        <button onClick={onClose} className="place-self-end">
          <IoMdCloseCircleOutline size={30} color="#263238" />
        </button>
        <div className="flex flex-col gap-5 px-2 py-5 mx-2 bg-white sm:px-10 sm:mx-4 rounded-xl">
          <div className="grid gap-3">
            <label>
              How would you prioritize tasks if you have multiple products to
              assess but limited time?
            </label>
            <textarea
              value={application.result.question1}
              className="h-[80px] rounded-md border border-cold-blue px-[20px] py-[12px] w-full"
            />

            <label>
              Explain the key factors you consider when evaluating the
              environmental impact of a product.
            </label>
            <textarea
              value={application.result.question2}
              className="h-[80px] rounded-md border border-cold-blue px-[20px] py-[12px] w-full"
            />

            <label>
              Describe a scenario where you had to make a quick decision without
              compromising on accuracy.
            </label>
            <textarea
              value={application.result.question3}
              className="h-[80px] rounded-md border border-cold-blue px-[20px] py-[12px] w-full"
            />

            <label>
              What steps do you take to ensure that your assessment of a product
              is thorough and precise?
            </label>
            <textarea
              value={application.result.question4}
              className="h-[80px] rounded-md border border-cold-blue px-[20px] py-[12px] w-full"
            />

            <label>
              How do you maintain consistency in your voting when faced with a
              high volume of products to review?
            </label>
            <textarea
              value={application.result.question5}
              className="h-[80px] rounded-md border border-cold-blue px-[20px] py-[12px] w-full"
            />

            <label>
              Discuss the importance of impartiality in voting and how you
              uphold ethical standards.
            </label>
            <textarea
              value={application.result.question6}
              className="h-[80px] rounded-md border border-cold-blue px-[20px] py-[12px] w-full"
            />

            <label>
              If a new policy changes the criteria for product assessment, how
              quickly can you adapt your voting strategy?
            </label>
            <textarea
              value={application.result.question7}
              className="h-[80px] rounded-md border border-cold-blue px-[20px] py-[12px] w-full"
            />

            <label>
              How would you communicate your expert opinion to a seller whose
              product did not meet the eco-friendly criteria?
            </label>
            <textarea
              value={application.result.question8}
              className="h-[80px] rounded-md border border-cold-blue px-[20px] py-[12px] w-full"
            />

            <label>
              How do you handle feedback or criticism regarding your votes from
              other experts or users?
            </label>
            <textarea
              value={application.result.question9}
              className="h-[80px] rounded-md border border-cold-blue px-[20px] py-[12px] w-full"
            />

            <label>
              Are you able to commit to making at least one vote every 10
              minutes during your active hours? Please explain your strategy for
              doing so.
            </label>
            <textarea
              value={application.result.question10}
              className="h-[80px] rounded-md border border-cold-blue px-[20px] py-[12px] w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertsModal;
