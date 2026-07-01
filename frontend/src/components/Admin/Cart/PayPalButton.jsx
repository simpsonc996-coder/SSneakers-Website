import React, { useState, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { formatZAR } from "../../../utils/formatPrice";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
const DISPLAY_CURRENCY = import.meta.env.VITE_PAYPAL_CURRENCY || "ZAR";
// PayPal only supports a limited set of currencies. ZAR is not supported,
// so we always charge in USD and convert the display price on the fly.
const PAYPAL_CURRENCY = "USD";

const PayPalButton = ({ totalAmount, onSuccess, onError, onCancel, disabled }) => {
  const configuredClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const isConfigured = configuredClientId && configuredClientId !== "your_paypal_client_id_here";
  const clientId = isConfigured ? configuredClientId : "sb";

  const [usdAmount, setUsdAmount] = useState(null);
  const [conversionError, setConversionError] = useState(null);

  useEffect(() => {
    if (!totalAmount) return;

    if (DISPLAY_CURRENCY === PAYPAL_CURRENCY) {
      setUsdAmount(Number(totalAmount).toFixed(2));
      return;
    }

    fetch(
      `${BACKEND_URL}/api/currency/convert?from=${DISPLAY_CURRENCY}&to=${PAYPAL_CURRENCY}&amount=${totalAmount}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.convertedAmount) {
          setUsdAmount(data.convertedAmount.toFixed(2));
        } else {
          setConversionError(data.error || "Currency conversion failed");
        }
      })
      .catch(() => setConversionError("Unable to fetch exchange rate"));
  }, [totalAmount]);

  if (disabled) {
    return (
      <div className="p-4 rounded border border-gray-200 bg-gray-100 text-gray-600">
        Processing payment, please wait...
      </div>
    );
  }

  if (conversionError) {
    return (
      <div className="p-4 rounded border border-red-200 bg-red-50 text-red-600">
        {conversionError}. Please refresh and try again.
      </div>
    );
  }

  if (!usdAmount) {
    return (
      <div className="p-4 rounded border border-gray-200 bg-gray-50 text-gray-500">
        Loading payment options...
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        "client-id": clientId,
        currency: PAYPAL_CURRENCY,
        intent: "capture",
      }}
    >
      <p className="text-xs text-gray-400 mb-2 italic">
        PayPal processes in USD. Your total of {formatZAR(totalAmount)} will be charged as ${usdAmount} USD at today's exchange rate.
      </p>
      <PayPalButtons
        forceReRender={[usdAmount]}
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: usdAmount,
                  currency_code: PAYPAL_CURRENCY,
                },
              },
            ],
          });
        }}
        onApprove={async (data, actions) => {
          try {
            const details = await actions.order.capture();
            if (onSuccess) {
              await onSuccess(details);
            }
          } catch (error) {
            if (onError) {
              onError(error);
            }
          }
        }}
        onError={(err) => {
          if (onError) {
            onError(err);
          }
        }}
        onCancel={() => {
          if (onCancel) {
            onCancel();
          }
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalButton;
