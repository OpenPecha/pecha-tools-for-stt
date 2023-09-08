import Link from "next/link";
import { getUserDetails, getUserTask } from "../model/action";
import AudioTranscript from "@/components/AudioTranscript";

export default async function Home({ searchParams }: { searchParams: any }) {
  const { session } = searchParams;
  let userTasks;
  let userDetail;
  console.log("searchParams", searchParams, "param", session);
  if (session) {
    userTasks = await getUserTask(session);
    userDetail = await getUserDetails(session);
  }

  return (
    <div className="flex flex-col justify-center items-center overflow-y-auto">
      {session === undefined ? (
        <>
          <div className="mt-10 text-xl font-semibold my-4 text-center">
            please log in to it with correct username - ?session=username
            <span className="block">or</span>
          </div>
          <Link href="/dashboard" type="button" className="btn btn-accent">
            Dashboard
          </Link>
        </>
      ) : (
        <AudioTranscript tasks={userTasks} userDetail={userDetail} />
      )}
    </div>
  );
}
