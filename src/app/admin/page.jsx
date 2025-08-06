import { AdminHomeView } from "@/components";

export const metadata = {
  title: "Admin Dashboard",
};

const AdminHome = () => {
  return (
    <>
      <AdminHomeView />
      <div className="mt-6"></div>
    </>
  );
};

export default AdminHome;
