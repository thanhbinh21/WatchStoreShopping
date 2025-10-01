import React from "react";
import { SearchBar } from "./SearchBar";
import { UserInfo } from "./UserInfo";
import { Notification } from "./Notification";
import UserImg from "../../assets/images/user.png";
import { CircleChevronDown } from "lucide-react";

export const TopBar = () => {
  return (
    <div className="flex justify-between mx-14 h-[70px] items-center">
      <SearchBar />

      <div className="flex items-center gap-[26px]">
        <Notification unreadNum={6} />
        <UserInfo name={"Tấn Duy"} image={UserImg} role={"Admin"} />
      </div>
    </div>
  );
};
