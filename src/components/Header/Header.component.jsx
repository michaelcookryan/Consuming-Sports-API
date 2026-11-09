import React from "react";
import Menu from "../Menu/Menu.component";
import logo from "../../assets/images/logo-placeholder.svg";

export default function Header({ adminUser }) {
  return (
    <header>
      <section className='main'>
        <div className='main__title-wrapper'>
          <img src={logo} alt='Team Pool logo' />
          <h1 className='main__title'>Team Pool</h1>
          <h3 className='main__subtitle'>&mdash; 2026 &mdash;</h3>
        </div>
        <div className='main__menu-wrapper'>
          <Menu adminUser={adminUser} />
        </div>
      </section>
    </header>
  );
}
