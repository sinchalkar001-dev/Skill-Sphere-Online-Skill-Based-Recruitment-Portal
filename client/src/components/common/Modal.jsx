import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

// Headless UI's Dialog traps focus and returns it to the trigger on close.
const Modal = ({ isOpen, onClose, title, description, children, size = 'md', initialFocus }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose} initialFocus={initialFocus}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div aria-hidden="true" className="fixed inset-0 bg-slate-950/50 backdrop-blur-[2px]" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-6">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-3 sm:translate-y-0 sm:scale-[0.98]"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Panel className={`w-full ${sizes[size]} rounded-2xl border border-border bg-card p-6 shadow-overlay sm:p-7`}>
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Dialog.Title className="text-lg font-semibold text-foreground">{title}</Dialog.Title>
                    {description && (
                      <Dialog.Description className="mt-1 text-sm text-muted-foreground">{description}</Dialog.Description>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-ghost btn-icon -mr-2 -mt-2 h-9 w-9 flex-shrink-0"
                    aria-label="Close dialog"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
