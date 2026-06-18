import LoginCard from "@/components/pages/login-card";
import TopBar from "@/components/pages/topbar";

export default function Login() {
  return (
    <>
      <TopBar />
      <div className="container mx-auto flex items-center justify-center mt-10">
        <LoginCard />
      </div>
    </>
  );
}
