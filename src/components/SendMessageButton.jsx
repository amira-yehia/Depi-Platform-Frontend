import "./SendMessageButton.css";

export default function SendMessageButton({ label }) {
  return (
    <button className="smb" type="button">
      <i className="fas fa-paper-plane" aria-hidden="true" />
      {label}
    </button>
  );
}