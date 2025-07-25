"use client";
import FooterSection from "@/components/layout/footer-section";
import Header from "@/components/layout/header";
import Navbar from "@/components/layout/navbar";
import React from "react";

export default function GlobalError({ error, reset }) {
    return (
        <html>
            <body>
                <Header />
                <Navbar/>
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#fff' }}>
                    <h1 style={{ fontSize: 48, color: '#1a1a1a', marginBottom: 16 }}>404 - Page Not Found</h1>
                    <p style={{ color: '#333', marginBottom: 24 }}>Sorry, the page you are looking for does not exist.</p>
                    <a href="/" style={{ color: '#fff', background: '#1a1a1a', padding: '10px 24px', borderRadius: 6, textDecoration: 'none' }}>Go Home</a>
                </div>
                <FooterSection/>
            </body>
        </html>
    );
} 