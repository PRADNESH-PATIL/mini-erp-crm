interface Props {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: Props) {
  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";

  return (
    <div
      className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-3 rounded shadow-lg z-50 flex items-center gap-3`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="font-bold">
        &times;
      </button>
    </div>
  );
}