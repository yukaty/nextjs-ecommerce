import Link from "next/link";

interface MenuCardProps {
  href: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export default function MenuCard({ href, title, description, icon }: MenuCardProps) {
  return (
    <Link
      href={href}
      className="w-full flex items-center px-4 pt-4 pb-4 border border-gray-300 rounded shadow-lg hover:ring-2 hover:ring-brand-200 hover:shadow-xl hover:bg-gray-100 transition-all duration-200"
    >
      <div className="flex flex-col text-left w-full">
        <div className="flex items-center mb-2">
          {icon && <div className="mr-3 text-brand-500">{icon}</div>}
          <span className="font-medium text-lg">{title}</span>
        </div>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </Link>
  );
}