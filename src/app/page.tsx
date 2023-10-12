import Link from "next/link";
import { getUserTask } from "../model/action";
import AudioTranscript from "@/components/AudioTranscript";
import RightSidebar from "@/components/RightSidebar";
import languagesObject from "../../data/language";

export default async function Home({ searchParams }: { searchParams: any }) {
  const language = languagesObject;
  const { session } = searchParams;
  let userTasks;
  let userDetail;
  let errMsg;
  if (session && session !== "") {
    const result = await getUserTask(session);
    if (result?.error) {
      errMsg = result?.error;
    } else {
      userTasks = result?.userTasks;
      userDetail = result?.userData;
    }
  }

  const routes = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Report", path: "/report" },
    { name: "Stats", path: "/stats" },
  ];

  return (
    <div className="flex flex-col justify-center items-center overflow-y-auto">
      {session === undefined || session === "" ? (
        <>
          <div className="text-xl font-semibold mt-10 p-5 text-center">
            please log in to it with correct username - ?session=username
            <span className="block">or</span>
          </div>
          <div className="flex flex-col gap-6 sm:flex-row">
            {routes.map((route) => (
              <Link
                key={route.name}
                href={route.path}
                type="button"
                className="btn btn-accent"
              >
                {route.name}
              </Link>
            ))}
          </div>
        </>
      ) : errMsg ? (
        <div className="mt-10 p-5 text-xl font-semibold text-center">
          {errMsg}
        </div>
      ) : (
        <AudioTranscript
          tasks={userTasks}
          userDetail={userDetail}
          language={language}
        />
      )}
      <RightSidebar>
        <iframe
          className="h-full"
          src="https://docs.google.com/spreadsheets/d/1Sn9IO9Gxj0swe7CdZPAsKx3ccBiDAtNHTvBDoMn7iqA/edit?usp=sharing"
        ></iframe>
      </RightSidebar>
    </div>
  );
}
