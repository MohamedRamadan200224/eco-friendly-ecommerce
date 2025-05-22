import React from "react";
import { TEAM } from "../../constants";
const Team = () => {
  return (
    <div className="mt-[60px] grid cursor-pointer gap-10 space-y-16 xs:grid-cols-2 xs:space-y-0 lg:grid-cols-4">
      {TEAM.map((team) => (
        <div
          key={team.key}
          className="px-2 py-3 duration-300 ease-in-out bg-white rounded-xl hover:shadow-lg"
        >
          <div className="h-[210px]">
            <img
              src={team.img}
              alt="team_X"
              className="h-[100%] w-[100%] rounded-lg object-cover"
            />
          </div>
          <div className="mt-2 place-content-center">
            <div className="flex justify-between">
              <h2 className="cursor-pointer text-[24px] font-bold uppercase text-navy-blue-dark duration-300 ease-in-out hover:text-light-orange">
                {team.name}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-navy-blue">{team.jop}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Team;
