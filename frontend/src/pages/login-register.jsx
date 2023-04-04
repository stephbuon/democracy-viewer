import React from "react";
import { TextField } from "../common/textField.jsx";
import { useState } from "react";

export function LoginRegister() {
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [suffix, setSuffix] = useState("");
  const [orcid, setOrcid] = useState("");
  const [linkedin, setLinkedin] = useState("");

  return (
    <>
      <div className="container-fluid mt-5">
        <div className="row justify-content-center">
          <div className="col-2"></div>
          <div className="col me-3">
            <h2 className="text-center">Login</h2>
            <TextField
              label="Username:"
              value={loginUsername}
              setValue={setLoginUsername}
            />
            <TextField
              label="Password:"
              value={loginPassword}
              setValue={setLoginPassword}
            />
            {(loginUsername === "" || loginPassword === "") && (
              <button type="button" className="btn btn-md btn-primary" disabled>
                Login
              </button>
            )}
            {loginUsername !== "" && loginPassword !== "" && (
              <button
                type="button"
                className="btn btn-md btn-primary"
                onClick={() => { }}
              >
                Login
              </button>
            )}
          </div>
          <div className="col ms-3">
            <h2 className="text-center">Register</h2>
            <TextField
              label="* Email:"
              value={email}
              setValue={setEmail}
            />
            <TextField
              label="* Username:"
              value={registerUsername}
              setValue={setRegisterUsername}
            />
            <TextField
              label="* Password:"
              value={registerPassword}
              setValue={setRegisterPassword}
            />
            <TextField
              label="* Confirm Password:"
              value={registerConfirmPassword}
              setValue={setRegisterConfirmPassword}
            />
            <div className="row justify-content-center">
                <div className="col">
                    <TextField
                        label="First Name:"
                        value={first}
                        setValue={setFirst}
                    />
                    <TextField
                        label="Suffix:"
                        value={suffix}
                        setValue={setSuffix}
                    />
                    <TextField
                        label="Orcid:"
                        value={orcid}
                        setValue={setOrcid}
                    />
                </div>
                <div className="col">
                    <TextField
                        label="Last Name:"
                        value={last}
                        setValue={setLast}
                    />
                    <TextField
                        label="Title:"
                        value={title}
                        setValue={setTitle}
                    />
                    <TextField
                        label="LinkedIn:"
                        value={linkedin}
                        setValue={setLinkedin}
                    />
                </div>
            </div>
            {(registerUsername == "" ||
              registerPassword == "" ||
              registerConfirmPassword == "" ||
              registerPassword != registerConfirmPassword) && (
              <button type="button" className="btn btn-md btn-primary" disabled>
                Register
              </button>
            )}
            {registerUsername != "" &&
              registerPassword != "" &&
              registerConfirmPassword != "" &&
              registerPassword == registerConfirmPassword && (
                <button
                  type="button"
                  className="btn btn-md btn-primary"
                  onClick={() => {}}
                >
                  Register
                </button>
              )}
          </div>
          <div className="col-2"></div>
        </div>
      </div>
    </>
  );
}
