import React, { useState } from "react";
import FormInput from "../../components/FormInput/FormInput.component";
import CustomButton from "../../components/CustomButton/CustomButton.component";
import { auth } from "../../firebase/firebase.utils";
import { signInWithEmailAndPassword } from "firebase/auth";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Signed in
      const user = userCredential.user;
    } catch (error) {
      console.error("Sign in error:", error);
      const errorCode = error.code;
      const errorMessage = error.message;
    }
  };

  const handleChange = (event) => {
    const { value, name } = event.target;
    if (name === "email") {
      setEmail(value);
    } else {
      setPassword(value);
    }
  };

  return (
    <div className='sign-in'>
      <div className='sign-in__main'>
        <h2>Sign in with your email and password</h2>

        <form onSubmit={handleSubmit}>
          <FormInput
            name='email'
            type='email'
            handleChange={handleChange}
            value={email}
            label='email'
            required
          />

          <FormInput
            name='password'
            type='password'
            value={password}
            handleChange={handleChange}
            label='password'
            required
          />
          <div className='buttons'>
            <CustomButton type='submit'>Sign In</CustomButton>
          </div>
        </form>
        {/* <SignUp /> */}
      </div>
    </div>
  );
}
export default SignIn;
