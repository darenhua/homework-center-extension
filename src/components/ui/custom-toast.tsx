import React from 'react';
import { toast as sonnerToast } from 'sonner';

interface ToastProps {
  id: string | number;
  title: string;
  description?: string;
  button: {
    label: string;
    onClick: () => void;
  };
}

/** Custom toast component with Asul font and matching login page styling */
function Toast(props: ToastProps) {
  const { title, description, button, id } = props;

  return (
    <div 
      className="plasmo-relative plasmo-flex plasmo-rounded-xl plasmo-bg-white plasmo-w-full md:plasmo-max-w-[400px] plasmo-items-start plasmo-p-5 plasmo-border plasmo-border-gray-100"
      style={{ 
        fontFamily: 'var(--font-asul, Asul, system-ui, sans-serif)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Close button */}
      <button
        className="plasmo-absolute plasmo-top-2 plasmo-right-2 plasmo-w-6 plasmo-h-6 plasmo-flex plasmo-items-center plasmo-justify-center plasmo-rounded-full plasmo-text-gray-400 hover:plasmo-text-gray-600 hover:plasmo-bg-gray-100 plasmo-transition-all plasmo-duration-200"
        onClick={() => sonnerToast.dismiss(id)}
        style={{ fontSize: '14px' }}
      >
        ×
      </button>

      <div className="plasmo-flex plasmo-flex-1 plasmo-items-start plasmo-pr-2">
        <div className="plasmo-w-full">
          <p 
            className="plasmo-text-base plasmo-font-semibold plasmo-text-gray-900 plasmo-mb-2 plasmo-pr-4"
            style={{ fontFamily: 'var(--font-asul, Asul, system-ui, sans-serif)', fontWeight: 600 }}
          >
            {title}
          </p>
          {description && (
            <p 
              className="plasmo-text-sm plasmo-text-gray-600 plasmo-leading-relaxed plasmo-mb-4 plasmo-pr-4"
              style={{ fontFamily: 'var(--font-asul, Asul, system-ui, sans-serif)', fontWeight: 400 }}
            >
              {description}
            </p>
          )}
          <div className="plasmo-flex plasmo-gap-2">
            <button
              className="plasmo-inline-flex plasmo-items-center plasmo-px-4 plasmo-py-2.5 plasmo-text-sm plasmo-font-medium plasmo-text-white plasmo-bg-gradient-to-r plasmo-from-blue-600 plasmo-to-blue-700 hover:plasmo-from-blue-700 hover:plasmo-to-blue-800 plasmo-rounded-lg plasmo-transition-all plasmo-duration-200 plasmo-shadow-sm hover:plasmo-shadow-md"
              style={{ fontFamily: 'var(--font-asul, Asul, system-ui, sans-serif)', fontWeight: 500 }}
              onClick={() => {
                button.onClick();
                sonnerToast.dismiss(id);
              }}
            >
              {button.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Abstracted toast function for easy usage */
export function customToast(toast: Omit<ToastProps, 'id'>) {
  return sonnerToast.custom((id) => (
    <Toast
      id={id}
      title={toast.title}
      description={toast.description}
      button={toast.button}
    />
  ));
}

/** Success toast variant */
export function successToast(message: string) {
  return sonnerToast.custom((id) => (
    <div 
      className="plasmo-relative plasmo-flex plasmo-rounded-xl plasmo-bg-gradient-to-r plasmo-from-green-50 plasmo-to-emerald-50 plasmo-border plasmo-border-green-200 plasmo-w-full md:plasmo-max-w-[400px] plasmo-items-center plasmo-p-4"
      style={{ 
        fontFamily: 'var(--font-asul, Asul, system-ui, sans-serif)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Close button */}
      <button
        className="plasmo-absolute plasmo-top-2 plasmo-right-2 plasmo-w-6 plasmo-h-6 plasmo-flex plasmo-items-center plasmo-justify-center plasmo-rounded-full plasmo-text-green-400 hover:plasmo-text-green-600 hover:plasmo-bg-green-100 plasmo-transition-all plasmo-duration-200"
        onClick={() => sonnerToast.dismiss(id)}
        style={{ fontSize: '14px' }}
      >
        ×
      </button>

      <div className="plasmo-flex plasmo-pr-6">
        <div className="plasmo-flex-shrink-0">
          <div className="plasmo-w-8 plasmo-h-8 plasmo-bg-green-100 plasmo-rounded-full plasmo-flex plasmo-items-center plasmo-justify-center">
            <svg
              className="plasmo-h-5 plasmo-w-5 plasmo-text-green-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="plasmo-ml-3">
          <p 
            className="plasmo-text-sm plasmo-font-medium plasmo-text-green-800"
            style={{ fontFamily: 'var(--font-asul, Asul, system-ui, sans-serif)', fontWeight: 500 }}
          >
            {message}
          </p>
        </div>
      </div>
    </div>
  ));
}

/** Error toast variant */
export function errorToast(message: string) {
  return sonnerToast.custom((id) => (
    <div 
      className="plasmo-relative plasmo-flex plasmo-rounded-xl plasmo-bg-gradient-to-r plasmo-from-red-50 plasmo-to-pink-50 plasmo-border plasmo-border-red-200 plasmo-w-full md:plasmo-max-w-[400px] plasmo-items-center plasmo-p-4"
      style={{ 
        fontFamily: 'var(--font-asul, Asul, system-ui, sans-serif)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Close button */}
      <button
        className="plasmo-absolute plasmo-top-2 plasmo-right-2 plasmo-w-6 plasmo-h-6 plasmo-flex plasmo-items-center plasmo-justify-center plasmo-rounded-full plasmo-text-red-400 hover:plasmo-text-red-600 hover:plasmo-bg-red-100 plasmo-transition-all plasmo-duration-200"
        onClick={() => sonnerToast.dismiss(id)}
        style={{ fontSize: '14px' }}
      >
        ×
      </button>

      <div className="plasmo-flex plasmo-pr-6">
        <div className="plasmo-flex-shrink-0">
          <div className="plasmo-w-8 plasmo-h-8 plasmo-bg-red-100 plasmo-rounded-full plasmo-flex plasmo-items-center plasmo-justify-center">
            <svg
              className="plasmo-h-5 plasmo-w-5 plasmo-text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="plasmo-ml-3">
          <p 
            className="plasmo-text-sm plasmo-font-medium plasmo-text-red-800"
            style={{ fontFamily: 'var(--font-asul, Asul, system-ui, sans-serif)', fontWeight: 500 }}
          >
            {message}
          </p>
        </div>
      </div>
    </div>
  ));
}