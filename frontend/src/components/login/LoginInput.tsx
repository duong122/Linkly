import  React from "react";
import  { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

interface LoginFormData {
  username: string;
  password: string;
}

// Định nghĩa URL API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;
const LOGIN_API_URL = `${API_BASE_URL}/api/auth/login`

export const LoginInputs: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });


  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };



  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);                     

    try {
      const response = await fetch(LOGIN_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      console.log("response: ", response);

      if (response.ok) {
        // Đăng nhập thành công
        localStorage.setItem('authToken', data.accessToken);
        localStorage.setItem('username', formData.username);
        localStorage.setItem('password', formData.password);

        console.log("Login Success:", data);
        navigate("/home");
      } else {
        // Lỗi từ server (4xx, 5xx)
        setError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      // Lỗi mạng (Network error)
      setError("Network error or server unreachable.");
      console.error("API call error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="caret-transparent flex flex-col" onSubmit={handleSubmit}>
      <div className="relative items-stretch box-border caret-transparent flex flex-col shrink-0 justify-start mt-6">
        <div className="caret-transparent mb-1.5 mx-10">
          <div className="relative items-center bg-zinc-50 box-border caret-transparent flex w-full border border-zinc-300 rounded-[3px] border-solid">
            <label className="relative caret-transparent flex basis-0 grow shrink-0 h-9">
              {/* <span className="absolute text-neutral-500 text-xs caret-transparent block h-9 leading-9 text-ellipsis text-nowrap origin-[0%_50%] overflow-hidden left-2 right-0">
                Phone number, username, or email
              </span> */}
              <input
                aria-label="Phone number, username, or email"
                type="text"
                value={formData.username}
                onChange={handleChange}
                name="username"
                className="text-base bg-zinc-50 caret-transparent block grow shrink-0 text-left text-ellipsis pl-2 pr-0 pt-[9px] pb-[7px]"
               placeholder="Username or email"
              />
            </label>
            <div className="relative items-center box-border caret-transparent flex shrink-0 h-full align-middle pr-2"></div>
          </div>
        </div>
        <div className="caret-transparent mb-1.5 mx-10">
          <div className="relative items-center bg-zinc-50 box-border caret-transparent flex w-full border border-zinc-300 rounded-[3px] border-solid">
            <div className="relative flex basis-0 grow shrink-0 h-9">
              <input
                aria-label="Password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                name="password"
                className="text-base bg-zinc-50 block grow shrink-0 text-left text-ellipsis pl-2 pr-0 pt-[9px] pb-[7px]"
                placeholder="Password"
              />
            </div>
            <div className="relative items-center box-border caret-transparent flex shrink-0 h-full align-middle pr-2"></div>
          </div>
        </div>
        <div className="relative items-stretch box-border caret-transparent flex flex-col shrink-0 justify-start mx-10 my-2">
          <button
            type="submit"
            className="relative text-white font-semibold bg-indigo-500 caret-transparent block opacity-70 text-center text-ellipsis px-4 py-[7px] rounded-lg"
          >
            <div className="relative items-stretch box-border caret-transparent flex flex-col shrink-0 justify-start">
              Log in
            </div>
          </button>
        </div>
        <div className="caret-transparent mt-3.5 mb-[22px] mx-10">
          <div className="caret-transparent flex">
            <div className="relative bg-zinc-300 caret-transparent grow h-px top-[6.3px]"></div>
            <div className="relative text-neutral-500 text-[13px] font-semibold items-stretch box-border caret-transparent flex flex-col shrink-0 leading-[14.9994px] uppercase mx-[18px]">
              or
            </div>
            <div className="relative bg-zinc-300 caret-transparent grow h-px top-[6.3px]"></div>
          </div>
        </div>
        <div className="relative items-stretch box-border caret-transparent flex flex-col shrink-0 justify-start mx-10 my-2">
          <button
            type="button"
            className="relative text-indigo-600 font-semibold bg-transparent caret-transparent block text-center text-ellipsis p-0 hover:text-blue-700 hover:border-blue-700"
          >
            <div className="relative items-center box-border caret-transparent flex shrink-0 justify-center">
              <div className="relative items-stretch box-border caret-transparent flex flex-col shrink-0 justify-start mr-1 px-1">
                <img
                  src="https://c.animaapp.com/mgj5uocgnnR3L8/assets/icon-1.svg"
                  alt="Icon"
                  className="relative text-sky-500 caret-transparent h-5 w-5"
                />
              </div>
              <span className="text-sky-500 caret-transparent block">
                Log in with Facebook
              </span>
            </div>
          </button>
        </div>
      </div>
      <div className="content-center items-stretch self-center box-border caret-transparent flex flex-col shrink-0 justify-start mt-3">
        <a
          href="/accounts/password/reset/"
          role="link"
          className="relative text-zinc-950 font-medium items-center box-border caret-transparent flex shrink-0 justify-center list-none text-center text-ellipsis z-0 rounded-sm hover:underline"
        >
          Forgot password?
        </a>
      </div>
    </form>
  );
};
