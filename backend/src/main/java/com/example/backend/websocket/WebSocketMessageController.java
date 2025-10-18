package com.example.backend.websocket;

import com.example.backend.dto.request.MessageRequest;
import com.example.backend.dto.response.MessageResponse;
import com.example.backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;

/**
 * WebSocket Controller cho Real-time Messaging
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketMessageController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Gửi tin nhắn qua WebSocket
     * Client gửi đến: /app/chat.send
     * Server broadcast đến: /user/{userId}/queue/messages
     */
    @MessageMapping("/chat.send")
    public void sendMessage(
            @Payload MessageRequest messageRequest,
            Principal principal) {
        
        try {
            // Lấy userId từ Principal
            Long senderId = getUserIdFromPrincipal(principal);
            
            log.info("========== WEBSOCKET SEND MESSAGE ==========");
            log.info("Principal: {}", principal != null ? principal.getName() : "NULL");
            log.info("Sender ID: {}", senderId);
            log.info("Recipient ID: {}", messageRequest.getRecipientId());
            log.info("Content: {}", messageRequest.getContent());

            if (senderId == null) {
                log.error("❌ Sender ID is NULL - Authentication failed");
                messagingTemplate.convertAndSendToUser(
                        "unknown",
                        "/queue/errors",
                        "Authentication failed: User ID not found"
                );
                return;
            }

            // Lưu message vào database
            MessageResponse messageResponse = messageService.sendMessage(
                    senderId,
                    messageRequest
            );

            log.info("Message saved to database with ID: {}", messageResponse.getId());

            // ⭐ QUAN TRỌNG: Phải gửi đến đúng destination
            String recipientDestination = "/queue/messages"; // ⭐ Đúng format

            // ⭐ Gửi tin nhắn đến người nhận
            log.info("📤 Sending to recipient user ID {}", messageRequest.getRecipientId());
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(messageRequest.getRecipientId()),
                    recipientDestination,
                    messageResponse);

            // ⭐ Gửi confirmation về cho người gửi (để hiển thị message ngay lập tức)
            log.info("📤 Sending to sender user ID {}", senderId);
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(senderId),
                    recipientDestination,
                    messageResponse);
            log.info("✅ Message sent successfully to both users");
            log.info("===========================================");

            // Gửi confirmation về cho người gửi
            log.info("Sending confirmation to sender {}", senderId);
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(senderId),
                    recipientDestination,
                    messageResponse);

            log.info("✅ WebSocket: Message sent successfully to both users");
            log.info("===========================================\n");

        } catch (Exception e) {
            log.error("❌ WebSocket: Error sending message", e);
            e.printStackTrace();
            
            try {
                Long senderId = getUserIdFromPrincipal(principal);
                if (senderId != null) {
                    messagingTemplate.convertAndSendToUser(
                            String.valueOf(senderId),
                            "/queue/errors",
                            "Failed to send message: " + e.getMessage()
                    );
                }
            } catch (Exception ex) {
                log.error("Failed to send error message", ex);
            }
        }
    }

    /**
     * User typing indicator
     * Client gửi đến: /app/chat.typing
     * Server broadcast đến: /user/{recipientId}/queue/typing
     */
    @MessageMapping("/chat.typing")
    public void typing(
            @Payload Long recipientId,
            Principal principal) {
        
        try {
            Long senderId = getUserIdFromPrincipal(principal);
            String senderName = principal != null ? principal.getName() : "Unknown";
            
            log.debug("WebSocket: User {} is typing to user {}", senderId, recipientId);

            // Gửi typing indicator đến người nhận
            messagingTemplate.convertAndSendToUser(
                    recipientId.toString(),
                    "/queue/typing",
                    senderName + " is typing..."
            );
        } catch (Exception e) {
            log.error("Error sending typing indicator", e);
        }
    }
    
    /**
     * Helper method để lấy userId từ Principal
     */
    private Long getUserIdFromPrincipal(Principal principal) {
        if (principal == null) {
            log.error("Principal is NULL");
            return null;
        }
        
        log.debug("Principal type: {}", principal.getClass().getName());
        log.debug("Principal name: {}", principal.getName());
        
        if (principal instanceof UsernamePasswordAuthenticationToken) {
            UsernamePasswordAuthenticationToken auth = (UsernamePasswordAuthenticationToken) principal;
            Object principalObj = auth.getPrincipal();
            
            log.debug("Principal object type: {}", principalObj.getClass().getName());
            
            if (principalObj instanceof com.example.backend.security.UserPrincipal) {
                com.example.backend.security.UserPrincipal userPrincipal = 
                    (com.example.backend.security.UserPrincipal) principalObj;
                return userPrincipal.getId();
            }
        }
        
        // Fallback: Try to parse name as Long (if Principal name is userId)
        try {
            return Long.parseLong(principal.getName());
        } catch (NumberFormatException e) {
            log.error("Cannot parse principal name to Long: {}", principal.getName());
            return null;
        }
    }
}