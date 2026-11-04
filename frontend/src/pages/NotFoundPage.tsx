import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">
          Error 404
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          The page you were looking for doesn't exist or may have been moved.
        </p>
        <div className="mt-6">
          <Link to="/">
            <Button>Go to projects</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
