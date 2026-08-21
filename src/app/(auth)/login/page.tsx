import { AuthForm } from "@/components/auth/auth-form";
import { signInAction } from "@/app/(auth)/actions";

export default function LoginPage() {
  return <AuthForm mode="login" action={signInAction} />;
}
