import Footer from '@/components/layout/Footer';
import AUSONav from '@/components/nav/AUSONav';
export default function AUSOLayout({ children }: { children: React.ReactNode }){
  return (
    <div>
      <AUSONav />
      <main className="container">{children}</main>
      <Footer />
    </div>
  );
}