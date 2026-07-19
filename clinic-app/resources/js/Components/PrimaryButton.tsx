import { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & PropsWithChildren) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-gray-900 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
