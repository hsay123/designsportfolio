"use client";

import React from "react";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Playground", href: "#playground" },
];

export function NavHeader() {
  return (
    <nav className="relative z-[100]">
      <div className="mx-auto max-w-[1400px] px-8 flex items-center justify-between h-14 overflow-y-visible">
        <a href="/" className="absolute left-0 flex items-center" style={{ marginLeft: 130, marginBottom: -50 }}>
          <img src="/Ylogo.png" alt="Yash Landge Logo" className="!w-[182px] !h-auto block min-w-[182px]" />
        </a>
        <div className="flex items-center gap-6 shrink-0 ml-auto">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-[family-name:var(--font-noto)] text-[12px] text-stone-500 hover:text-stone-800 transition-colors tracking-wide"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
