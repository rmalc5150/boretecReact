// pages/tasks.tsx
import Tasks from "../src/pages/tasks/page";
import Login from "../src/pages/login/page";
import { PageProps } from "../src/types/PageProps";

const TasksPage = ({ session }: PageProps) => {
    //console.log(session);
  return session ? <Tasks /> : <Login />;
};

export default TasksPage;