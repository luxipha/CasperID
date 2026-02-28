import React from 'react';

interface FooterProps {
    children: React.ReactNode;
}

const Footer: React.FC<FooterProps> = ({ children }) => (
    <footer className="p-8 text-center relative z-20">
        {children}
    </footer>
);

export default Footer;
