import React from "react";
import { getAllUser } from "@/model/user";
import UserReport from "./UserReport";

const User = async ({ params }) => {
  const { id } = params;
  const users = await getAllUser();

  return (
    <div className="h-screen my-10">
      <UserReport id={id} users={users} />
    </div>
  );
};

export default User;
