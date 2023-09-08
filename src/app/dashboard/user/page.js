import React from "react";

import UserDashboard from "./UserDashboard";
import { getAllUser } from "@/model/user";
import { getAllGroup } from "@/model/group";

const User = async () => {
  const users = await getAllUser();
  const groups = await getAllGroup();

  return (
    <>
      <div className="h-screen my-10">
        <UserDashboard users={users} groups={groups} />
      </div>
    </>
  );
};

export default User;
