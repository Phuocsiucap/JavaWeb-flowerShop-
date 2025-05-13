package com.dto.request;

import java.util.List;

import com.model.OrderItem;

public class CheckoutRequest {
        public String shippingAddress;
        public String phoneNumber;
        public String paymentMethod;
        public List<OrderItem> items;
		public String getShippingAddress() {
			return shippingAddress;
		}
		public void setShippingAddress(String shippingAddress) {
			this.shippingAddress = shippingAddress;
		}
		public String getPhoneNumber() {
			return phoneNumber;
		}
		public void setPhoneNumber(String phoneNumber) {
			this.phoneNumber = phoneNumber;
		}
		public String getPaymentMethod() {
			return paymentMethod;
		}
		public void setPaymentMethod(String paymentMethod) {
			this.paymentMethod = paymentMethod;
		}
		public List<OrderItem> getItems() {
			return items;
		}
		public void setItems(List<OrderItem> items) {
			this.items = items;
		}
		@Override
		public String toString() {
			return "CheckoutRequest [shippingAddress=" + shippingAddress + ", phoneNumber=" + phoneNumber
					+ ", paymentMethod=" + paymentMethod + ", items=" + items + "]";
		}
        
        
        
        
    }