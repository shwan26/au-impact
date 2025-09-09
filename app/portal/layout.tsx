import React from 'react';
import Nav from '@/components/nav/Nav';

export default function PublicLayout({
    children,
}: { children: React.ReactNode }) {
    return (
        <div>
            <Nav />
            <main className="container">{children}</main>
        </div>
    );
}
