import LoginPage from "../login/page";

export default function SignupPage() {
  // Using the same component for both since both rely on the Google Auth popup.
  return <LoginPage />;
}
