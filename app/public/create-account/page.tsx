import SignupForm from '@/components/auth/SignupForm';

export const metadata = { title: 'Create account' };

export default function CreateAccountPage() {
  return (
    <section className="px-6 py-8">
      <h1 className="text-2xl font-extrabold">Create Account</h1>
      <p className="mt-1 text-sm text-gray-600">
        Sign up to access your profile and register for events.
      </p>
      <div className="mt-6">
        <SignupForm />
      </div>
    </section>
  );
}
