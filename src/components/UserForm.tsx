'use client'; // Runs on client (browser) side

// Type definition for data (props) passed to user form component
interface UserFormProps {
  // Event handler executed on form submission
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  // Initial values to set for input fields
  initialValues?: {
    name: string;
    email: string;
  };
  submitLabel: string; // Display text for form submit button
  withPassword?: boolean; // Whether to include password input fields
}

// Common style for input fields
const inputStyle = 'w-full border border-gray-300 px-3 py-2 rounded-sm focus:ring-2 focus:ring-brand-500';
// Common style for labels
const labelStyle = "block font-bold mb-1";
// Common style for badges
const badgeStyle = "ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-md";

// Common user form component
export default function UserForm({
  onSubmit,
  initialValues = { name: '', email: '' },
  submitLabel,
  withPassword = false,
}: UserFormProps) {
  return (
    <form onSubmit={onSubmit} className="w-full space-y-6 p-8 bg-white shadow-lg rounded-xl">
      <label className={labelStyle} htmlFor="name">
        Name<span className={badgeStyle}>Required</span>
      </label>
      <input type="text" id="name" name="name" required
        defaultValue={initialValues.name} className={inputStyle}
      />

      <label className={labelStyle} htmlFor="email">
        Email Address<span className={badgeStyle}>Required</span>
      </label>
      <input type="email" id="email" name="email" required
        defaultValue={initialValues.email} className={inputStyle}
      />

      {withPassword && (
        <>
          <label className={labelStyle} htmlFor="password">
            Password<span className={badgeStyle}>Required</span>
          </label>
          <input type="password" id="password" name="password" required
            className={inputStyle}
          />

          <label className={labelStyle} htmlFor="confirmPassword">
            Confirm Password<span className={badgeStyle}>Required</span>
          </label>
          <input type="password" id="confirmPassword" name="confirmPassword" required
            className={inputStyle}
          />
        </>
      )}

      <button type="submit" className="w-full mt-2 bg-brand-500 hover:bg-brand-600 text-white py-2 rounded-sm">
        {submitLabel}
      </button>
    </form>
  );
}

