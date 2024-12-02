import React, { useState } from 'react';
import Link from 'next/link';
import '../styles/Navbar.css';
import { 
  HomeIcon, 
  CreditCardIcon, 
  CalendarIcon, 
  UsersIcon,
  CheckCircleIcon // Importa el ícono de asistencia
} from 'lucide-react';

const Navbar = () => {
    const menuItems = [
        { href: '/', label: 'Inicio', icon: HomeIcon },
        { href: '/membresias', label: 'Membresías', icon: CreditCardIcon },
        { href: '/clases', label: 'Clases', icon: CalendarIcon },
        { href: '/entrenadores', label: 'Entrenadores', icon: UsersIcon },
        { href: '/asistencia', label: 'Asistencia', icon: CheckCircleIcon } // Nuevo apartado
    ];

    return (
        <nav className="side-navbar">
            <ul className="menu">
                {menuItems.map((item) => (
                    <li key={item.href} className="menu-item">
                        <Link href={item.href} className="menu-link">
                            <item.icon size={24} className="menu-icon" />
                            <span className="menu-label">{item.label}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Navbar;
