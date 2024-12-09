import { getAllGroup } from "@/model/group";
import Uploadcsv from "./Uploadcsv";

export default async function page() {
  const groups = await getAllGroup();
  return (
      <div className="flex justify-center items-center h-screen">
          <Uploadcsv groups = {groups}/>
    </div>
  );
}
