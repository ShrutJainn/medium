import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";
import { useState } from "react";

function SignupInputs() {
  const { register, handleSubmit } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(inputs: object) {
    setIsLoading(true);
    try {
      console.log(inputs);
      const { data } = await axios.post(
        `${import.meta.env.VITE_APP_URL}/users/signup`,
        inputs
      );
      console.log(data);
      toast.success(data.msg);
      localStorage.setItem("medium-jwt", data.jwt);
      navigate("/blogs");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      if (error.response.data.error)
        return toast.error(error.response.data.error);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div>
      <h1 className="text-center  font-bold text-3xl">Create an account</h1>
      <p className="text-center">
        Already have an account? <Link to={"/signin"}>Login</Link>{" "}
      </p>
      <div className=" mt-12">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <input
              {...register("name")}
              className=" border-2 p-3 rounded-full"
              type="text"
              placeholder="Full Name"
            ></input>
            <input
              {...register("email")}
              className=" border-2 p-3 rounded-full"
              type="email"
              placeholder="Email"
            ></input>
            <input
              {...register("password")}
              className=" border-2 p-3 rounded-full"
              type="password"
              placeholder="Password"
            ></input>

            <button
              disabled={isLoading}
              type="submit"
              className=" bg-slate-700 text-white w-full rounded-full h-12"
            >
              {isLoading ? "Signing In" : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignupInputs;
