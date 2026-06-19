package com.resumeanalyzer.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String razorpayId;

    @Value("${razorpay.key.secret}")
    private String razorpaySecret;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {
        try {
            if (!data.containsKey("amount") || Integer.parseInt(data.get("amount").toString()) <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid amount"));
            }

            int amount = Integer.parseInt(data.get("amount").toString());
            RazorpayClient razorpay = new RazorpayClient(razorpayId, razorpaySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount * 100);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + System.currentTimeMillis());
            
            // Force auto-capture so test transactions complete successfully
            // and clear the Razorpay onboarding checklist
            JSONObject paymentCapture = new JSONObject();
            paymentCapture.put("method", "automatic");
            JSONObject captureOptions = new JSONObject();
            captureOptions.put("automatic", paymentCapture);
            
            // In Razorpay Orders v1, simply putting "payment_capture" is often enough
            // for auto capture. Let's add it.
            orderRequest.put("payment_capture", 1);
            
            Order order = razorpay.orders.create(orderRequest);
            
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));
            
            return ResponseEntity.ok(response);
            
        } catch (RazorpayException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error creating Razorpay order: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid request data."));
        }
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> data) {
        try {
            String razorpayOrderId = data.get("razorpay_order_id");
            String razorpayPaymentId = data.get("razorpay_payment_id");
            String razorpaySignature = data.get("razorpay_signature");

            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isValid = Utils.verifyPaymentSignature(options, razorpaySecret);

            if (isValid) {
                // Explicitly capture the payment so it shows as "Captured" (Completed) on the Razorpay Dashboard
                RazorpayClient razorpay = new RazorpayClient(razorpayId, razorpaySecret);
                
                // Fetch the payment to get the amount
                com.razorpay.Payment payment = razorpay.payments.fetch(razorpayPaymentId);
                
                // Only capture if it's currently authorized
                if ("authorized".equals(payment.get("status"))) {
                    int amount = payment.get("amount");
                    JSONObject captureRequest = new JSONObject();
                    captureRequest.put("amount", amount);
                    captureRequest.put("currency", "INR");
                    razorpay.payments.capture(razorpayPaymentId, captureRequest);
                }

                return ResponseEntity.ok(Map.of("status", "success", "message", "Payment verified and captured successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("status", "failed", "message", "Invalid signature"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}
