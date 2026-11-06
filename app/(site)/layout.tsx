import { SiteFooter } from "@/components/site-footer";
import { SignedHeader } from "@/components/signed-header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
