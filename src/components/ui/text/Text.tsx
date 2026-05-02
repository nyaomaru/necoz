import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

type TextTag = 'a' | 'h1' | 'h2' | 'p' | 'span';

type SharedTextProps = {
  /** HTML tag used for the text wrapper. */
  as?: TextTag;
  /** Additional class names appended after `necoz-basic-text`. */
  className?: string;
};

type TextAnchorProps = SharedTextProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    as: 'a';
    /** Content rendered inside the text wrapper. */
    children?: ReactNode;
  };

type TextHeadingProps = SharedTextProps &
  HTMLAttributes<HTMLHeadingElement> & {
    as: 'h1' | 'h2';
    /** Content rendered inside the text wrapper. */
    children?: ReactNode;
  };

type TextBlockProps = SharedTextProps &
  HTMLAttributes<HTMLParagraphElement> & {
    as?: 'p';
    /** Content rendered inside the text wrapper. */
    children?: ReactNode;
  };

type TextInlineProps = SharedTextProps &
  HTMLAttributes<HTMLSpanElement> & {
    as: 'span';
    /** Content rendered inside the text wrapper. */
    children?: ReactNode;
  };

type TextProps = TextAnchorProps | TextHeadingProps | TextBlockProps | TextInlineProps;

export default function Text({ as, children, className = '', ...props }: TextProps) {
  const tag = as ?? 'p';
  const resolvedClassName = ['necoz-basic-text', className].filter(Boolean).join(' ');

  if (tag === 'span') {
    const spanProps = props as HTMLAttributes<HTMLSpanElement>;

    return (
      <span className={resolvedClassName} {...spanProps}>
        {children}
      </span>
    );
  }

  if (tag === 'a') {
    const anchorProps = props as AnchorHTMLAttributes<HTMLAnchorElement>;

    return (
      <a className={resolvedClassName} {...anchorProps}>
        {children}
      </a>
    );
  }

  if (tag === 'h1') {
    const headingProps = props as HTMLAttributes<HTMLHeadingElement>;

    return (
      <h1 className={resolvedClassName} {...headingProps}>
        {children}
      </h1>
    );
  }

  if (tag === 'h2') {
    const headingProps = props as HTMLAttributes<HTMLHeadingElement>;

    return (
      <h2 className={resolvedClassName} {...headingProps}>
        {children}
      </h2>
    );
  }

  const paragraphProps = props as HTMLAttributes<HTMLParagraphElement>;

  return (
    <p className={resolvedClassName} {...paragraphProps}>
      {children}
    </p>
  );
}
