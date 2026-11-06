import { currentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";

export async function SignedHeader() {
  const user = await currentUser();
  const account = user
    ? { href: user.role === "staff" ? "/admin" : "/portal", label: user.fullName }
    : null;
  return <SiteHeader account={account} />;
}
