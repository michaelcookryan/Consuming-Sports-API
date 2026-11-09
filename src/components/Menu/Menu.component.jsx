import React from "react";
import { NavLink } from "react-router-dom";
import { auth } from "../../firebase/firebase.utils";
import { signOut } from "firebase/auth";

export default function Menu({ adminUser }) {
  const signOutAdmin = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful
      })
      .catch((error) => {
        console.error("Sign-out error:", error);
      });
  };

  return (
    <div className='main-menu'>
      <NavLink className='main-menu__option' to='/'>
        Standings
      </NavLink>
      <NavLink className='main-menu__option' to='/draft'>
        Draft
      </NavLink>

      {adminUser?.adminUser ? (
        <div className='main-menu__option sign-out' onClick={signOutAdmin}>
          Sign Out
        </div>
      ) : (
        <NavLink className='main-menu__option' to='/signin'>
          Sign In
        </NavLink>
      )}
    </div>
  );
}
