import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { doc, updateDoc, setDoc, serverTimestamp, collection } from "firebase/firestore";
import { userDB } from "../../firebaseUser";
import toast, { Toaster } from "react-hot-toast";



// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [clientSecret, setClientSecret] = useState("");

    // Plan pricing map
    const planPrices = {
        "Starter": 2900, // in cents
        "Growth": 9900,
        "Enterprise": 29900
    };

    const amount = planPrices[user?.plan] || 2900;

    useEffect(() => {
        if (user && !clientSecret) {
            createPaymentIntent();
        }
    }, [user]);

    const createPaymentIntent = async () => {
        try {
            const response = await fetch("https://api.stripe.com/v1/payment_intents", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${import.meta.env.VITE_STRIPE_SECRET_KEY}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    amount: amount.toString(),
                    currency: "usd",
                    "payment_method_types[]": "card"
                })
            });

            const data = await response.json();
            if (data.error) {
                toast.error(data.error.message);
            } else {
                setClientSecret(data.client_secret);
            }
        } catch (err) {
            console.error("Stripe Intent Error:", err);
            toast.error("Failed to initialize payment.");
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements || !clientSecret) {
            return;
        }

        setLoading(true);

        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement),
                billing_details: {
                    name: user.displayName || user.email,
                    email: user.email
                },
            },
        });

        if (result.error) {
            console.error(result.error);
            toast.error(result.error.message);
            setLoading(false);
        } else {
            if (result.paymentIntent.status === 'succeeded') {
                await handleSuccess(result.paymentIntent);
            }
        }
    };

    const handleSuccess = async (paymentIntent) => {
        try {
            // 1. Record Payment
            await setDoc(doc(collection(userDB, "payments")), {
                partnerId: user.uid,
                plan: user.plan,
                amount: amount / 100,
                stripePaymentIntentId: paymentIntent.id,
                status: "success",
                createdAt: serverTimestamp()
            });

            // 2. Activate Partner
            await updateDoc(doc(userDB, "partners", user.uid), {
                isActive: true,
                subscriptionStart: serverTimestamp()
            });

            toast.success("Payment successful! Redirecting...");
            setTimeout(() => {
                navigate("/partner/dashboard");
            }, 2000);

        } catch (err) {
            console.error("Database Update Error:", err);
            toast.error("Payment successful but failed to update profile. Contact support.");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            <div className="payment-header">
                <h3 className="payment-plan">{user?.plan} Plan</h3>
                <div className="payment-amount text-dark">${(amount / 100).toFixed(2)}</div>
            </div>

            <div className="card-element-container">
                <CardElement options={{
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#141c23',
                            '::placeholder': {
                                color: '#94a3b8',
                            },
                        },
                        invalid: {
                            color: '#ef4444',
                        },
                    },
                }} />
            </div>

            <button type="submit" disabled={!stripe || loading || !clientSecret} className="glass-btn primary w-100">
                {loading ? "Processing Payment..." : "Complete Subscription"}
            </button>

            <p className="test-mode-note">
                complete the payment and publish your first ad for free
            </p>
        </form>
    );
};

export default function PartnerPayment() {
    const { user } = useAuth();

    return (
        <div className="partner-payment-page">
            <Toaster position="top-right" />
            <div className="glass-card payment-card">
                <h2 className="glass-title">Complete Subscription</h2>
                <p className="glass-subtitle">Secure payment powered by Stripe</p>

                <Elements stripe={stripePromise}>
                    <CheckoutForm />
                </Elements>
            </div>
        </div>
    );
}
