import React from 'react';

interface IconButtonProps {
    title: string;
    children?: React.ReactNode;
    onClick: () => void;
}

export function IconButton({title, children, onClick,  ...props}: IconButtonProps) {
    return (
        <button
            type="button"
            aria-label={title}
            title={title}
            className="w-10 h-10 text-red-700 rounded flex items-center justify-center border-1 border-red-700 cursor-pointer hover:bg-red-700 hover:text-stone-50 transition-colors"
            onClick={() => {
                onClick();
            }}
            {...props}
        >
            { children }
        </button>   
    )
}