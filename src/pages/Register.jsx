import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import register from "../assets/register.webp";
import { sendOtpForRegister, verifyOtpAndRegister } from "../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { mergeCart } from "../redux/slices/cartSlice";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, guestId, loading, error } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);

  // Get redirect parameter
  const redirect = new URLSearchParams(location.search).get("redirect") || "/";
  const isCheckoutRedirect = redirect.includes("checkout");

  useEffect(() => {
    if (user) {
      if (cart?.products.length > 0 && guestId) {
        dispatch(mergeCart({ guestId, user })).then(() => {
          navigate(isCheckoutRedirect ? "/checkout" : "/");
        });
      } else {
        navigate(isCheckoutRedirect ? "/checkout" : "/");
      }
    }
  }, [user, guestId, cart, navigate, isCheckoutRedirect, dispatch]);

  // Step 1: Handle signup (send OTP, not register yet)
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(sendOtpForRegister({ name, email, password }))
      .unwrap()
      .then(() => {
        setShowOtpModal(true); // open OTP modal
      })
      .catch((err) => {
        console.error("Error sending OTP:", err);
      });
  };

  // Step 2: Handle OTP verification
  const handleOtpVerify = () => {
    dispatch(verifyOtpAndRegister({ email, otp }))
      .unwrap()
      .then(() => {
        setShowOtpModal(false);
      })
      .catch((err) => {
        console.error("OTP verification failed:", err);
      });
  };

  return (
    <div className="flex">
      <div className="flex flex-col items-center justify-center w-full p-8 md:w-1/2 md:p-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md p-8 bg-white border rounded-lg shadow-sm"
        >
          <div className="flex justify-center mb-6">
            <h2 className="text-xl font-medium">Rabbit</h2>
          </div>
          <h2 className="mb-6 text-2xl font-bold text-center">Hey there! 👋🏻</h2>
          <p className="mb-6 text-center">Enter details to Sign Up.</p>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-semibold">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your Name"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your email address"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full p-2 font-semibold text-white transition bg-black rounded-lg hover:bg-gray-800"
          >
            {loading ? "loading..." : "Sign Up"}
          </button>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          <p className="mt-6 text-sm text-center">
            Already have an account?{" "}
            <Link
              to={`/login?redirect=${encodeURIComponent(redirect)}`}
              className="text-blue-500"
            >
              Login
            </Link>
          </p>
        </form>
      </div>

      {/* Right side image */}
      <div className="hidden w-1/2 bg-gray-800 md:block">
        <div className="flex flex-col items-center justify-center h-full">
          <img
            src={register}
            alt="Register"
            className="h-[750px] w-full object-cover"
          />
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 bg-white rounded shadow-md w-96">
            <h2 className="text-lg font-semibold">Enter OTP</h2>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 mt-4 border rounded"
              placeholder="Enter OTP"
            />
            <button
              onClick={handleOtpVerify}
              className="w-full p-2 mt-4 text-white bg-blue-600 rounded"
            >
              Verify OTP
            </button>
            <button
              onClick={() => setShowOtpModal(false)}
              className="w-full p-2 mt-2 text-gray-700 bg-gray-200 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
