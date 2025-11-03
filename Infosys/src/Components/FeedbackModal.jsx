import React, { useState, useEffect, useRef } from "react";
import { submitFeedback } from "../api/UserAPI";
import toast from "react-hot-toast";
import gsap from "gsap";

const FeedbackModal = ({ isOpen, onClose, complaint, onFeedbackSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const emojisRef = useRef([]);

  // GSAP animation on modal open (Enter from Bottom)
  useEffect(() => {
    if (isOpen && modalRef.current && overlayRef.current) {
      // Overlay fade in
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );

      // Modal entrance animation: Start from 100% (off-screen bottom)
      gsap.fromTo(
        modalRef.current,
        { y: "100%", opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
      );
      
      // Animate emojis sequentially
      setTimeout(() => {
        gsap.fromTo(
          emojisRef.current.filter(el => el !== null),
          { scale: 0, rotation: -180, opacity: 0 },
          {
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: "elastic.out(1, 0.5)",
          }
        );
      }, 200);
    }
  }, [isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setFeedbackMessage("");
      setHoveredRating(0);
    }
  }, [isOpen]);

  // Rating emojis with unique designs
  const ratingEmojis = [
    { value: 1, emoji: "😞", label: "Very Poor", color: "#ef4444" },
    { value: 2, emoji: "😕", label: "Poor", color: "#f97316" },
    { value: 3, emoji: "😐", label: "Average", color: "#eab308" },
    { value: 4, emoji: "😊", label: "Good", color: "#22c55e" },
    { value: 5, emoji: "😍", label: "Excellent", color: "#10b981" },
  ];

  const handleEmojiClick = (value) => {
    setRating(value);
    // Pulse animation on selection
    const emojiElement = emojisRef.current[value - 1];
    if (emojiElement) {
      gsap.fromTo(
        emojiElement,
        { scale: 1 },
        { scale: 1.3, duration: 0.2, yoyo: true, repeat: 1, ease: "power2.inOut" }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating!", {
        duration: 3000,
        position: "top-center", 
      });
      return;
    }

    if (!feedbackMessage.trim()) {
      toast.error("Please provide your feedback message!", {
        duration: 3000,
        position: "top-center", 
      });
      return;
    }

    setLoading(true);

    const feedbackData = {
      rating: rating,
      feedbackMessage: feedbackMessage.trim(),
    };

    try {
      await submitFeedback(complaint.complainId, feedbackData);
      
      toast.success("Thank you for your feedback! 🎉", {
        duration: 3000,
        position: "top-center",
      });

      // Animate modal out (Exit to Bottom)
      gsap.to(modalRef.current, {
        y: "100%", 
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          onFeedbackSubmitted(complaint.complainId); 
          onClose();
        },
      });
      
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.error(error.message || "Failed to submit feedback. Please try again.", {
        duration: 4000,
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Animate modal out (Exit to Bottom)
    gsap.to(modalRef.current, {
      y: "100%", 
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
    });
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
      onComplete: onClose,
    });
  };

  if (!isOpen || !complaint) return null;

  return (
    <div
      ref={overlayRef}
      // 📐 HEIGHT/PADDING ADJUSTMENT: Decreased padding from p-0 sm:p-4 to p-2 sm:p-3
      className="fixed inset-0 z-50 flex items-end justify-center p-2 sm:p-3 backdrop-blur-md" 
      style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        // 📐 WIDTH ADJUSTMENT: Increased width from max-w-md to max-w-lg
        className="bg-white rounded-t-2xl shadow-2xl w-full max-w-lg border border-gray-200" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              Give Feedback
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Complaint ID: {complaint.complainId}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all duration-300 text-3xl leading-none"
            disabled={loading}
          >
            &times;
          </button>
        </div>

        {/* Complaint Title */}
        <div className="p-5 border-b bg-blue-50">
          <p className="text-sm font-semibold text-gray-800">{complaint.title}</p>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Rating Section */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-gray-700 mb-3 text-center">
              How would you rate our service?
            </label>
            <div className="flex justify-center gap-3">
              {ratingEmojis.map((item, index) => (
                <button
                  key={item.value}
                  ref={(el) => (emojisRef.current[index] = el)}
                  type="button"
                  onClick={() => handleEmojiClick(item.value)}
                  onMouseEnter={() => setHoveredRating(item.value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  disabled={loading}
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor:
                      rating >= item.value || hoveredRating >= item.value
                        ? item.color
                        : "#f8fafc",
                    border:
                      rating === item.value
                        ? `3px solid ${item.color}`
                        : "2px solid #e2e8f0",
                    boxShadow:
                      rating >= item.value || hoveredRating >= item.value
                        ? "0 4px 12px rgba(0,0,0,0.15)"
                        : "0 2px 6px rgba(0,0,0,0.08)",
                    transform:
                      rating >= item.value || hoveredRating >= item.value
                        ? "scale(1.1)"
                        : "scale(1)",
                  }}
                  title={item.label}
                >
                  {item.emoji}
                </button>
              ))}
            </div>
            {/* Rating Label */}
            {(rating > 0 || hoveredRating > 0) && (
              <p className="text-center mt-3 text-sm font-bold text-gray-700">
                {ratingEmojis.find((e) => e.value === (hoveredRating || rating))?.label}
              </p>
            )}
          </div>

          {/* Feedback Message */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Your Feedback
            </label>
            <textarea
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              placeholder="Share your experience with us..."
              rows="4"
              maxLength="500"
              required
              disabled={loading}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 resize-none text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">Your feedback helps us improve</p>
              <p className="text-xs text-gray-600 font-medium">
                {feedbackMessage.length}/500
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 p-5 border-t bg-gray-50 rounded-b-none"> 
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || rating === 0 || !feedbackMessage.trim()}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Feedback"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;