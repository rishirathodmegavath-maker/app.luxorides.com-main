export {};

declare global {
  interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    order_id: string;

    name?: string;
    description?: string;
    image?: string;

    handler: (response: RazorpaySuccessResponse) => void;

    modal?: {
      ondismiss?: () => void;
    };

    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };

    theme?: {
      color?: string;
    };
  }

  interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  interface RazorpayInstance {
    open(): void;
    close(): void;
  }

  interface RazorpayConstructor {
    new (options: RazorpayOptions): RazorpayInstance;
  }

  interface Window {
    Razorpay: RazorpayConstructor;
  }
}
