import React from 'react';
import Nav from '@/components/nav/Nav';
import Footer from '@/components/layout/Footer';

export default function PublicLayout({
    children,
}: { children: React.ReactNode }) {
    return (
        <div>
            <Nav />
            <main className="container">{children}</main>
            <Footer />
        </div>
        
    );
}
