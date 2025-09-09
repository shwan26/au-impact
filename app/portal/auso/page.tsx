import PortalLoginForm from '../component/PortLoginForm';

export default function AusoPortalPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-10">
      <h2 className="font-sans text-4xl text-black">Auso Portal</h2>
      <div className="max-w-xl">
        {/* ⬅️ Goes to /auso and sets role cookie to 'auso' */}
        <PortalLoginForm redirectTo="/auso" role="auso" />
      </div>
    </div>
  );
}
