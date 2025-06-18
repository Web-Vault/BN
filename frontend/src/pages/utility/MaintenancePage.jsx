import React from "react";
import { Link } from "react-router-dom";
import config from "../../config/config.js";

const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-6xl mb-4">🔧</h2>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Under Maintenance
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We're currently performing scheduled maintenance to improve our
            services.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">
                We'll be back shortly. Thank you for your patience.
              </p>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  Expected completion time:
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(
                    Date.now() + 2 * 60 * 60 * 1000
                  ).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Need help?
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center space-y-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Try logging in to check if maintenance is complete
                </Link>
                <Link
                  to="/support"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
