import Quote from "../components/Quote";
import Auth from "../components/SignupInputs";

function Signup() {
  return (
    <div className=" h-screen  w-screen flex">
      {/* left div */}
      <div className="h-full w-screen lg:w-1/2 flex justify-center items-center">
        <Auth />
      </div>

      {/* right div  */}
      <div className="bg-slate-100 h-full w-1/2 hidden lg:flex flex-col justify-center items-center">
        <Quote />
      </div>
    </div>
  );
}

export default Signup;
