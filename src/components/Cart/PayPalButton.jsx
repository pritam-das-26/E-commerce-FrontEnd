import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PayPalButton = ({ amount, onSuccess, onError }) => {
  return (
    <PayPalScriptProvider
      options={{
        clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [{ amount: { value: parseFloat(amount).toFixed(2) } }],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then((details) => {
            console.log("✅ Real PayPal payment success:", details);
            onSuccess(details);
          });
        }}
        onCancel={(data) => {
          console.log("⚙️ PayPal popup closed — simulating payment success...");
          // fake PayPal payment details for simulation
          const fakeDetails = {
            id: data.orderID,
            status: "COMPLETED",
            payer: {
              name: { given_name: "Test", surname: "User" },
              email_address: "testuser@example.com",
            },
            simulate: true,
          };
          onSuccess(fakeDetails); // treat close as success
        }}
        onError={(err) => {
          console.error("❌ PayPal error", err);
          onError(err);
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalButton;
