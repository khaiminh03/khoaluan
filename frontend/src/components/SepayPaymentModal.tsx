interface SepayPaymentModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
}

const SepayPaymentModal: React.FC<SepayPaymentModalProps> = ({ open, onClose, orderId, amount }) => {
  const qrImageUrl = `https://qr.sepay.vn/img?acc=10001460847&bank=TPBank&amount=${amount}&des=don ${orderId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`don ${orderId}`);
    alert("Đã sao chép nội dung chuyển khoản!");
  };

  return (
    <div className={`fixed inset-0 bg-black/40 flex items-center justify-center z-50 ${open ? '' : 'hidden'}`}>
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Quét mã để chuyển khoản</h2>

        <img src={qrImageUrl} alt="QR code SePay" className="mx-auto max-w-xs rounded" />

        <div className="mt-4 text-sm">
          <p><strong>Số tiền:</strong> {amount.toLocaleString()} VND</p>
          <p className="flex items-center gap-2">
            <strong>Nội dung:</strong> <code>don {orderId}</code>
            <button
              onClick={handleCopy}
              className="ml-2 text-green-500 underline text-xs hover:text-green-400"
            >
              Sao chép
            </button>
          </p>
          <p className="text-red-600 mt-2"> Vui lòng chuyển đúng nội dung để hệ thống xác nhận đơn hàng.</p>
        </div>

        <button onClick={onClose} className="mt-6 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
          Đóng
        </button>
      </div>
    </div>
  );
};

export default SepayPaymentModal;
