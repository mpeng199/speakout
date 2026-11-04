"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type NavLink = { label: string; hash: string };

export function Nav({ name, links, cta }: { name: string; links: NavLink[]; cta: NavLink }) {
  const pathname = usePathname();
  const base = pathname === "/" ? "" : "/";
  const dialogRef = useRef<HTMLDialogElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    const d = dialogRef.current;
    if (!d || !d.open) return;
    d.classList.add("is-closing");
    window.setTimeout(() => {
      d.classList.remove("is-closing");
      d.close();
    }, 260);
  }, []);

  const show = useCallback(() => {
    dialogRef.current?.showModal();
    setOpen(true);
    document.documentElement.classList.add("menu-open");
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onClose = () => {
      setOpen(false);
      document.documentElement.classList.remove("menu-open");
      buttonRef.current?.focus({ preventScroll: true });
    };
    const onCancel = (e: Event) => {
      e.preventDefault();
      close();
    };
    d.addEventListener("close", onClose);
    d.addEventListener("cancel", onCancel);
    return () => {
      d.removeEventListener("close", onClose);
      d.removeEventListener("cancel", onCancel);
    };
  }, [close]);

  // Close the menu if the route changes.
  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <>
      <header className="site-nav" data-site-nav data-theme="hero">
        <div className="wrap site-nav-inner">
          <Link href="/" className="site-nav-mark t-ui" aria-label={`${name}, home`}>
            {name}
          </Link>
          <nav aria-label="Main" className="site-nav-links">
            <ul>
              {links.map((l) => (
                <li key={l.hash}>
                  <a href={`${base}#${l.hash}`} className="t-label link-draw">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a href={`${base}#${cta.hash}`} className="site-nav-cta t-label">
            {cta.label}
          </a>
          <button
            ref={buttonRef}
            type="button"
            className="site-nav-menu t-label"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={show}
          >
            Menu
          </button>
        </div>
      </header>

      <dialog
        ref={dialogRef}
        id="site-menu"
        className="site-menu"
        aria-label="Menu"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) close();
        }}
      >
        <div className="site-menu-inner wrap">
          <div className="site-menu-top">
            <span className="t-ui">{name}</span>
            <button type="button" className="t-label site-menu-close" onClick={close}>
              Close
            </button>
          </div>
          <nav aria-label="Menu">
            <ul className="site-menu-links">
              {links.map((l, i) => (
                <li key={l.hash} style={{ "--i": i } as React.CSSProperties}>
                  <a href={`${base}#${l.hash}`} className="t-d2">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a href={`${base}#${cta.hash}`} className="btn btn-amber site-menu-cta">
            <span>{cta.label}</span>
            <span className="arrow-down" aria-hidden="true">
              ↓
            </span>
          </a>
        </div>
      </dialog>
    </>
  );
}
