
export const paymentService = {
  processPayment: async (amount: number, description: string) => {
    console.log(`Initialisation paiement Stripe: ${amount}$ pour ${description}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { success: true, transactionId: `TR-${Math.random().toString(36).substr(2, 9)}` };
  },

  getCommission: (amount: number) => {
    return amount * 0.15; // 15% de commission plateforme
  }
};
