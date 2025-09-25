import Footer from '@/components/layout/Footer';
import SAUNav from '@/components/nav/SAUNav';

export default function SAULayout({ children }: { children: React.ReactNode }){
  return (
    <div>
      <SAUNav />
      <main className="container">{children}</main>
      <Footer />
    </div>
  );
}