import * as fs from 'fs';

let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

const oldNav = `<nav className="flex items-center gap-6 sm:gap-10">
          {navItems.map((item) => {`;

const newNav = `<nav className="flex items-center gap-6 sm:gap-10">
          {location.pathname !== '/auth' && navItems.map((item) => {`;

content = content.replace(oldNav, newNav);

const oldThemeToggle = `          <button 
            onClick={toggleDarkMode}`;

const newThemeToggle = `          })}
          
          <button 
            onClick={toggleDarkMode}`;

content = content.replace(oldThemeToggle, newThemeToggle);

// Clean up any double `})}` if I messed up the replace
content = content.replace(/}\)\}\n\s*}\)\}/g, '})}');

fs.writeFileSync('src/layouts/MainLayout.tsx', content);
