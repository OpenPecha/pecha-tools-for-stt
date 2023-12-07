import React from "react";
import DemoPage from "./DemoPage";
import languagesObject from "../../../data/language";
import prisma from "@/service/db";

const Page = async () => {
  const language = languagesObject;
  let userDetail = {
    id: 13,
    name: "tenzin",
    email: "tenzin@gmail.com",
    group_id: 3,
    role: "TRANSCRIBER",
    group: {
      id: 3,
      name: "stt-ab",
      department_id: 2,
    },
  };
  let userTasks = await prisma.task.findMany({
    where: {
      state: "transcribing",
    },
    take: 10,
  });

  return (
    <DemoPage
      userDetail={userDetail}
      tasks={userTasks}
      language={language}
      userHistory={[]}
    />
  );
};

export default Page;
