package com.dto.response;



public class SuccessResponse {
        public String message;
        public int orderId;

        public SuccessResponse(String message, int orderId) {
            this.message = message;
            this.orderId = orderId;
        }

		public String getMessage() {
			return message;
		}

		public void setMessage(String message) {
			this.message = message;
		}

		public int getOrderId() {
			return orderId;
		}

		public void setOrderId(int orderId) {
			this.orderId = orderId;
		}
        
        
    }