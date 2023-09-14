import Link from "next/link";
import { getUserDetails, getUserTask } from "../model/action";
import AudioTranscript from "@/components/AudioTranscript";

export default async function Home({ searchParams }: { searchParams: any }) {
  const { session } = searchParams;
  let userTasks;
  let userDetail;
  let errMsg;
  console.log("searchParams", searchParams, "param", session);
  if (session && session !== "") {
    const result = await getUserTask(session);
    if (result?.error) {
      errMsg = result?.error;
    } else {
      userTasks = result?.userTasks;
      userDetail = result?.userData;
    }
  }

  return (
    <div className="flex flex-col justify-center items-center overflow-y-auto">
      {session === undefined || session === "" ? (
        <>
          <div className="mt-10 text-xl font-semibold my-4 text-center">
            please log in to it with correct username - ?session=username
            <span className="block">or</span>
          </div>
          <div className="flex flex-col gap-6 sm:flex-row">
            <Link href="/dashboard" type="button" className="btn btn-accent">
              Dashboard
            </Link>
            <Link href="/report/group" type="button" className="btn btn-accent">
              Report
            </Link>
          </div>
        </>
      ) : errMsg ? (
        <div className="mt-10 text-xl font-semibold my-4 text-center">
          {errMsg}
        </div>
      ) : (
        <AudioTranscript tasks={userTasks} userDetail={userDetail} />
      )}
    </div>
  );
}
