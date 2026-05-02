import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import NecozButton from '~/components/ui/button/NecozButton';
import Text from '~/components/ui/text/Text';
import './MailDialogTrigger.css';

const DEFAULT_EMAIL = 'nyaonyao0725@gmail.com';
const TOAST_EXIT_DELAY_MS = 200;
const TOAST_VISIBLE_DURATION_MS = 2200;

type MailDialogTriggerProps = {
  /** Email address shown in the dialog and copied to the clipboard. */
  email?: string;
  /** Icon source rendered for the trigger button. */
  iconSrc?: string;
};

function CloseIcon() {
  return (
    <svg viewBox="0 0 576.87 576.87" aria-hidden="true">
      <rect
        x="126.42"
        y="126.42"
        width="64.81"
        height="64.81"
        rx="1.49"
        ry="1.49"
        fill="currentColor"
      />
      <rect
        x="191.22"
        y="191.22"
        width="64.81"
        height="64.81"
        rx="1.49"
        ry="1.49"
        fill="currentColor"
      />
      <rect
        x="256.03"
        y="256.03"
        width="64.81"
        height="64.81"
        rx="1.49"
        ry="1.49"
        fill="currentColor"
      />
      <rect
        x="385.64"
        y="126.42"
        width="64.81"
        height="64.81"
        rx="1.49"
        ry="1.49"
        fill="currentColor"
      />
      <rect
        x="191.22"
        y="320.84"
        width="64.81"
        height="64.81"
        rx="1.49"
        ry="1.49"
        fill="currentColor"
      />
      <rect
        x="126.42"
        y="385.64"
        width="64.81"
        height="64.81"
        rx="1.49"
        ry="1.49"
        fill="currentColor"
      />
      <rect
        x="320.84"
        y="191.22"
        width="64.81"
        height="64.81"
        rx="1.49"
        ry="1.49"
        fill="currentColor"
      />
      <rect
        x="320.84"
        y="320.84"
        width="64.81"
        height="64.81"
        rx="1.49"
        ry="1.49"
        fill="currentColor"
      />
      <rect
        x="385.64"
        y="385.64"
        width="64.81"
        height="64.81"
        rx="1.49"
        ry="1.49"
        fill="currentColor"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 576.87 576.87" aria-hidden="true">
      <path
        d="M130.18,227.57v-95.69c0-.93-.76-1.69-1.69-1.69h-45.31c-.93,0-1.69.76-1.69,1.69v191.38c0,.93.76,1.69,1.69,1.69h45.31c.93,0,1.69-.76,1.69-1.69v-95.69Z"
        fill="currentColor"
      />
      <rect
        x="324.95"
        y="130.18"
        width="48.69"
        height="48.69"
        rx="1.69"
        ry="1.69"
        fill="currentColor"
      />
      <path
        d="M227.57,130.18h95.69c.93,0,1.69-.76,1.69-1.69v-45.31c0-.93-.76-1.69-1.69-1.69h-191.38c-.93,0-1.69.76-1.69,1.69v45.31c0,.93.76,1.69,1.69,1.69h95.69Z"
        fill="currentColor"
      />
      <rect
        x="130.18"
        y="324.95"
        width="48.69"
        height="48.69"
        rx="1.69"
        ry="1.69"
        fill="currentColor"
      />
      <path
        d="M251.91,349.3v-95.69c0-.93-.76-1.69-1.69-1.69h-45.31c-.93,0-1.69.76-1.69,1.69v191.38c0,.93.76,1.69,1.69,1.69h45.31c.93,0,1.69-.76,1.69-1.69v-95.69Z"
        fill="currentColor"
      />
      <path
        d="M448.37,251.91c-.93,0-1.69.76-1.69,1.69v191.38c0,.93.76,1.69,1.69,1.69h45.31c.93,0,1.69-.76,1.69-1.69v-191.38c0-.93-.76-1.69-1.69-1.69h-45.31Z"
        fill="currentColor"
      />
      <path
        d="M349.3,251.91h95.69c.93,0,1.69-.76,1.69-1.69v-45.31c0-.93-.76-1.69-1.69-1.69h-191.38c-.93,0-1.69.76-1.69,1.69v45.31c0,.93.76,1.69,1.69,1.69h95.69Z"
        fill="currentColor"
      />
      <path
        d="M349.3,446.68h-95.69c-.93,0-1.69.76-1.69,1.69v45.31c0,.93.76,1.69,1.69,1.69h191.38c.93,0,1.69-.76,1.69-1.69v-45.31c0-.93-.76-1.69-1.69-1.69h-95.69Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function MailDialogTrigger({
  email = DEFAULT_EMAIL,
  iconSrc = '/assets/icons/icon_mail.svg',
}: MailDialogTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const copyButtonRef = useRef(null as HTMLButtonElement | null);
  const triggerRef = useRef(null as HTMLButtonElement | null);
  const toastTimeoutRef = useRef(null as number | null);
  const toastExitTimeoutRef = useRef(null as number | null);
  const toastEnterFrameRef = useRef(null as number | null);

  const closeDialog = () => {
    setIsOpen(false);
  };

  const clearToastTimers = () => {
    if (toastTimeoutRef.current !== null) {
      window.clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }

    if (toastExitTimeoutRef.current !== null) {
      window.clearTimeout(toastExitTimeoutRef.current);
      toastExitTimeoutRef.current = null;
    }

    if (toastEnterFrameRef.current !== null) {
      window.cancelAnimationFrame(toastEnterFrameRef.current);
      toastEnterFrameRef.current = null;
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const triggerElement = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    copyButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDialog();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      triggerElement?.focus?.();
    };
  }, [isOpen]);

  useEffect(() => {
    return clearToastTimers;
  }, []);

  const showToast = (message: string) => {
    clearToastTimers();

    setToastMessage(message);
    setIsToastVisible(false);

    toastEnterFrameRef.current = window.requestAnimationFrame(() => {
      setIsToastVisible(true);
      toastEnterFrameRef.current = null;
    });

    toastTimeoutRef.current = window.setTimeout(() => {
      setIsToastVisible(false);
      toastExitTimeoutRef.current = window.setTimeout(() => {
        setToastMessage('');
        toastExitTimeoutRef.current = null;
      }, TOAST_EXIT_DELAY_MS);
      toastTimeoutRef.current = null;
    }, TOAST_VISIBLE_DURATION_MS);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      showToast('Mail address copied!');
    } catch (error) {
      console.error('Failed to copy mail address:', error);
      showToast('Failed to copy mail address. Please try again.');
    }
  };

  const dialog =
    isMounted && isOpen
      ? createPortal(
          <div className="mail-dialog-root" role="presentation">
            <button
              type="button"
              className="mail-dialog-backdrop"
              aria-label="Close email dialog"
              onClick={closeDialog}
            />
            <div
              className="mail-dialog-panel mail-dialog-frame"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
            >
              <button
                type="button"
                className="mail-dialog-close"
                aria-label="Close email dialog"
                onClick={closeDialog}
              >
                <CloseIcon />
                <span className="mail-dialog-sr-only">Close</span>
              </button>
              <div className="mail-dialog-header">
                <h2 id={titleId} className="mail-dialog-title">
                  Contact via Email
                </h2>
                <Text id={descriptionId} className="mail-dialog-description">
                  Please copy the email address below
                </Text>
              </div>
              <Text className="mail-dialog-address">{email}</Text>
              <NecozButton
                ref={copyButtonRef}
                className="mail-dialog-copy"
                icon={CopyIcon}
                onClick={handleCopy}
                variant="primary"
              >
                <Text as="span" className="mail-dialog-copy-text">
                  Copy
                </Text>
              </NecozButton>
            </div>
          </div>,
          document.body,
        )
      : null;

  const toast =
    isMounted && toastMessage
      ? createPortal(
          <div className="mail-toast-root" aria-live="polite" aria-atomic="true">
            <div
              className={`mail-toast mail-dialog-frame ${
                isToastVisible ? 'mail-toast--visible' : 'mail-toast--hidden'
              }`}
              role="status"
            >
              <div className="mail-toast-content">
                <Text className="mail-toast-title">{toastMessage}</Text>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="mail-dialog-trigger"
        aria-label="Send an email"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <img src={iconSrc} alt="Email icon" className="mail-dialog-trigger__icon" />
      </button>
      {dialog}
      {toast}
    </>
  );
}
