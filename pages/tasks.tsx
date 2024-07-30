// pages/tasks.tsx
import Tasks from "../src/pages/tasks/page";
import Login from "../src/pages/login/page";
import { PageProps } from "../src/types/PageProps";
import Head from "next/head";

const TasksPage = ({ session }: PageProps) => {
    //console.log(session);

return (
  <>
    <Head>
      <title>Boretec - Tasks</title>
    </Head>
    {session ? <Tasks /> : <Login />}
  </>
);
};

export default TasksPage;