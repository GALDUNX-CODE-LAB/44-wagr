"use client";

import { useState, useEffect } from "react";
import { FaEnvelope, FaPlus, FaTimes, FaCheckCircle, FaClock, FaCommentDots } from "react-icons/fa";
import { getUserTickets, createTicket, Ticket, CreateTicketPayload } from "../../lib/api";
import { useUser } from "../../hooks/useUserData";
import { toast } from "sonner";

export default function SupportPage() {
  const { email } = useUser();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [formData, setFormData] = useState<CreateTicketPayload>({
    subject: "",
    message: "",
    email: email || "",
  });

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (email) {
      setFormData((prev) => ({ ...prev, email }));
    }
  }, [email]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await getUserTickets();
      setTickets(data || []);
    } catch (error: any) {
      console.error("Failed to load tickets:", error);
      toast.error(error?.response?.data?.error || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.subject.trim() || !formData.message.trim() || !formData.email.trim()) {
        toast.error("Please fill in all fields");
        return;
      }

      await createTicket(formData);
      toast.success("Ticket created successfully!");
      setFormData({ subject: "", message: "", email: email || "" });
      setShowCreateForm(false);
      loadTickets();
    } catch (error: any) {
      console.error("Failed to create ticket:", error);
      toast.error(error?.response?.data?.error || "Failed to create ticket");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-500/20 text-blue-400";
      case "responded":
        return "bg-green-500/20 text-green-400";
      case "closed":
        return "bg-gray-500/20 text-gray-400";
      case "unread":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <FaClock className="w-3 h-3" />;
      case "responded":
        return <FaCheckCircle className="w-3 h-3" />;
      case "closed":
        return <FaTimes className="w-3 h-3" />;
      case "unread":
        return <FaCommentDots className="w-3 h-3" />;
      default:
        return <FaClock className="w-3 h-3" />;
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1">Support Center</h1>
            <p className="text-white/60 text-xs sm:text-sm">Get help with your account and transactions</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#C8A2FF] text-black rounded-lg hover:bg-[#B892FF] transition-colors font-medium text-sm"
          >
            <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">New Ticket</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        {showCreateForm && (
          <div className="mb-4 bg-[#2a2a2a] rounded-lg p-4 sm:p-5 border border-white/10">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg sm:text-xl font-semibold">Create New Ticket</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 text-white/80">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-[#C8A2FF] text-white"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 text-white/80">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="w-full px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-[#C8A2FF] text-white"
                  placeholder="What can we help you with?"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 text-white/80">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-[#C8A2FF] text-white resize-none"
                  placeholder="Describe your issue in detail..."
                />
              </div>
              <div className="flex gap-2 sm:gap-3">
                <button
                  type="submit"
                  className="px-4 py-1.5 sm:px-6 sm:py-2 text-sm bg-[#C8A2FF] text-black rounded-lg hover:bg-[#B892FF] transition-colors font-medium"
                >
                  Submit Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-1.5 sm:px-6 sm:py-2 text-sm bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#C8A2FF]"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-8 sm:py-10 bg-[#2a2a2a] rounded-lg border border-white/10">
            <FaEnvelope className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-white/40" />
            <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">No tickets yet</h3>
            <p className="text-white/60 text-xs sm:text-sm mb-3 sm:mb-4">Create your first support ticket to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-[#C8A2FF] text-black rounded-lg hover:bg-[#B892FF] transition-colors font-medium"
            >
              Create Ticket
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div
                key={ticket._id}
                className="bg-[#2a2a2a] rounded-lg border border-white/10 overflow-hidden hover:border-white/20 transition-colors cursor-pointer"
                onClick={() => setSelectedTicket(selectedTicket?._id === ticket._id ? null : ticket)}
              >
                <div className="p-3 sm:p-4">
                  <div className="flex flex-col gap-2 sm:gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="text-sm sm:text-base font-semibold">{ticket.subject}</h3>
                        <span
                          className={`flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-medium ${getStatusColor(
                            ticket.status
                          )}`}
                        >
                          {getStatusIcon(ticket.status)}
                          <span className="hidden sm:inline">{ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}</span>
                          <span className="sm:hidden">{ticket.status.charAt(0).toUpperCase()}</span>
                        </span>
                      </div>
                      <p className="text-white/60 text-xs sm:text-sm mb-1.5 line-clamp-2">{ticket.message}</p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-white/50">
                        <span>#{ticket._id.slice(-6)}</span>
                        <span>•</span>
                        <span className="hidden sm:inline">{formatDate(ticket.createdAt)}</span>
                        <span className="sm:hidden">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        {ticket.responses.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{ticket.responses.length} response{ticket.responses.length > 1 ? "s" : ""}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedTicket?._id === ticket._id && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="space-y-3">
                        <div className="bg-black/20 rounded-lg p-3">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <span className="text-[10px] sm:text-xs font-medium text-white/60">Your Message</span>
                            <span className="text-[10px] sm:text-xs text-white/40">•</span>
                            <span className="text-[10px] sm:text-xs text-white/40">{formatDate(ticket.createdAt)}</span>
                          </div>
                          <p className="text-white/80 text-xs sm:text-sm whitespace-pre-wrap">{ticket.message}</p>
                        </div>

                        {ticket.responses.map((response, idx) => (
                          <div
                            key={idx}
                            className={`rounded-lg p-3 ${
                              response.sender === "admin"
                                ? "bg-[#C8A2FF]/10 border border-[#C8A2FF]/20"
                                : "bg-black/20"
                            }`}
                          >
                            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                              <span className="text-[10px] sm:text-xs font-medium text-white/60">
                                {response.sender === "admin" ? "Admin Response" : "Your Response"}
                              </span>
                              <span className="text-[10px] sm:text-xs text-white/40">•</span>
                              <span className="text-[10px] sm:text-xs text-white/40">
                                {formatDate(typeof response.date === "string" ? response.date : response.date.toString())}
                              </span>
                            </div>
                            <p className="text-white/80 text-xs sm:text-sm whitespace-pre-wrap">{response.message}</p>
                          </div>
                        ))}

                        {ticket.responses.length === 0 && (
                          <div className="text-center py-3 text-white/50 text-xs sm:text-sm">
                            No responses yet. Our support team will get back to you soon.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
