import { AuthForm } from "@/components/auth/auth-form";
import { signUpAction } from "@/app/(auth)/actions";

export default function SignupPage() {
  return <AuthForm mode="signup" action={signUpAction} />;
}
