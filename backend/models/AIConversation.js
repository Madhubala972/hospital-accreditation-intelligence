const mongoose = require('mongoose');

const aiConversationSchema = new mongoose.Schema(
  {
    userId: { type: String, default: 'demo-user' },
    role: { type: String, default: 'Accreditation Officer' },
    messages: [
      {
        sender: { type: String, enum: ['user', 'assistant', 'system'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        contextInjected: { type: Object },
        functionCalled: { type: String },
        functionResult: { type: Object },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AIConversation', aiConversationSchema);
