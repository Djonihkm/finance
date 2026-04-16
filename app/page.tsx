import DashboardLayout from "./components/DashboardLayout";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <DashboardLayout>
        <h2>Welcome to the Finance App</h2>
      </DashboardLayout>
    </div>
  );
}
