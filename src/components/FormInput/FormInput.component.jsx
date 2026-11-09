import React from "react";

const FormInput = ({ handleChange, label, ...otherProps }) => (
  <div className="form__group">
    {label ? (
      <label
        className={`${
          otherProps.value.length ? "shrink" : ""
        } form-input-label`}
      >
        {label}
      </label>
    ) : null}
    <input className="form-input" onChange={handleChange} {...otherProps} />
  </div>
);
export default FormInput;
