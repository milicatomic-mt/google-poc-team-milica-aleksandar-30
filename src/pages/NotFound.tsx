import { Link } from "react-router-dom";

const NotFound = () => {

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-gray-600">Oops! Page not found</p>
        <p className="mb-4 text-sm text-gray-500">Current URL: {window.location.href}</p>
        <Link to="/" className="text-primary underline hover:text-primary/80">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
