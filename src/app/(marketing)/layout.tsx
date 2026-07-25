import { Footer } from "@/components/common/footer";
import { MainWrapper } from "@/components/common/main-wrapper";
import { Navbar } from "@/components/common/navbar";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <MainWrapper>{children}</MainWrapper>
      <Footer />
    </>
  );
}
