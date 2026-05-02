import { forwardRef } from 'react';
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ForwardedRef,
  ReactElement,
  ReactNode,
} from 'react';

import './NecozButton.css';

type IconComponent = () => ReactElement;

type NecozButtonBaseProps = {
  /** Button label or content. */
  children?: ReactNode;
  /** Additional class names appended to the button root. */
  className?: string;
  /** Optional icon component rendered before the label. */
  icon?: IconComponent;
  /** Visual variant name. */
  variant?: 'primary' | 'secondary';
};

type NecozButtonAsButtonProps = NecozButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    /** Render as a native button. */
    as?: 'button';
  };

type NecozButtonAsAnchorProps = NecozButtonBaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    /** Render as a native anchor. */
    as: 'a';
    /** Destination URL for anchor usage. */
    href: string;
  };

type NecozButtonProps = NecozButtonAsAnchorProps | NecozButtonAsButtonProps;
type NecozButtonComponent = {
  (
    props: NecozButtonAsAnchorProps & { ref?: ForwardedRef<HTMLAnchorElement> },
  ): ReactElement | null;
  (
    props: NecozButtonAsButtonProps & { ref?: ForwardedRef<HTMLButtonElement> },
  ): ReactElement | null;
};

const getResolvedClassName = (variant: NecozButtonBaseProps['variant'], className: string) =>
  ['necoz-button', `necoz-button--${variant ?? 'primary'}`, className].filter(Boolean).join(' ');

const NecozButton = forwardRef<HTMLAnchorElement | HTMLButtonElement, NecozButtonProps>(
  function NecozButton(props, ref) {
    const { children, className = '', icon: Icon, variant = 'primary' } = props;
    const resolvedClassName = getResolvedClassName(variant, className);

    if (props.as === 'a') {
      const {
        as: _as,
        children: _children,
        className: _className,
        icon: _icon,
        variant: _variant,
        ...anchorProps
      } = props;

      return (
        <a
          ref={ref as ForwardedRef<HTMLAnchorElement>}
          className={resolvedClassName}
          {...anchorProps}
        >
          {Icon ? <Icon /> : null}
          {children}
        </a>
      );
    }

    const {
      as: _as,
      children: _children,
      className: _className,
      icon: _icon,
      variant: _variant,
      type = 'button',
      ...buttonProps
    } = props;

    return (
      <button
        ref={ref as ForwardedRef<HTMLButtonElement>}
        type={type}
        className={resolvedClassName}
        {...buttonProps}
      >
        {Icon ? <Icon /> : null}
        {children}
      </button>
    );
  },
) as NecozButtonComponent;

export default NecozButton;
