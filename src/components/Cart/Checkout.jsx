import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PayPalButton from "./PayPalButton";
import { useDispatch, useSelector } from "react-redux";
import { createCheckout } from "../../redux/slices/checkoutSlice";
import axios from "axios";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart, loading, error } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [checkoutId, setCheckoutId] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  // Redirect if cart empty
  useEffect(() => {
    if (!cart || !cart.products || cart.products.length === 0) {
      navigate("/");
    }
  }, [cart, navigate]);

  // ✅ Step 1: Create checkout record
  const handleCreateCheckout = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("userToken");
    if (!token) {
      alert("Authentication failed. Please log in again.");
      navigate("/login");
      return;
    }

    if (cart && cart.products.length > 0) {
      const res = await dispatch(
        createCheckout({
          checkoutItems: cart.products.map((p) => ({
            productId: p._id || p.productId,
            name: p.name,
            image: p.image,
            price: Number(p.price),
            quantity: p.quantity,
            size: p.size,
            color: p.color,
          })),
          shippingAddress,
          paymentMethod: "Paypal",
          totalPrice: Number(cart.totalPrice),
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      if (res.payload && res.payload._id) {
        setCheckoutId(res.payload._id);
      }
    }
  };

  // ✅ Step 2: Payment success → mark as paid + finalize order
  const handlePaymentSuccess = async (details) => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      alert("Authentication failed. Please log in again.");
      navigate("/login");
      return;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/pay`,
        { paymentStatus: "paid", paymentDetails: details },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await handleFinalizeCheckout(checkoutId); // convert checkout → order
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment could not be verified. Try again.");
    }
  };

  // ✅ Step 3: Finalize checkout (backend creates order + clears cart)
  const handleFinalizeCheckout = async (checkoutId) => {
    const token = localStorage.getItem("userToken");
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/finalize`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/order-confirmation");
    } catch (error) {
      console.error(error);
      alert("Order finalization failed.");
    }
  };

  // ✅ Step 4: PayPal popup closed → optional action
  const handlePaypalCancel = async () => {
    console.log("User closed PayPal popup before payment.");
    // Optionally notify backend:
    // const token = localStorage.getItem("userToken");
    // await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/cancel`, {}, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
  };

  if (loading) return <p>Loading cart ...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!cart || !cart.products || cart.products.length === 0) {
    return <p>Your cart is empty</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-8 px-6 py-10 mx-auto tracking-tighter lg:grid-cols-2 max-w-7xl">
      {/* Left Section */}
      <div className="p-6 bg-white rounded-lg">
        <h2 className="mb-6 text-2xl uppercase">Checkout</h2>
        <form onSubmit={handleCreateCheckout}>
          {/* Shipping Form */}
          <h3 className="mb-4 text-lg">Delivery Details</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label>First Name</label>
              <input
                type="text"
                value={shippingAddress.firstName}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    firstName: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label>Last Name</label>
              <input
                type="text"
                value={shippingAddress.lastName}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    lastName: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label>Address</label>
            <input
              type="text"
              value={shippingAddress.address}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  address: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label>City</label>
              <input
                type="text"
                value={shippingAddress.city}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    city: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label>Postal Code</label>
              <input
                type="text"
                value={shippingAddress.postalCode}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    postalCode: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label>Country</label>
            <input
              type="text"
              value={shippingAddress.country}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  country: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label>Phone</label>
            <input
              type="tel"
              value={shippingAddress.phone}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  phone: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {/* ✅ Button Section */}
          <div className="mt-6">
            {!checkoutId ? (
              <button
                type="submit"
                className="w-full py-3 text-white bg-black rounded"
              >
                Continue to Payment
              </button>
            ) : (
              <div>
                <h3 className="mb-4 text-lg">Pay with PayPal</h3>
                <PayPalButton
                  amount={cart.totalPrice}
                  onSuccess={handlePaymentSuccess}
                  onError={(err) => alert("Payment failed. Try again.")}
                  onCancel={handlePaypalCancel}
                />
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Right Section */}
      <div className="p-6 rounded-lg bg-gray-50">
        <h3 className="mb-4 text-lg">Order Summary</h3>
        <div className="py-4 mb-4 border-t">
          {cart.products.map((product, index) => (
            <div
              key={index}
              className="flex items-start justify-between py-2 border-b"
            >
              <div className="flex items-start">
                <img
                  src={product.image}
                  alt={product.name}
                  className="object-cover w-20 h-24 mr-4"
                />
                <div>
                  <h3 className="text-md">{product.name}</h3>
                  <p className="text-gray-500">Size: {product.size}</p>
                  <p className="text-gray-500">Color: {product.color}</p>
                </div>
              </div>
              <p className="text-xl">${product.price?.toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mb-4 text-lg">
          <p>Subtotal</p>
          <p>${cart.totalPrice?.toLocaleString()}</p>
        </div>
        <div className="flex items-center justify-between text-lg">
          <p>Shipping</p>
          <p>Free</p>
        </div>
        <div className="flex items-center justify-between pt-4 mt-4 text-lg border-t">
          <p>Total</p>
          <p>${cart.totalPrice?.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
