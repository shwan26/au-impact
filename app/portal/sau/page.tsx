import PortalLoginForm from '../component/PortLoginForm';

export default function SauPortalPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-10">
      <h2 className="font-sans text-4xl text-black">Sau Portal</h2>
      <div className="max-w-xl">
        {/* ⬅️ Goes to /sau and sets role cookie to 'sau' */}
        <PortalLoginForm redirectTo="/sau" role="sau" />
      </div>
    </div>
  );
}
