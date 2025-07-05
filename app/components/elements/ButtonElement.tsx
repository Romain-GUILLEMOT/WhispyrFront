import React from 'react';
import classNames from 'classnames';
import Loading from "./Loading"; // Assurez-vous que le chemin vers Loading est correct

type ButtonType = 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'neutral';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type ButtonRounded = 'none' | 'sm' | 'md' | 'lg' | 'full';
type ButtonShadow = 'none' | 'sm' | 'md' | 'lg';
type TypeOfButton = 'button' | 'submit';

interface ButtonProps {
    type?: ButtonType;
    buttonType?: TypeOfButton;
    size?: ButtonSize;
    rounded?: ButtonRounded;
    shadow?: ButtonShadow;
    bold?: boolean;
    className?: string;
    children: React.ReactNode;
    title?: string;
    disabled?: boolean;
    onClick?: () => void;
    isLoading?: boolean;
    // La prop 'blue' a été supprimée car elle est redondante avec les nouveaux types
}

export default function ButtonElement({
                                          type = 'primary',
                                          buttonType = 'button',
                                          size = 'md',
                                          rounded = 'lg', // Arrondi par défaut pour un style plus moderne
                                          shadow = 'md',
                                          bold = false,
                                          className = '',
                                          title,
                                          children,
                                          disabled = false,
                                          onClick,
                                          isLoading = false,
                                          ...rest
                                      }: ButtonProps) {

    const baseClasses = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-whisper-400 transition-all duration-300 transform hover:-translate-y-0.5';

    const typeClasses = {
        primary: `bg-whisper-500 text-white hover:bg-whisper-600 shadow-lg hover:shadow-whisper-500/50`,
        secondary: `bg-glass-light text-gray-200 border border-glass-border hover:bg-whisper-500 hover:text-white backdrop-blur-sm`,
        neutral: `bg-glass-medium text-gray-200 border border-glass-border hover:bg-glass-light`,
        error: `bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-red-600/50`,
        success: `bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-green-600/50`,
        warning: `bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg hover:shadow-yellow-500/50`,
    };

    const sizeClasses = {
        xs: 'px-2.5 py-1.5 text-xs',
        sm: 'px-3 py-2 text-sm',
        md: 'px-5 py-2.5 text-base',
        lg: 'px-6 py-3 text-lg',
        xl: 'px-7 py-3.5 text-xl',
    };

    const roundedClasses = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
    };

    const shadowClasses = {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
    };

    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-md' : '';

    const boldClass = bold ? 'font-semibold' : 'font-medium';

    const buttonClasses = classNames(
        baseClasses,
        typeClasses[type],
        sizeClasses[size],
        roundedClasses[rounded],
        shadowClasses[shadow],
        boldClass,
        disabledClasses,
        className
    );

    return (
        <button {...rest} type={buttonType} disabled={disabled || isLoading} className={buttonClasses} onClick={onClick} title={title}>
            {isLoading ? <Loading /> : children}
        </button>
    );
}
